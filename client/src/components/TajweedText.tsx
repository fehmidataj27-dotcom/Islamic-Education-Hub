
import React from 'react';

interface TajweedTextProps {
    text: string;
    className?: string;
}

// ── Tajweed API color mapping ────────────────────────────────────────────────
const RULE_COLORS: Record<string, string> = {
    g: 'text-red-600', n: 'text-red-600', c: 'text-red-600', i: 'text-red-600',
    f: 'text-pink-500', a: 'text-pink-500', w: 'text-pink-500', u: 'text-pink-500',
    q: 'text-blue-700', p: 'text-blue-700',
    m: 'text-foreground', o: 'text-foreground', d: 'text-foreground',
    h: 'text-orange-400',
    l: 'text-yellow-600',
    // z = our special marker for Lafz ul-Jalalah (Allah's name) → always Pur green
    z: 'text-green-600',
};

// Heavy letters regex (Musta'liya + Ra Pur)
const HEAVY_REGEX = /([\u0600-\u06FF][\u064E\u064F]\u0631\u0652)|([خصضغطقظ]|\u0631[\u0651]?[\u064E\u064F\u064B\u064C\u0670])/g;

// Allah name regex (works on plain text)
const ALLAH_RE = /[\u0627\u0671]?\u0644\u0644[\u064B-\u065F\u0670]*\u0647[\u064B-\u065F\u0670]*/g;

/**
 * Pre-processes the raw Tajweed API text.
 * Identifies all characters that form "الله" (in plain text) and re-wraps
 * them with our special [Z[...] marker so they render green regardless of
 * how the API tagged them.
 */
export function injectAllahMarkers(rawText: string): string {
    // ── 1. Tokenise: split raw text into tagged segments and plain chars ──────
    type TagTok = { kind: 'tag'; raw: string; code: string; content: string };
    type CharTok = { kind: 'plain'; ch: string };
    type Tok = TagTok | CharTok;

    const tokens: Tok[] = [];
    const TAG_RE = /\[([a-z])(?::\d+)?\[([^\]]+)\]/g;
    let cur = 0;
    let tm: RegExpExecArray | null;

    while ((tm = TAG_RE.exec(rawText)) !== null) {
        // plain chars before this tag
        for (let i = cur; i < tm.index; i++) tokens.push({ kind: 'plain', ch: rawText[i] });
        tokens.push({ kind: 'tag', raw: tm[0], code: tm[1], content: tm[2] });
        cur = tm.index + tm[0].length;
    }
    for (let i = cur; i < rawText.length; i++) tokens.push({ kind: 'plain', ch: rawText[i] });

    // ── 2. Build plain text + per-char token reference ───────────────────────
    const chars: { tokIdx: number; charOff: number; ch: string }[] = [];
    tokens.forEach((tok, tokIdx) => {
        const content = tok.kind === 'tag' ? tok.content : tok.ch;
        for (let i = 0; i < content.length; i++) {
            chars.push({ tokIdx, charOff: i, ch: content[i] });
        }
    });

    const plainText = chars.map(c => c.ch).join('');

    // ── 3. Find Allah ranges in plain text ───────────────────────────────────
    const allahSet = new Set<number>();
    ALLAH_RE.lastIndex = 0;
    let am: RegExpExecArray | null;
    while ((am = ALLAH_RE.exec(plainText)) !== null) {
        const base = am[0].replace(/[\u064B-\u065F\u0670]/g, '');
        if (base.length >= 3) {
            // Check preceding vowel to determine if Pur (heavy)
            let isPur = true; // Default to Pur if start of text or unknown context
            let lookback = am.index - 1;
            while (lookback >= 0) {
                const prevChar = plainText[lookback];
                if (prevChar === '\u0650') { // Kasra (زیر)
                    isPur = false;
                    break;
                }
                if (prevChar === '\u064E' || prevChar === '\u064F' || prevChar === '\u0670') { // Fatha, Damma, or Standing Fatha
                    isPur = true;
                    break;
                }
                // Skip spaces and zero-width chars
                if (!/\s/.test(prevChar)) {
                    // If we find a non-vowel, non-space character, we should continue looking back if it's a letter
                    // usually the vowel is attached to the letter.
                    // If we find a letter without a vowel mark yet, we keep looking.
                }
                lookback--;
            }

            if (isPur) {
                // Find where the Lams start and the Ha ends
                // The match is: [Alif]? Lam Lam [Diac]* Ha [Diac]*
                const matchStr = am[0];
                let lamStart = 0;
                const firstChar = matchStr[0];
                if (firstChar === '\u0627' || firstChar === '\u0671') {
                    lamStart = 1;
                }

                // The heavy part is from the Lams up to (but not including) the Ha
                const haPos = matchStr.indexOf('\u0647');
                if (haPos !== -1) {
                    for (let i = lamStart; i < haPos; i++) {
                        allahSet.add(am.index + i);
                    }
                }
            }
        }
    }

    if (!allahSet.size) return rawText; // no Allah found or all are Tarqeeq – return unchanged

    // ── 4. Reconstruct raw text, replacing Allah chars with [Z[...] ──────────
    let result = '';
    let plainIdx = 0;

    tokens.forEach(tok => {
        if (tok.kind === 'plain') {
            if (allahSet.has(plainIdx)) {
                result += `[z[${tok.ch}]`;
            } else {
                result += tok.ch;
            }
            plainIdx++;
        } else {
            // Tagged segment: split content by Allah / non-Allah
            let seg = '';
            let inAllah = allahSet.has(plainIdx);
            let buf = '';
            const code = tok.code;

            for (let i = 0; i < tok.content.length; i++) {
                const isAllah = allahSet.has(plainIdx);
                if (isAllah !== inAllah) {
                    // flush buffer
                    if (buf) seg += inAllah ? `[z[${buf}]` : `[${code}[${buf}]`;
                    buf = tok.content[i];
                    inAllah = isAllah;
                } else {
                    buf += tok.content[i];
                }
                plainIdx++;
            }
            if (buf) seg += inAllah ? `[z[${buf}]` : `[${code}[${buf}]`;
            result += seg;
        }
    });

    return result;
}

/** Highlight Musta'liya / Ra Pur letters in a plain text chunk */
function renderHeavy(chunk: string, baseKey: string): React.ReactNode {
    if (!chunk) return null;
    const parts: React.ReactNode[] = [];
    let last = 0;
    HEAVY_REGEX.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = HEAVY_REGEX.exec(chunk)) !== null) {
        if (m.index > last) parts.push(chunk.slice(last, m.index));
        if (m[1]) {
            const ri = m[1].indexOf('\u0631');
            const ctx = m[1].slice(0, ri);
            const ra = m[1].slice(ri);
            parts.push(
                <span key={`${baseKey}-ra${m.index}`}>
                    <span className={/[خصضغطقظ]/.test(ctx) ? 'text-green-600' : ''}>{ctx}</span>
                    <span className="text-green-600">{ra}</span>
                </span>
            );
        } else {
            parts.push(<span key={`${baseKey}-h${m.index}`} className="text-green-600">{m[0]}</span>);
        }
        last = m.index + m[0].length;
    }
    if (last < chunk.length) parts.push(chunk.slice(last));
    return <React.Fragment>{parts}</React.Fragment>;
}

// ── Main Component ────────────────────────────────────────────────────────────
export const TajweedText: React.FC<TajweedTextProps> = ({ text, className }) => {
    // Pre-process: inject [Z[...] markers around Allah's name
    const processedText = injectAllahMarkers(text);
    const segments = processedText.split(/(\[[a-z](?::\d+)?\[[^\]]+\])/g);

    return (
        <span className={`font-quran ${className ?? ''}`} dir="rtl">
            {segments.map((seg, idx) => {
                const match = seg.match(/^\[([a-z])(?::\d+)?\[([^\]]+)\]$/);
                if (match) {
                    const color = RULE_COLORS[match[1]] ?? 'text-foreground';
                    return <span key={idx} className={color}>{match[2]}</span>;
                }
                // Plain text – apply heavy letter coloring
                return seg ? (
                    <React.Fragment key={idx}>{renderHeavy(seg, `${idx}`)}</React.Fragment>
                ) : null;
            })}
        </span>
    );
};
