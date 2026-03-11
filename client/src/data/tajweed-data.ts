export interface TajweedRule {
    name: string;
    description: string;
    descriptionUrdu: string;
    letters: string[];
    color: string;
    exampleStr?: string;
}

export const TAJWEED_RULES: TajweedRule[] = [
    {
        name: "Heavy Letters / Pur (تفخیم)",
        description: "Letters pronounced with a full, heavy mouth (Tafkheem). Includes the 7 Musta'liya letters, Ra with Fatha/Damma, and the Lam in 'Allah' (Lam ul-Jalalah) when preceded by Fatha/Damma.",
        descriptionUrdu: "حروف مستعلیہ (خ، ص، ض، غ، ط، ق، ظ) کو ہمیشہ پر (بھاری) پڑھا جاتا ہے۔ اس کے علاوہ 'ر' پر زبر یا پیش ہو، اور لفظِ جلالہ (اللہ) کے 'ل' سے پہلے زبر یا پیش ہو تو وہ بھی پر پڑھے جاتے ہیں۔",
        letters: ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ', 'رَ', 'رُ', 'ل'],
        color: "text-green-600",
        exampleStr: "kh s d gh t q z"
    },
    {
        name: "Qalqalah (قلقلہ)",
        description: "The vibration of sound at the end of a letter when it has Sukoon.",
        descriptionUrdu: "حروف قلقلہ (ق، ط، ب، ج، د) پر جزم ہو تو ان کو ہلا کر پڑھا جاتا ہے۔",
        letters: ['ق', 'ط', 'ب', 'ج', 'د'],
        color: "text-blue-700",
        exampleStr: "q t b j d"
    },
    {
        name: "Ghunnah (غنہ)",
        description: "The nasal sound produced through the nose when pronouncing Noon or Meem Mushaddad.",
        descriptionUrdu: "جب نون یا میم پر تشدید ہو تو ناک میں آواز چھپا کر غنہ کیا جاتا ہے۔",
        letters: ['نّ', 'مّ'],
        color: "text-red-600",
    },
    {
        name: "Idgham (ادغام)",
        description: "Merging of a non-voweled Noon or Tanween into the following letter.",
        descriptionUrdu: "نون ساکن یا تنوین کو اگلے حرف میں ملا کر پڑھنے کو ادغام کہتے ہیں۔",
        letters: ['ي', 'ر', 'م', 'ل', 'و', 'ن'],
        color: "text-pink-500",
        exampleStr: "y r m l w n"
    },
    {
        name: "Ikhfa (اخفاء)",
        description: "Concealing the sound of Noon Sakinah or Tanween between clear and merged pronunciation.",
        descriptionUrdu: "نون ساکن یا تنوین کے بعد حروف اخفاء آئیں تو غنہ کے ساتھ چھپا کر پڑھنا۔",
        letters: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'],
        color: "text-pink-500",
    },
    {
        name: "Iqlab (اقلاب)",
        description: "Turning of Noon Sakinah or Tanween into a Meem when followed by Ba.",
        descriptionUrdu: "نون ساکن یا تنوین کے بعد 'ب' آئے تو اسے 'م' سے بدل کر غنہ کے ساتھ پڑھتے ہیں۔",
        letters: ['ب'],
        color: "text-red-600",
    },
    {
        name: "Madd (مد)",
        description: "Elongation of the sound of a vowel letter.",
        descriptionUrdu: "حروف مدہ (ا، و، ی) کو لمبا کر کے پڑھنے کو مد کہتے ہیں۔",
        letters: ['ا', 'و', 'ي'],
        color: "text-foreground",
    }
];
