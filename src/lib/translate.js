/**
 * Translation utility for Needhi_AI.
 * Uses a free Google Translate endpoint for dynamic content translation.
 */

const DICTIONARY = {
  tamil: {
    "Action Plan": "செயல் திட்டம்",
    "Verify": "சரிபார்க்கவும்",
    "Summarize": "சுருக்கம்",
    "Case Information": "வழக்கு தகவல்",
    "Type": "வகை",
    "Responsible Department": "பொறுப்பான துறை",
    "Deadline": "காலக்கெடு",
    "Summary Made by AI": "AI தயாரித்த சுருக்கம்",
    "Dashboard (Verified Actions)": "டாஷ்போர்டு (சரிபார்க்கப்பட்ட நடவடிக்கைகள்)",
    "Source Text from PDF": "PDF-லிருந்து மூல உரை",
    "Tab-Reminders": "நினைவூட்டல்கள்",
    "Case Details": "வழக்கு விவரங்கள்",
    "Date of Order": "ஆணை தேதி",
    "Parties Involved": "சம்பந்தப்பட்ட தரப்பினர்",
    "Key Directions / Orders": "முக்கிய திசைகள் / உத்தரவுகள்",
    "Compliance Reminders": "இணக்க நினைவூட்டல்கள்",
    "Overdue": "காலாவதியானது",
    "Urgent": "அவசரம்",
    "Verified": "சரிபார்க்கப்பட்டது",
    "Human Verified": "மனிதரால் சரிபார்க்கப்பட்டது",
    "Timeline": "காலவரிசை",
    "Target Date": "இலக்கு தேதி",
    "Days Past": "நாட்கள் கடந்துவிட்டன",
    "Today": "இன்று",
    "Days Left": "நாட்கள் மீதமுள்ளன",
    "No verified deadlines detected. Go to 'Verify' to activate reminders.": "சரிபார்க்கப்பட்ட காலக்கெடு எதுவும் கண்டறியப்படவில்லை. நினைவூட்டல்களை இயக்க 'சரிபார்க்கவும்' பகுதிக்குச் செல்லவும்.",
    "Tracking deadlines automatically from the judgment date. These reminders are activated once you verify the action items.": "தீர்ப்பு தேதியிலிருந்து காலக்கெடுவைத் தானாகக் கண்காணித்தல். நீங்கள் செயல் உருப்படிகளைச் சரிபார்த்தவுடன் இந்த நினைவூட்டல்கள் செயல்படுத்தப்படும்."
  },
  hindi: {
    "Action Plan": "कार्य योजना",
    "Verify": "सत्यापित करें",
    "Summarize": "सारांश",
    "Case Information": "मामले की जानकारी",
    "Type": "प्रकार",
    "Responsible Department": "जिम्मेदार विभाग",
    "Deadline": "समय सीमा",
    "Summary Made by AI": "एआई द्वारा बनाया गया सारांश",
    "Dashboard (Verified Actions)": "डैशबोर्ड (सत्यापित क्रियाएं)",
    "Source Text from PDF": "पीडीएफ से मूल पाठ",
    "Tab-Reminders": "रिमाइंडर्स",
    "Case Details": "मामले का विवरण",
    "Date of Order": "आदेश की तिथि",
    "Parties Involved": "शामिल पक्ष",
    "Key Directions / Orders": "मुख्य निर्देश / आदेश",
    "Compliance Reminders": "अनुपालन रिमाइंडर्स",
    "Overdue": "विलंबित",
    "Urgent": "अति आवश्यक",
    "Verified": "सत्यापित",
    "Human Verified": "मानव द्वारा सत्यापित",
    "Timeline": "समयरेखा",
    "Target Date": "लक्ष्य तिथि",
    "Days Past": "दिन बीत चुके हैं",
    "Today": "आज",
    "Days Left": "दिन शेष",
    "No verified deadlines detected. Go to 'Verify' to activate reminders.": "कोई सत्यापित समय सीमा नहीं मिली। रिमाइंडर सक्रिय करने के लिए 'सत्यापित करें' पर जाएं।",
    "Tracking deadlines automatically from the judgment date. These reminders are activated once you verify the action items.": "परामर्श तिथि से समय सीमा को स्वचालित रूप से ट्रैक किया जा रहा है। एक बार जब आप कार्रवाई की वस्तुओं को सत्यापित कर लेते हैं, तो ये रिमाइंडर सक्रिय हो जाते हैं।"
  },
  kannada: {
    "Action Plan": "ಕಾರ್ಯ ಯೋಜನೆ",
    "Verify": "ಪರಿಶೀಲಿಸಿ",
    "Summarize": "ಸಾರಾಂಶ",
    "Case Information": "ಪ್ರಕರಣದ ಮಾಹಿತಿ",
    "Type": "ಮಾದರಿ",
    "Responsible Department": "ಜವಾಬ್ದಾರಿಯುತ ಇಲಾಖೆ",
    "Deadline": "ಗಡುವು",
    "Summary Made by AI": "AI ಮಾಡಿದ ಸಾರಾಂಶ",
    "Dashboard (Verified Actions)": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ (ಪರಿಶೀಲಿಸಿದ ಕ್ರಮಗಳು)",
    "Source Text from PDF": "ಪಿಡಿಎಫ್‌ನಿಂದ ಮೂಲ ಪಠ್ಯ",
    "Tab-Reminders": "ಜ್ಞಾಪನೆಗಳು",
    "Case Details": "ಪ್ರಕರಣದ ವಿವರಗಳು",
    "Date of Order": "ಆದೇಶದ ದಿನಾಂಕ",
    "Parties Involved": "ಒಳಗೊಂಡಿರುವ ಪಕ್ಷಗಳು",
    "Key Directions / Orders": "ಪ್ರಮುಖ ನಿರ್ದೇಶನಗಳು / ಆದೇಶಗಳು",
    "Compliance Reminders": "ಅನುಸರಣೆ ಜ್ಞಾಪನೆಗಳು",
    "Overdue": "ವಿಳಂಬವಾಗಿದೆ",
    "Urgent": "ತುರ್ತು",
    "Verified": "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    "Human Verified": "ಮಾನವನಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    "Timeline": "ಕಾಲಮಿತಿ",
    "Target Date": "ಗುರಿ ದಿನಾಂಕ",
    "Days Past": "ದಿನಗಳು ಕಳೆದವು",
    "Today": "ಇಂದು",
    "Days Left": "ದಿನಗಳು ಉಳಿದಿವೆ",
    "No verified deadlines detected. Go to 'Verify' to activate reminders.": "ಯಾವುದೇ ಪರಿಶೀಲಿಸಿದ ಗಡುವುಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ. ಜ್ಞಾಪನೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲು 'ಪರಿಶೀಲಿಸಿ' ಗೆ ಹೋಗಿ.",
    "Tracking deadlines automatically from the judgment date. These reminders are activated once you verify the action items.": "ತೀರ್ಪಿನ ದಿನಾಂಕದಿಂದ ಗಡುವುಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ. ನೀವು ಕ್ರಿಯೆಯ ಅಂಶಗಳನ್ನು ಪರಿಶೀಲಿಸಿದ ನಂತರ ಈ ಜ್ಞಾಪನೆಗಳು ಸಕ್ರಿಯಗೊಳ್ಳುತ್ತವೆ."
  },
};

export function translateUI(text, lang) {
  if (lang === "english") return text;
  const key = text.trim();
  return DICTIONARY[lang]?.[key] ?? text;
}

const translationCache = new Map();

/**
 * Real-time translation using Google Translate free API
 */
export async function translateContent(text, targetLang) {
  if (!text || targetLang === "english") return text;
  
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);
  
  const langCodes = {
    tamil: "ta",
    hindi: "hi",
    kannada: "kn"
  };

  const target = langCodes[targetLang] || "en";

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Google Translate response format is nested arrays
    if (data && data[0]) {
      const result = data[0].map((s) => s[0]).join("");
      translationCache.set(cacheKey, result);
      return result;
    }
    return text;
  } catch (error) {
    console.error("Translation failed:", error);
    return `[Translation Error] ${text}`;
  }
}
