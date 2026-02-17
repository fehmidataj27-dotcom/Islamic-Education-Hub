import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { ArrowRight, BookOpen, Users, Award, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">M</div>
            <span className="font-bold text-xl tracking-tight">Madrasa</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/api/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/api/login">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
              Master Islamic Sciences <br />
              <span className="text-primary">Anytime, Anywhere</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
              Comprehensive Darse Nizami curriculum, Hifz tracking, and AI-powered tutoring designed for the modern student.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/api/login">
                <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-xl shadow-primary/20">
                  Start Learning Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-2">
                View Curriculum
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
                    U{i}
                  </div>
                ))}
              </div>
              <p>Joined by 2,000+ students worldwide</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform rotate-12" />
            {/* Unsplash image: Islamic architecture or student reading */}
            <img
              src="https://images.unsplash.com/photo-1584286595398-a59f21d313f9?w=800&auto=format&fit=crop"
              alt="Student reading Quran"
              className="relative rounded-2xl shadow-2xl border border-white/10 rotate-2 hover:rotate-0 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to excel</h2>
            <p className="text-muted-foreground">A complete ecosystem for your spiritual and academic growth.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Darse Nizami Books", desc: "Full library of classical texts with translations and commentaries." },
              { icon: Users, title: "Live Classes", desc: "Interactive sessions with qualified scholars and teachers." },
              { icon: Award, title: "Progress Tracking", desc: "Monitor your Hifz, attendance, and quiz scores in real-time." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-12">Trusted by students from</h2>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for logos */}
             <div className="text-xl font-black">DARUL ULOOM</div>
             <div className="text-xl font-black">AL-AZHAR</div>
             <div className="text-xl font-black">MADINA UNIVERSITY</div>
          </div>
        </div>
      </section>
    </div>
  );
}
