<div align="center">

&#x20; <img src="icon.jpg" width="120" alt="MH Link Manager Pro Logo">

&#x20; <h1>MH Link Manager Pro v2.0</h1>

&#x20; <p>ממשק PWA מתקדם, מהיר ומאובטח לניהול קישורים אישי בענן עם שילוב מנועי בינה מלאכותית (AI).</p>

</div>



\---



\## קבצים



| קובץ | תפקיד |

| :--- | :--- |

| `index.html` | האפליקציה המלאה (HTML + CSS + JS Vanilla), ממשק המשתמש והלוגיקה |

| `manifest.json` | הגדרות האפליקציה (PWA) להתקנה ישירה על שולחן העבודה או הנייד |

| `sw.js` | Service Worker לניהול מטמון (Network First) ותמיכה מלאה בעבודה באופליין |

| `icon.jpg` | סמל המערכת המוצג במסך הבית של המכשיר |



\---



\## הפעלה



המערכת בנויה כ-Serverless Single-Page Application ולכן אין צורך בשרת אחורי מורכב. ניתן להריץ אותה מכל שרת HTTP פשוט או לארח חינם דרך GitHub Pages.



הפעלה עם שרת מקומי (Python):

```bash

python -m http.server 8080

