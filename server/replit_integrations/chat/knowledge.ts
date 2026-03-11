
export const ISLAMIC_QA: { keywords: string[]; answer: string }[] = [
    // --- Greetings (MUST be first, checked before topic keywords) ---
    {
        keywords: ["assalamu alaikum", "assalam o alikum", "assalamualaikum", "salam alaikum", "wa alaikum", "assalam", "alikum"],
        answer: "Wa Alaikum Assalam wa Rahmatullahi wa Barakatuh! 🌙\n\nWelcome! I am your Islamic Learning Assistant. I can help you with:\n\n📖 Quran & Tajweed rules\n🕌 Salah (Prayer) & Wudu\n🤲 Duas & Supplications\n🕋 Pillars of Islam & Iman\n📚 Hadith & Sunnah\n🌙 Ramadan, Zakat & Hajj\n👤 Prophet Muhammad (SAW)\n📜 Islamic History & Fiqh\n\nWhat would you like to learn today?"
    },
    {
        keywords: ["hello", "hi ", "hey ", "good morning", "good evening", "how are you"],
        answer: "Assalamu Alaikum! 🌙 Welcome to the Islamic Learning Hub! I'm here to assist you with Quran, Tajweed, Salah, Duas, and all things Islamic.\n\nWhat topic would you like to explore today?"
    },

    // --- Tajweed ---
    {
        keywords: ["tajweed", "recitation rules", "pronunciation rule", "quran pronunciation"],
        answer: "Tajweed (تجوید) means 'to improve' and refers to the rules of proper Quranic recitation. Key rules include:\n\n🔤 **Ghunnah** – Nasal sound held for 2 counts (ن or م with shadda)\n🤫 **Ikhfa** – Concealing Noon Sakinah before 15 letters\n🔄 **Idgham** – Merging Noon Sakinah into the next letter (with/without ghunnah)\n↔️ **Iqlab** – Changing Noon Sakinah to Meem before ب\n📢 **Qalqalah** – Echoing bounce on 5 letters: ق ط ب ج د\n📏 **Madd** – Lengthening vowels for 2, 4, or 6 counts\n⚡ **Qalqalah Kubra** – Strong echo at pausing on Qalqalah letters\n\nStart with Al-Fatihah with a qualified teacher. The Prophet (SAW) said: 'The best of you are those who learn the Quran and teach it.' (Bukhari)"
    },
    {
        keywords: ["ghunnah", "nasal sound"],
        answer: "Ghunnah (غنة) is a nasal sound produced from the nose for exactly 2 counts (harakah). It occurs on:\n• Noon with Shadda (نّ)\n• Meem with Shadda (مّ)\n• Noon Sakinah in Ikhfa and Idgham with Ghunnah\n• Tanwin in Ikhfa and Idgham with Ghunnah\n\nPractice by humming through your nose — that is the sound of Ghunnah!"
    },
    {
        keywords: ["qalqalah", "echo", "bouncing"],
        answer: "Qalqalah (قلقلة) means a 'vibration' or 'echoing bounce' applied to 5 letters when they have Sukoon: ق ط ب ج د (Remember: قطبجد).\n\n• **Qalqalah Sughra** (Minor) – Letter has sukoon mid-word: light bounce\n• **Qalqalah Kubra** (Major) – You pause on the letter at end of word: strong bounce\n\nExample: Surah Al-Ikhlas — 'قُلْ هُوَ اللَّهُ أَحَدٌ' — pause on 'أَحَدٌ' for Qalqalah Kubra."
    },
    {
        keywords: ["madd", "lengthening", "extension"],
        answer: "Madd (مد) means lengthening a vowel sound. Types:\n• **Madd Asli / Tabee'i** – Natural lengthening, 2 counts (alif, waw, ya with vowels)\n• **Madd Muttasil** – Madd letter followed by Hamzah in same word: 4-5 counts\n• **Madd Munfasil** – Madd letter followed by Hamzah in next word: 4-5 counts\n• **Madd Lazim** – Madd followed by Shaddah or Sukoon: 6 counts (obligatory)\n• **Madd Arid Lil Sukoon** – Pausing creates sukoon after madd: 2, 4, or 6 counts"
    },

    // --- Salah ---
    {
        keywords: ["salah", "namaz", "prayer time", "5 prayer", "five prayer", "daily prayer", "how to pray", "rak'ah", "rakah"],
        answer: "Salah (الصلاة) is the 2nd Pillar of Islam — 5 obligatory daily prayers:\n\n🌅 **Fajr** – 2 fard rak'ahs (before sunrise)\n☀️ **Dhuhr** – 4 fard rak'ahs (midday)\n🌤️ **Asr** – 4 fard rak'ahs (afternoon)\n🌆 **Maghrib** – 3 fard rak'ahs (after sunset)\n🌙 **Isha** – 4 fard rak'ahs (night)\n\nThe Prophet (SAW) said: 'Between a man and disbelief is the abandonment of prayer.' (Muslim)\n\nEach prayer has Sunnah rak'ahs before/after. Would you like details on how to perform a specific prayer?"
    },
    {
        keywords: ["wudu", "ablution", "purity", "tahara", "ghusl", "cleanliness"],
        answer: "Wudu (وضوء) is required before every Salah. Steps:\n\n1️⃣ **Niyyah** (Intention) in your heart\n2️⃣ Say **Bismillah**\n3️⃣ Wash **hands** 3 times\n4️⃣ Rinse **mouth** 3 times\n5️⃣ Clean **nose** 3 times\n6️⃣ Wash **face** 3 times\n7️⃣ Wash **arms to elbows** 3 times (right first)\n8️⃣ Wipe **head** once (from forehead to back)\n9️⃣ Wipe **ears** (inside and back)\n🔟 Wash **feet** 3 times (right first)\n\n**Wudu is broken by:** using the toilet, passing gas, deep sleep, loss of consciousness, or flowing blood.\n\nThe Prophet (SAW) said: 'Cleanliness is half of faith.' (Muslim)"
    },
    {
        keywords: ["fajr", "morning prayer", "dawn prayer"],
        answer: "Fajr (الفجر) is the dawn prayer:\n• 2 Sunnah Muakkada rak'ahs (before fard)\n• 2 Fard rak'ahs\n• Time: After true dawn until just before sunrise\n\n'The two rak'ahs of Fajr are better than the world and everything in it.' (Muslim)\n\nFajr is one of the hardest prayers to maintain but one of the most rewarded. May Allah make it easy for you! 🌅"
    },

    // --- Quran ---
    {
        keywords: ["quran", "holy quran", "surah", "ayah", "verse", "al fatihah", "al-fatihah"],
        answer: "The Holy Quran (القرآن الكريم):\n\n📖 **114 Surahs** | 6,236 Ayahs | 30 Juz (Parts)\n📏 Longest Surah: Al-Baqarah (286 ayahs)\n📝 Shortest Surah: Al-Kawthar (3 ayahs)\n⏳ Revealed over **23 years** to the Prophet (SAW)\n🌟 First revelation: Surah Al-Alaq (96) — 'Iqra!' (Read!)\n\n'Indeed, it is We who sent down the Quran and indeed, We will be its guardian.' (15:9)\n\nThe best act of worship with the Quran: Read it, understand it, memorize it, and act upon it. Would you like to know about a specific Surah?"
    },
    {
        keywords: ["memorize quran", "hifz", "hafiz", "memorisation"],
        answer: "Hifz (حفظ) — Memorizing the Quran is one of the greatest achievements in Islam.\n\n📌 **Tips for Memorization:**\n1. Start with Juz Amma (30th part) — shorter surahs\n2. Memorize after Fajr when the mind is fresh\n3. Recite to a qualified teacher (Hafiz) regularly\n4. Revise previously memorized portions daily\n5. Understand the meaning to help retention\n6. Be consistent — even 1 new ayah per day\n\n'The one who is proficient in the Quran will be with the noble righteous scribes.' (Bukhari)\n\nMay Allah make you among the People of the Quran! 🤲"
    },

    // --- Zakat ---
    {
        keywords: ["zakat", "charity", "nisab", "2.5%", "poor due"],
        answer: "Zakat (الزكاة) is the 3rd Pillar of Islam — obligatory annual purification of wealth.\n\n💰 **Rate:** 2.5% of savings/wealth\n⚖️ **Nisab:** Must own at least 87.48g of gold or 612.36g of silver in equivalent wealth\n📅 **Hawl:** Wealth must be held for one full lunar year\n\n**Who receives Zakat (8 categories, Quran 9:60):**\n• The poor and needy\n• Those in debt\n• Travelers in need\n• Those working to collect/distribute Zakat\n• New Muslims whose hearts are to be reconciled\n• Freeing slaves (historically)\n• In the cause of Allah\n\nZakat purifies your remaining wealth: 'Take from their wealth a charity to purify and cleanse them.' (9:103)"
    },

    // --- Ramadan ---
    {
        keywords: ["ramadan", "fasting", "sawm", "roza", "iftar", "suhoor", "tarawih"],
        answer: "Ramadan (رمضان) is the blessed 9th month of the Islamic calendar:\n\n🌙 **Sawm (Fasting)** – 4th Pillar of Islam\n⏰ Fast from **Fajr to Maghrib**: no food, drink, or marital relations\n🌟 **Laylat al-Qadr** (Night of Power) in the last 10 nights — better than 1000 months!\n🕌 **Tarawih** – Special night prayers in Ramadan\n💎 **Suhoor** (pre-dawn meal) – Sunnah and blessed\n🍽️ **Iftar** – Break fast preferably with dates and water\n\n'Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.' (Bukhari & Muslim)\n\nAre you asking about fasting rules, Tarawih, or Laylat al-Qadr?"
    },

    // --- Hajj & Umrah ---
    {
        keywords: ["hajj", "pilgrimage", "makkah", "kaaba", "umrah", "ihram", "tawaf", "arafat"],
        answer: "Hajj (الحج) is the 5th Pillar of Islam — obligatory pilgrimage to Makkah once in a lifetime (if able).\n\n🕋 **Key Rituals:**\n1. **Ihram** – Sacred state entered at Miqat\n2. **Tawaf** – Circling the Ka'bah 7 times\n3. **Sa'i** – Walking between Safa & Marwa 7 times\n4. **Arafat** – MOST IMPORTANT: Standing on 9th Dhul Hijjah\n5. **Muzdalifah** – Collecting pebbles overnight\n6. **Rami** – Stoning the Jamarat (3 pillars)\n7. **Sacrifice** – Udhiyah/Qurbani\n8. **Halq/Taqseer** – Shaving/trimming hair\n\n**Umrah** is the 'lesser pilgrimage' — can be performed any time\n\n'Whoever performs Hajj and does not commit sin or obscenity will return as the day his mother gave birth to him.' (Bukhari)"
    },

    // --- Prophet Muhammad (SAW) ---
    {
        keywords: ["prophet", "muhammad", "nabi", "rasool", "pbuh", "saw"],
        answer: "Prophet Muhammad (صلى الله عليه وسلم):\n\n📅 **Born:** 570 CE, Makkah (Year of the Elephant)\n💍 **First Marriage:** Khadijah (RA) at age 25\n📖 **First Revelation:** Age 40 in Cave Hira — 'Iqra!' (Read!)\n🕌 **Hijra (Migration):** 622 CE from Makkah to Madinah\n💛 **Character:** The Quran was his character — patient, merciful, honest\n📅 **Passed Away:** 63 years old, 12 Rabi al-Awwal 11 AH in Madinah\n\nHe is **Khatam an-Nabiyyeen** — the Seal of all Prophets.\n\n'I was sent to perfect good moral character.' (Ahmad)\n\n'Send salawat on me, for it is light in your grave and on the Bridge.' (Tabarani)\n\nSend Salawat: اللهم صل على محمد"
    },

    // --- Pillars of Islam ---
    {
        keywords: ["pillars of islam", "five pillars", "5 pillars", "arkaan al islam", "arkaan"],
        answer: "The 5 Pillars of Islam (أركان الإسلام):\n\n1️⃣ **Shahada** – 'There is no god but Allah, and Muhammad is His Messenger'\n2️⃣ **Salah** – 5 daily obligatory prayers\n3️⃣ **Zakat** – Annual charity (2.5% of savings)\n4️⃣ **Sawm** – Fasting in Ramadan\n5️⃣ **Hajj** – Pilgrimage to Makkah once in a lifetime (if able)\n\nThe Prophet (SAW) said: 'Islam is built on five [pillars]...' (Bukhari & Muslim)\n\nAll 5 pillars are obligatory (fard) for every adult Muslim. Would you like to know more about any specific pillar?"
    },

    // --- Pillars of Iman ---
    {
        keywords: ["iman", "faith", "belief", "aqeedah", "pillars of iman", "six pillars"],
        answer: "The 6 Pillars of Iman (أركان الإيمان):\n\n1️⃣ Belief in **Allah** — His Oneness (Tawhid)\n2️⃣ Belief in **Angels** — created from light, they worship Allah\n3️⃣ Belief in the **Divine Books** — Quran, Injeel, Torah, Zabur, Suhuf\n4️⃣ Belief in the **Prophets & Messengers** — from Adam to Muhammad (SAW)\n5️⃣ Belief in the **Day of Judgment** — resurrection, reckoning, paradise, hellfire\n6️⃣ Belief in **Divine Decree (Qadar)** — good and bad are from Allah's decree\n\n'The Messenger believes in what was revealed to him from his Lord, as do the believers.' (Al-Baqarah 2:285)"
    },

    // --- Hadith & Sunnah ---
    {
        keywords: ["hadith", "sunnah", "tradition", "bukhari", "muslim", "tirmidhi", "abu dawud"],
        answer: "Hadith (حديث) are recorded sayings and actions of the Prophet Muhammad (SAW). The Sunnah is his way of life.\n\n📚 **Major Hadith Collections (Kutub as-Sittah):**\n• **Sahih Bukhari** – Most authentic collection (7,563 hadiths)\n• **Sahih Muslim** – Second most authentic (7,500 hadiths)\n• **Sunan Abu Dawud** – Focus on legal rulings\n• **Jami at-Tirmidhi** – Includes hadith grading explanations\n• **Sunan an-Nasa'i** – Known for strictness in narrators\n• **Sunan Ibn Majah** – Completes the six books\n\nThe Quran + Sunnah = Primary sources of Islamic law (Shariah).\n\n'Whatever the Messenger gives you, take it; and whatever he forbids, refrain from it.' (59:7)"
    },

    // --- Dua ---
    {
        keywords: ["dua", "supplication", "ask allah", "dua for", "prayer for", "make dua"],
        answer: "Dua (دعاء) is the weapon of the believer and one of the greatest forms of worship.\n\n🤲 **Allah says:** 'Call upon Me; I will respond to you.' (40:60)\n\n⭐ **Best Times for Dua:**\n• Last third of the night (Tahajjud time)\n• Between Adhan and Iqamah\n• During Sujood (prostration)\n• While fasting before Iftar\n• Fridays (especially the last hour before Asr)\n• During rain\n• After obligatory prayers\n\n📝 **How to Make Dua:**\n1. Begin with Bismillah\n2. Send Salawat on the Prophet (SAW)\n3. Praise and glorify Allah\n4. Ask sincerely with full hope\n5. End with Salawat again and Ameen\n\n'Allah is shy and generous; He is ashamed to turn away a servant who raises his hands to Him empty.' (Abu Dawud)"
    },

    // --- Islamic History ---
    {
        keywords: ["islamic history", "caliphate", "sahaba", "companions", "khulafa", "abu bakr", "umar", "uthman", "ali"],
        answer: "The Rightly Guided Caliphs (الخلفاء الراشدون) after the Prophet (SAW):\n\n1️⃣ **Abu Bakr As-Siddiq (RA)** – 632-634 CE: Fought apostasy wars, compiled Quran\n2️⃣ **Umar ibn al-Khattab (RA)** – 634-644 CE: Expanded Islamic empire, established Bayt al-Mal\n3️⃣ **Uthman ibn Affan (RA)** – 644-656 CE: Standardized the Quran into one script\n4️⃣ **Ali ibn Abi Talib (RA)** – 656-661 CE: Cousin and son-in-law of the Prophet\n\nThis period is called the Khilafah Rashidah (Rightly Guided Caliphate) — a model of Islamic governance."
    },

    // --- Arabic ---
    {
        keywords: ["arabic", "language", "grammar", "learn arabic", "arabic letters"],
        answer: "Arabic (العربية) is the language of the Quran and the 5th most spoken language in the world.\n\n📝 **Arabic Alphabet:** 28 letters, written right-to-left\n🌿 **Word Roots:** Usually 3-letter roots carrying core meaning\n📖 **Grammar Terms:** Ism (noun), Fi'l (verb), Harf (particle)\n\n**For Beginners:**\n• Start with Arabic letter recognition and pronunciation\n• Learn basic Quranic vocabulary (top 100 words cover ~50% of Quran!)\n• Resources: Bayyinah TV (free), Madinah Arabic Reader, LearnArabicwithMaha\n\n'We have sent it down as an Arabic Quran so that you may understand.' (12:2)\n\nEven learning 1-2 new Arabic words daily will transform your Quran reading!"
    },

    // --- Duas (specific) ---
    {
        keywords: ["morning dua", "evening dua", "ayatul kursi", "al fatihah meaning", "istikhara"],
        answer: "Here are some important daily Duas:\n\n🌅 **Morning Dua (after Fajr):** أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ\n'We have reached the morning and the whole kingdom belongs to Allah.' (Abu Dawud)\n\n🌙 **Evening Dua (after Asr/Maghrib):** أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ  \n'We have reached the evening and the whole kingdom belongs to Allah.'\n\n📿 **Ayatul Kursi** (Al-Baqarah 2:255) — Whoever recites it after each prayer, nothing prevents them from entering Paradise except death. (An-Nasa'i)\n\n🤲 **Dua Istikhara** — For seeking Allah's guidance in decisions. Pray 2 nawafil, then make the Istikhara dua requesting Allah to guide you to what is best."
    },

    // --- General Islamic topics ---
    {
        keywords: ["taqwa", "god consciousness", "fear allah", "piety"],
        answer: "Taqwa (تقوى) means God-consciousness, piety, and mindfulness of Allah in all actions.\n\nThe Quran mentions taqwa over 250 times. It means:\n• Being aware that Allah sees all your actions\n• Obeying Allah's commands and avoiding His prohibitions\n• Having consciousness of accountability on the Day of Judgment\n\n'And whoever fears Allah — He will make for him a way out and will provide for him from where he does not expect.' (65:2-3)\n\nTaqwa is the best provision: 'Indeed, the most noble of you in the sight of Allah is the most righteous (having Taqwa) of you.' (49:13)"
    },
    {
        keywords: ["sabr", "patience", "test", "trial", "hardship", "difficulty"],
        answer: "Sabr (صبر) — Patience is one of the highest virtues in Islam.\n\n'Indeed, Allah is with the patient.' (2:153)\n'Indeed, with hardship will be ease. Indeed, with hardship will be ease.' (94:5-6)\n\nTypes of Sabr:\n1. **Sabr alaa Ta'ah** – Patience in performing acts of worship\n2. **Sabr an il-Ma'siya** – Patience in avoiding sins\n3. **Sabr alaa Qadar** – Patience with Allah's decree (trials)\n\nThe Prophet (SAW) said: 'No fatigue, disease, sorrow, sadness, hurt, or distress befalls a Muslim, even if it is the prick of a thorn, but Allah expiates his sins because of it.' (Bukhari)\n\nKeep making dua and trust in Allah's perfect plan. 🤲"
    }
];

export const QUOTES = [
    "Allah says in the Quran: 'Indeed, with hardship will be ease.' (94:6). Whatever you are facing, know that Allah is with you.",
    "The Prophet (SAW) said: 'Seeking knowledge is an obligation upon every Muslim.' (Ibn Majah).",
    "Allah says: 'My Lord, increase me in knowledge.' (20:114). That is a beautiful dua for you to make daily.",
    "The Prophet (SAW) said: 'Whoever travels a path in search of knowledge, Allah makes easy for him a path to Paradise.' (Muslim).",
    "The Prophet (SAW) said: 'The best of you are those who learn the Quran and teach it.' (Bukhari)",
    "The Prophet (SAW) said: 'Cleanliness is half of faith.' (Muslim)",
    "Allah says: 'And speak to people good [words].' (2:83)",
    "The Prophet (SAW) said: 'None of you truly believes until he loves for his brother what he loves for himself.' (Bukhari)",
    "Allah says: 'And whoever relies upon Allah — then He is sufficient for him.' (65:3)",
    "The Prophet (SAW) said: 'Make things easy, do not make them difficult.' (Bukhari)",
    "Allah says: 'So remember Me; I will remember you.' (2:152)",
    "The Prophet (SAW) said: 'The most beloved of deeds to Allah are those done consistently, even if they are few.' (Bukhari)"
];

export function getLocalIslamicAnswer(message: string): string | null {
    const lower = message.toLowerCase().trim();

    // Check greetings FIRST (before other keywords to avoid mismatches)
    const greetingEntry = ISLAMIC_QA[0];
    if (greetingEntry.keywords.some(k => lower.includes(k))) {
        return greetingEntry.answer;
    }
    const helloEntry = ISLAMIC_QA[1];
    if (helloEntry.keywords.some(k => lower.includes(k))) {
        return helloEntry.answer;
    }

    // Then check all other topics
    for (let i = 2; i < ISLAMIC_QA.length; i++) {
        const qa = ISLAMIC_QA[i];
        if (qa.keywords.some(k => lower.includes(k))) {
            return qa.answer;
        }
    }
    return null;
}

export function getRandomIslamicQuote(): string {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
