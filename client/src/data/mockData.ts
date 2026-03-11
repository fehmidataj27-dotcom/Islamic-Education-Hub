import {
    Book,
    Video,
    Trophy,
    Calendar,
    CheckCircle2,
    Users,
    CreditCard,
    MessageSquare,
    FileText,
    BrainCircuit,
    Activity,
    LogOut,
    User as UserIcon,
    Mail,
    Lock,
    Eye,
    EyeOff
} from "lucide-react";

export const mockUsers = [
    {
        id: 1,
        firstName: "Student",
        lastName: "User",
        email: "student@test.com",
        role: "student",
        password: "123",
        profileImageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Student"
    },
    {
        id: 2,
        firstName: "Parent",
        lastName: "User",
        email: "parent@test.com",
        role: "parent",
        password: "123",
        profileImageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Parent"
    },
    {
        id: 3,
        firstName: "Teacher",
        lastName: "User",
        email: "teacher@test.com",
        role: "teacher",
        password: "123",
        profileImageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Teacher"
    },
    {
        id: 4,
        firstName: "Admin",
        lastName: "User",
        email: "admin@test.com",
        role: "admin",
        password: "123",
        profileImageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Admin"
    }
];

export const stories = [
    {
        id: 1,
        title: { en: "Prophet Yunus (AS) and the Whale", ur: "حضرت یونس (ع) اور وہیل" },
        category: { en: "Prophets", ur: "انبیاء" },
        content: {
            en: "Prophet Yunus (AS) was sent by Allah to the people of Nineveh, a great city in Iraq. He called them to worship Allah alone and abandon their idols. When they did not listen, he left them in frustration without Allah's permission.\n\nAllah caused a mighty storm to overtake the ship he was sailing on. The sailors cast lots to determine who among them was causing bad luck, and the lot fell on Yunus (AS). He was thrown into the sea and swallowed by a great whale.\n\nInside the whale, in the darkness of the deep ocean, Yunus (AS) called out: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.' (Quran 21:87). He repented sincerely and praised Allah continuously.\n\nAllah accepted his repentance and commanded the whale to release him onto a barren shore. Allah caused a tree to grow over him for shade, and Yunus (AS) recovered. When he returned to Nineveh, he found that the people had already repented upon seeing signs of punishment approaching. 100,000 people or more believed, and they were saved.\n\nThis story teaches us that sincere repentance is always accepted by Allah, no matter how desperate the situation. It also teaches us never to give up our mission without Allah's command.",
            ur: "حضرت یونس (ع) کو اللہ نے نینوا کے لوگوں کی طرف بھیجا، جو عراق کا ایک بڑا شہر تھا۔ انہوں نے لوگوں کو اللہ کی عبادت اور بتوں کو چھوڑنے کی دعوت دی۔ جب لوگوں نے نہ سنا، تو وہ اللہ کی اجازت کے بغیر غصے میں چھوڑ کر چلے گئے۔\n\nاللہ نے ان کے جہاز پر ایک طوفان بھیجا۔ ملاحوں نے قرعہ ڈالا اور قرعہ یونس (ع) کے نام نکلا۔ انہیں سمندر میں پھینکا گیا اور ایک بڑی مچھلی نے انہیں نگل لیا۔\n\nمچھلی کے اندر، سمندر کی گہرائیوں میں، حضرت یونس (ع) نے پکارا: 'تیرے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ظالموں میں سے تھا۔' (قرآن 21:87)۔ انہوں نے سچی توبہ کی۔\n\nاللہ نے ان کی توبہ قبول کی اور مچھلی کو حکم دیا کہ انہیں ساحل پر چھوڑ دے۔ اللہ نے ایک درخت اگا کر ان کو سایہ دیا اور وہ صحتیاب ہوگئے۔ واپس نینوا گئے تو لوگ پہلے ہی توبہ کر چکے تھے اور ایک لاکھ سے زیادہ لوگ ایمان لے آئے۔\n\nیہ کہانی ہمیں سکھاتی ہے کہ سچی توبہ ہمیشہ قبول ہوتی ہے، چاہے حالات کتنے بھی مشکل ہوں۔"
        },
        image: "/src/assets/images/islamic_pattern_hero.png"
    },
    {
        id: 2,
        title: { en: "The Honest Merchant", ur: "ایماندار تاجر" },
        category: { en: "Moral Values", ur: "اخلاقی اقدار" },
        content: {
            en: "In a bustling marketplace of ancient Arabia, there lived a merchant named Salih. Unlike others, Salih never cheated in his measurements. He always gave full weight and was honest about the quality of his goods, even if it meant selling them for less profit.\n\nOne day, a wealthy man came to buy a large quantity of dates. Salih told him honestly that some of the dates were slightly dry and not his best stock, even though he could have sold them for full price without anyone knowing. The wealthy man, impressed by his honesty, bought everything at the asking price and recommended Salih to all his friends.\n\nSoon, Salih's business grew enormously because of his reputation for honesty. People came from distant towns to trade with him. He became wealthy, but more importantly, he was respected and trusted by everyone.\n\nThe Prophet Muhammad (SAW) said: 'The truthful, trustworthy merchant will be with the Prophets, the truthful, and the martyrs on the Day of Resurrection.' (Tirmidhi)\n\nThis story reminds us that honesty in business is not just a moral virtue — it is a path to success in this world and the next.",
            ur: "قدیم عرب کے ایک بازار میں صالح نامی ایک تاجر رہتا تھا۔ دوسروں کے برعکس، صالح کبھی تول میں غلطی نہیں کرتا تھا۔ وہ ہمیشہ پورا وزن دیتا اور مال کی اصل حالت بتاتا، چاہے اس سے نفع کم ہوتا۔\n\nایک دن ایک امیر آدمی بڑی مقدار میں کھجوریں خریدنے آیا۔ صالح نے اسے بتایا کہ کچھ کھجوریں تھوڑی خشک ہیں، حالانکہ وہ چپ رہ کر مکمل قیمت وصول کر سکتا تھا۔ امیر آدمی اس کی ایمانداری سے متاثر ہوا اور اپنے سب دوستوں کو بھیجا۔\n\nجلد ہی صالح کا کاروبار بڑھ گیا۔ دور دور سے لوگ اس کے ساتھ تجارت کرنے آتے۔ وہ امیر ہوا اور اس سے بھی زیادہ قابل احترام۔\n\nنبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'سچا اور امانتدار تاجر قیامت کے دن انبیاء، صدیقین اور شہداء کے ساتھ ہوگا۔' (ترمذی)"
        },
        image: "/src/assets/images/islamic_pattern_dark.png"
    },
    {
        id: 3,
        title: { en: "Kindness to Parents", ur: "والدین کے ساتھ حسن سلوک" },
        category: { en: "Family", ur: "خاندان" },
        content: {
            en: "A man once came to the Prophet Muhammad (SAW) and asked: 'O Messenger of Allah, who among people is most deserving of my good company?' The Prophet said: 'Your mother.' The man asked: 'Then who?' The Prophet said: 'Your mother.' He asked again: 'Then who?' The Prophet said: 'Your mother.' He asked once more: 'Then who?' Only then did the Prophet say: 'Your father.' (Bukhari & Muslim)\n\nThis hadith shows that the mother deserves the greatest portion of a child's kindness — three times that of the father, because of the hardship of pregnancy, childbirth, and nursing.\n\nAllah says in the Quran: 'Your Lord has decreed that you worship none but Him, and that you be kind to parents. Whether one or both of them attain old age in your life, say not to them a word of contempt, nor repel them, but address them in terms of honor.' (Quran 17:23)\n\nA young man named Uways al-Qarni was so devoted to his mother that he could not travel to meet the Prophet (SAW) because she needed him at home. The Prophet (SAW) praised him and said: 'He is the best of the Tabi'een.'\n\nRemember: Paradise lies at the feet of mothers. Every act of kindness to our parents is an act of worship to Allah.",
            ur: "ایک شخص نبی کریم صلی اللہ علیہ وسلم کے پاس آیا اور پوچھا: 'یا رسول اللہ! میرے حسن سلوک کا سب سے زیادہ مستحق کون ہے؟' آپ نے فرمایا: 'تمہاری ماں۔' اس نے پوچھا: 'پھر کون؟' فرمایا: 'تمہاری ماں۔' پھر پوچھا: 'پھر کون؟' فرمایا: 'تمہاری ماں۔' پھر پوچھا: 'پھر کون؟' تب فرمایا: 'تمہارا باپ۔' (بخاری و مسلم)\n\nاس حدیث سے پتہ چلتا ہے کہ ماں کا حق باپ سے تین گنا زیادہ ہے۔\n\nاللہ تعالیٰ قرآن میں فرماتا ہے: 'تمہارے رب نے حکم دیا ہے کہ صرف اسی کی عبادت کرو اور والدین کے ساتھ حسن سلوک کرو۔ اگر ان میں سے ایک یا دونوں بڑھاپے کو پہنچ جائیں تو انہیں اف تک نہ کہو۔' (قرآن 17:23)"
        },
        image: "/src/assets/images/mosque_silhouette.png"
    }
];

export const dailyDuas = [
    {
        id: 1,
        title: { en: "Before Eating", ur: "کھانے سے پہلے" },
        arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
        transliteration: "Bismillahi wa 'ala barakatillah",
        translation: {
            en: "In the name of Allah and with the blessings of Allah",
            ur: "اللہ کے نام سے اور اللہ کی برکت کے ساتھ"
        }
    },
    {
        id: 2,
        title: { en: "After Eating", ur: "کھانے کے بعد" },
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
        transliteration: "Alhamdulillahilladzi at'amana wa saqana wa ja'alana muslimin",
        translation: {
            en: "All praise is due to Allah who fed us and gave us drink and made us Muslims",
            ur: "تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں کھلایا، پلایا اور مسلمان بنایا"
        }
    },
    {
        id: 3,
        title: { en: "Before Sleeping", ur: "سونے سے پہلے" },
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amutu wa ahya",
        translation: {
            en: "In Your name, O Allah, I die and I live",
            ur: "اے اللہ! تیرے نام سے مرتا اور جیتا ہوں"
        }
    },
    {
        id: 4,
        title: { en: "Upon Waking Up", ur: "بیدار ہونے پر" },
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        transliteration: "Alhamdulillahilladzi ahyana ba'da ma amatana wa ilayhin-nushur",
        translation: {
            en: "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection",
            ur: "تمام تعریفیں اللہ کے لیے جس نے ہمیں مارنے کے بعد زندہ کیا اور اسی کی طرف اٹھنا ہے"
        }
    },
    {
        id: 5,
        title: { en: "Entering the Masjid", ur: "مسجد میں داخل ہوتے وقت" },
        arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        transliteration: "Allahumma iftah li abwaba rahmatik",
        translation: {
            en: "O Allah, open for me the doors of Your mercy",
            ur: "اے اللہ! میرے لیے اپنی رحمت کے دروازے کھول دے"
        }
    },
    {
        id: 6,
        title: { en: "Leaving the Home", ur: "گھر سے نکلتے وقت" },
        arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "Bismillahi tawakkaltu 'alallahi wa la hawla wa la quwwata illa billah",
        translation: {
            en: "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah",
            ur: "اللہ کے نام سے، اللہ پر بھروسہ کیا، اور اللہ کے بغیر کوئی طاقت و قوت نہیں"
        }
    },
    {
        id: 7,
        title: { en: "Dua for Studying", ur: "پڑھتے وقت کی دعا" },
        arabic: "رَبِّ زِدْنِي عِلْمًا",
        transliteration: "Rabbi zidni 'ilma",
        translation: {
            en: "My Lord, increase me in knowledge",
            ur: "اے میرے رب! مجھے علم میں اضافہ فرما"
        }
    },
    {
        id: 8,
        title: { en: "Dua for Anxiety & Worry", ur: "پریشانی کی دعا" },
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
        transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
        translation: {
            en: "O Allah, I seek refuge in You from anxiety and sorrow",
            ur: "اے اللہ! میں پریشانی اور غم سے تیری پناہ مانگتا ہوں"
        }
    }
];

export const dictionaryWords = [
    {
        id: 1,
        word: "صَلَاة",
        meaning: { en: "Prayer", ur: "نماز" },
        example: "أَقِيمُوا الصَّلَاةَ (Establish prayer)"
    },
    {
        id: 2,
        word: "صَبْر",
        meaning: { en: "Patience", ur: "صبر" },
        example: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ (Indeed, Allah is with the patient)"
    },
    {
        id: 3,
        word: "كِتَاب",
        meaning: { en: "Book", ur: "کتاب" },
        example: "الْكِتَابُ لَا رَيْبَ فِيهِ (The Book about which there is no doubt)"
    },
    {
        id: 4,
        word: "رَحْمَة",
        meaning: { en: "Mercy", ur: "رحمت" },
        example: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً (We have not sent you except as a mercy)"
    },
    {
        id: 5,
        word: "تَوْبَة",
        meaning: { en: "Repentance", ur: "توبہ" },
        example: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ (Indeed, Allah loves those who repent)"
    },
    {
        id: 6,
        word: "عِلْم",
        meaning: { en: "Knowledge", ur: "علم" },
        example: "رَبِّ زِدْنِي عِلْمًا (My Lord, increase me in knowledge)"
    },
    {
        id: 7,
        word: "إِيمَان",
        meaning: { en: "Faith / Belief", ur: "ایمان" },
        example: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ (The believers are but brothers)"
    },
    {
        id: 8,
        word: "شُكْر",
        meaning: { en: "Gratitude", ur: "شکر" },
        example: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ (If you are grateful, I will increase you)"
    },
    {
        id: 9,
        word: "تَقْوَى",
        meaning: { en: "Piety / God-consciousness", ur: "تقویٰ" },
        example: "إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ (The most noble of you is the most pious)"
    },
    {
        id: 10,
        word: "صِدْق",
        meaning: { en: "Truthfulness", ur: "سچائی" },
        example: "كُونُوا مَعَ الصَّادِقِينَ (Be with the truthful)"
    },
    {
        id: 11,
        word: "جَنَّة",
        meaning: { en: "Paradise", ur: "جنت" },
        example: "وَأَعَدَّ لَهُمْ جَنَّاتٍ تَجْرِي (And prepared for them gardens beneath which rivers flow)"
    },
    {
        id: 12,
        word: "دُعَاء",
        meaning: { en: "Supplication / Prayer", ur: "دعا" },
        example: "ادْعُونِي أَسْتَجِبْ لَكُمْ (Call upon Me; I will respond to you)"
    },
    {
        id: 13,
        word: "أَمَانَة",
        meaning: { en: "Trust / Honesty", ur: "امانت" },
        example: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ (Allah commands you to deliver trusts)"
    }
];

export const recordedClasses = [
    {
        id: 1,
        title: { en: "Tajweed Basics - Lesson 1", ur: "تجوید کے بنیادی اصول - سبق 1" },
        subject: "Tajweed",
        duration: "45 min",
        progress: 75,
        thumbnail: "/src/assets/images/islamic_pattern_hero.png"
    },
    {
        id: 2,
        title: { en: "Fiqh of Salah", ur: "نماز کا فقہ" },
        subject: "Fiqh",
        duration: "60 min",
        progress: 30,
        thumbnail: "/src/assets/images/islamic_pattern_dark.png"
    },
    {
        id: 3,
        title: { en: "Seerah of the Prophet (SAW)", ur: "سیرت النبی (ص)" },
        subject: "History",
        duration: "55 min",
        progress: 0,
        thumbnail: "/src/assets/images/mosque_silhouette.png"
    }
];

// virtualTours removed as per user request

export const flashcards = [
    // Prophets
    { id: 1, question: { en: "Who was the first Prophet?", ur: "پہلے نبی کون تھے؟" }, answer: { en: "Prophet Adam (AS)", ur: "حضرت آدم (ع)" }, category: "Prophets" },
    { id: 2, question: { en: "Who was known as Khalilullah (Friend of Allah)?", ur: "خلیل اللہ کس نبی کو کہا جاتا ہے؟" }, answer: { en: "Prophet Ibrahim (AS)", ur: "حضرت ابراہیم (ع)" }, category: "Prophets" },
    { id: 3, question: { en: "Which Prophet was swallowed by a whale?", ur: "کس نبی کو مچھلی نے نگلا؟" }, answer: { en: "Prophet Yunus (AS)", ur: "حضرت یونس (ع)" }, category: "Prophets" },
    { id: 4, question: { en: "Who was the last Prophet?", ur: "آخری نبی کون ہیں؟" }, answer: { en: "Prophet Muhammad (SAW)", ur: "حضرت محمد (صلی اللہ علیہ وسلم)" }, category: "Prophets" },
    { id: 5, question: { en: "Which Prophet could speak to birds and animals?", ur: "کون سے نبی پرندوں اور جانوروں سے بات کر سکتے تھے؟" }, answer: { en: "Prophet Sulayman (AS)", ur: "حضرت سلیمان (ع)" }, category: "Prophets" },
    // Worship
    { id: 6, question: { en: "How many times do Muslims pray daily?", ur: "مسلمان روزانہ کتنی بار نماز پڑھتے ہیں؟" }, answer: { en: "5 times", ur: "5 بار" }, category: "Worship" },
    { id: 7, question: { en: "What is the first pillar of Islam?", ur: "اسلام کا پہلا رکن کیا ہے؟" }, answer: { en: "Shahada (testimony of faith)", ur: "شہادت (ایمان کی گواہی)" }, category: "Worship" },
    { id: 8, question: { en: "How many days is Ramadan fasting?", ur: "رمضان کے روزے کتنے دن ہوتے ہیں؟" }, answer: { en: "29 or 30 days", ur: "29 یا 30 دن" }, category: "Worship" },
    { id: 9, question: { en: "What is the direction Muslims face when praying?", ur: "مسلمان نماز میں کس سمت رخ کرتے ہیں؟" }, answer: { en: "Qibla (towards the Ka'bah in Makkah)", ur: "قبلہ (مکہ میں کعبہ کی طرف)" }, category: "Worship" },
    { id: 10, question: { en: "What is Zakat?", ur: "زکوٰۃ کیا ہے؟" }, answer: { en: "Annual charity of 2.5% on savings above the nisab", ur: "نصاب سے زائد بچت پر 2.5% سالانہ زکوٰۃ" }, category: "Worship" },
    // General Knowledge
    { id: 11, question: { en: "How many surahs are in the Quran?", ur: "قرآن میں کتنی سورتیں ہیں؟" }, answer: { en: "114 surahs", ur: "114 سورتیں" }, category: "General Knowledge" },
    { id: 12, question: { en: "What is the longest surah in the Quran?", ur: "قرآن کی سب سے لمبی سورت کون سی ہے؟" }, answer: { en: "Surah Al-Baqarah (286 ayahs)", ur: "سورۃ البقرۃ (286 آیات)" }, category: "General Knowledge" },
    { id: 13, question: { en: "What is the shortest surah in the Quran?", ur: "قرآن کی سب سے چھوٹی سورت کون سی ہے؟" }, answer: { en: "Surah Al-Kawthar (3 ayahs)", ur: "سورۃ الکوثر (3 آیات)" }, category: "General Knowledge" },
    { id: 14, question: { en: "In which city was the Prophet (SAW) born?", ur: "نبی کریم صلی اللہ علیہ وسلم کی پیدائش کس شہر میں ہوئی؟" }, answer: { en: "Makkah", ur: "مکہ مکرمہ" }, category: "General Knowledge" },
    { id: 15, question: { en: "What does 'Islam' mean?", ur: "'اسلام' کا کیا مطلب ہے؟" }, answer: { en: "Peace and submission to Allah", ur: "اللہ کو امن کے ساتھ سر تسلیم خم کرنا" }, category: "General Knowledge" }
];

export const studentAttendance = [
    { id: 1, name: "Ali Khan", status: "Present" },
    { id: 2, name: "Sara Ahmed", status: "Absent" },
    { id: 3, name: "Zainab Bibi", status: "Present" },
    { id: 4, name: "Omar Farooq", status: "Late" },
    { id: 5, name: "Fatima Noor", status: "Present" },
];

export const userManagement = [
    { id: 1, name: "Admin User", role: "Admin", email: "admin@example.com" },
    { id: 2, name: "Teacher One", role: "Teacher", email: "teacher1@example.com" },
    { id: 3, name: "Student Ali", role: "Student", email: "ali@example.com" },
    { id: 4, name: "Parent Ahmed", role: "Parent", email: "parent@example.com" },
];

export const feeStatus = [
    { id: 1, student: "Ali Khan", amount: 5000, status: "Paid", month: "February" },
    { id: 2, student: "Sara Ahmed", amount: 5000, status: "Pending", month: "February" },
    { id: 3, student: "Zainab Bibi", amount: 5000, status: "Overdue", month: "January" },
];

export const leaderboard = [
    { rank: 1, name: "Ali Khan", points: 2500, avatar: "A" },
    { rank: 2, name: "Fatima Noor", points: 2350, avatar: "F" },
    { rank: 3, name: "Zainab Bibi", points: 2100, avatar: "Z" },
    { rank: 4, name: "Omar Farooq", points: 1950, avatar: "O" },
    { rank: 5, name: "Sara Ahmed", points: 1800, avatar: "S" },
];

export const streakData = {
    currentStreak: 5,
    longestStreak: 12,
    activity: [
        { day: 'Mon', status: 'complete' },
        { day: 'Tue', status: 'complete' },
        { day: 'Wed', status: 'complete' },
        { day: 'Thu', status: 'today' },
        { day: 'Fri', status: 'pending' },
        { day: 'Sat', status: 'pending' },
        { day: 'Sun', status: 'pending' },
    ]
};

export const virtualTours = [
    {
        id: 1,
        title: { en: "Masjid Al-Haram, Makkah", ur: "مسجد الحرام، مکہ" },
        description: { en: "Explore the holiest site in Islam with this immersive 360° virtual tour.", ur: "اسلام کے سب سے مقدس مقام کا 360° ورچوئل ٹور کے ساتھ مشاہدہ کریں۔" },
        image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80",
        url: "https://www.google.com/maps/@21.4224779,39.8262061,3a,75y,266.33h,90t/data=!3m8!1e1!3m6!1sAF1QipNiv3E4-vPmqM9u_fUP1c-v1u-7R3uS8HhVb8q2!2e10!3e11!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipNiv3E4-vPmqM9u_fUP1c-v1u-7R3uS8HhVb8q2%3Dw203-h100-k-no-pi-0-ya226.74551-ro0-fo100!7i8192!8i4096",
        isLive: false
    },
    {
        id: 2,
        title: { en: "Masjid An-Nabawi, Madinah", ur: "مسجد نبوی، مدینہ" },
        description: { en: "Experience the tranquility of the Prophet's (SAW) mosque through VR.", ur: "وی آر کے ذریعے مسجد نبوی (ص) کے سکون کا تجربہ کریں۔" },
        image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&q=80",
        url: "https://www.google.com/maps/@24.4672105,39.6111153,3a,75y,241.6h,90t/data=!3m8!1e1!3m6!1sAF1QipM7lWq7qX-K7Y1D7-D-W-Z-u-E-U-P_p-z_z-s!2e10!3e11!6shttps:%2F%2Flh5.googleusercontent.com%2Fp%2FAF1QipM7lWq7qX-K7Y1D7-D-W-Z-u-E-U-P_p-z_z-s%3Dw203-h100-k-no-pi-0-ya226.74551-ro0-fo100!7i8192!8i4096",
        isLive: true
    }
];
