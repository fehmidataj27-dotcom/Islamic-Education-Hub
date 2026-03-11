import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
export { passport };
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import createMemoryStore from "memorystore";
import { authStorage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000,
  });

  return session({
    secret: process.env.SESSION_SECRET || "default_secret_for_no_db_mode", // Fallback secret
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && process.env.REPL_ID ? true : false, // Insecure for local
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  console.log("[AUTH] Initializing setupAuth...");
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Common Local Strategy - register ALWAYS so it works on local and replit
  console.log("[AUTH] Registering 'local' strategy...");
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        let user = await authStorage.getUserByUsername(username);
        if (!user) {
          user = await authStorage.getUserByStudentId(username);
        }
        if (!user) {
          // Check by email as well
          const allUsers = await authStorage.getUsers();
          user = allUsers.find(u => u.email === username);
        }

        if (!user) {
          return done(null, false, { message: "Incorrect login credentials." });
        }

        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }

        // Return a normalized user object that matches what OIDC expects
        // OIDC expects user.claims.sub
        const normalizedUser = {
          ...user,
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role
          },
          expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 1 week
        };

        return done(null, normalizedUser);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Check if Replit-specific OIDC credentials exist
  if (!process.env.REPL_ID && !process.env.ISSUER_URL) {
    console.warn("Replit Auth credentials missing. OIDC Auth will be unavailable. Local Auth is active.");
    return;
  }

  try {
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    // Keep track of registered strategies
    const registeredStrategies = new Set<string>();

    // Helper function to ensure strategy exists for a domain
    const ensureStrategy = (domain: string) => {
      const strategyName = `replitauth:${domain}`;
      if (!registeredStrategies.has(strategyName)) {
        const strategy = new Strategy(
          {
            name: strategyName,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify
        );
        passport.use(strategy);
        registeredStrategies.add(strategyName);
      }
    };

    app.get("/api/login", (req, res, next) => {
      ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
  } catch (err) {
    console.error("Failed to setup Replit Auth OIDC:", err);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // If in mock mode (no REPL_ID), bypass auth or inject mock user
  if (!process.env.REPL_ID && !process.env.ISSUER_URL) {
    // Mock user if missing
    if (!req.user) {
      req.user = {
        claims: {
          sub: "mock-user-id",
          email: "fehmidatajhujra@gmail.com",
          first_name: "Super",
          last_name: "Admin",
          role: "admin",
          profile_image_url: "https://via.placeholder.com/150",
          exp: Math.floor(Date.now() / 1000) + 3600
        },
        role: "admin",
        access_token: "mock-token",
        refresh_token: "mock-refresh",
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };
    }
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const role = user.role || user.claims?.role;
  if (role?.toLowerCase() === 'admin') {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
};

export const isTeacherOrAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const role = user.role || user.claims?.role;
  if (role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'teacher') {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Teacher or Admin access required" });
};
