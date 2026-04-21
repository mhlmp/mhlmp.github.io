```markdown
<div align="center">
  <img src="icon.png" alt="MH Link Manager Pro Logo" width="120" style="border-radius: 20%; margin-bottom: 15px;">
  
  # 🔗 MH Link Manager Pro v2.0
  
  **ממשק PWA מתקדם לניהול קישורים, אוטומציה וגיבוי בענן.<br>כולל שילוב מנועי בינה מלאכותית (AI) לסריקת תוכן, סיווג אוטומטי ופענוח אתרים.**
  
  <br>
  <img src="screenshot-mobile.png" alt="App Screenshot" width="300" style="border-radius: 20px; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  <br><br>
</div>

---

## 📁 קבצים

| קובץ | תפקיד |
| :--- | :--- |
| `index.html` | האפליקציה המלאה (HTML + CSS + JS Vanilla), ממשק המשתמש והלוגיקה |
| `manifest.json` | הגדרות PWA (מאפשר התקנה ישירה כאפליקציית שולחן עבודה/מובייל) |
| `sw.js` | Service Worker (ניהול מטמון, אסטרטגיית Network First ועבודה אופליין) |
| `icon.png` | סמל המערכת |

## 🚀 הפעלה

המערכת פועלת במלואה כ-Client-Side (ללא תלות בשרת Node/PHP אחורי). ניתן לארח בקלות דרך GitHub Pages, או להריץ מקומית:

```bash
# שרת מקומי מהיר (Python)
python3 -m http.server 8080

# שרת מקומי (Node.js)
npx serve .
```
פתח בדפדפן: `http://localhost:8080`

## 🔑 מפתחות API (בינה מלאכותית)

המערכת תומכת ב-3 ספקי AI שונים לניתוח קישורים וטקסטים בזמן אמת:

1. **Google Gemini (מומלץ):** [קבל מפתח חינם](https://aistudio.google.com/app/apikey)
2. **Groq API (הכי מהיר):** [קבל מפתח חינם](https://console.groq.com/keys)
3. **OpenRouter:** [קבל מפתח](https://openrouter.ai/keys)

*הטמעת המפתח:* בתוך האפליקציה, לחץ על תפריט **✨ AI** > **⚙️ הגדרות AI ומפתחות**, והדבק את המפתח הרלוונטי. המידע נשמר מוצפן אצלך בקאש ומסונכרן דרך Firebase.

## ✨ תכונות מפתח

- **סנכרון ענן חכם** — מבוסס Firebase עם תור אסינכרוני (Push Queue) מתקדם למניעת דריסת נתונים (Race Conditions) כשעובדים מכמה מכשירים.
- **עבודה אופליין 100%** — שימוש ב-IndexedDB. האפליקציה נטענת ועובדת גם ללא אינטרנט.
- **מנוע AI מרובה ספקים** — תמיכה במודלים מתקדמים (Gemini 1.5 Flash, Llama 3) לסריקת אתרים, חילוץ תקצירים (Summaries) ויצירת תגיות.
- **מעקף הגנות (Anti-Bot Bypass)** — שימוש במערך Proxies מובנה כדי לקרוא אתרים החסומים על ידי Cloudflare בטרם השליחה ל-AI.
- **פעולות גורפות (Bulk Actions)** — ממשק Multi-Select למחיקה, העברה, או סריקת AI של עשרות פריטים במקביל במינימום רינדור (DOM Performance).
- **ייבוא / ייצוא מתקדם** — גיבוי ל-JSON ול-TXT (עם קידוד מיוחד השומר על ירידות השורה של ה-AI).
- **UX/UI מודרני** — עיצוב Glassmorphism, תמיכה מלאה במצב לילה/יום והתראות דינמיות צפות.
- **הגנת DevTools** — חסימת צפייה בקוד המקור למשתמשים שאינם מוגדרים כאדמין.

## 📊 ניהול עומסים ורשת

| שירות | מנגנון הגנה מובנה במערכת |
| :--- | :--- |
| **Firebase** | כתיבה מאוגדת דרך תור מובנה למניעת חריגה ממכסות כתיבה (Writes). |
| **API חסימות** | זיהוי אוטומטי של `429 Too Many Requests` והשהיית התור (Delay) ל-20 שניות. |
| **תעבורה (Network)** | עדכוני DOM נקודתיים (ללא Re-render מלא) לשמירה על חוויה חלקה במובייל. |

## 💻 טכנולוגיות

- Vanilla JavaScript (ES6+ ללא פריימוורקים)
- Firebase V10 (Auth, Firestore)
- PWA & Service Workers
- IndexedDB Persistence
- CSS Variables & Glassmorphism Design
- AI Fetch APIs
```
