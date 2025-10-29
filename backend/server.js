import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// إعدادات عامة
app.use(cors()); // يسمح لأي أصل - مناسب للبدء. للتشديد ضع origins محددة.
app.use(express.json({ limit: "1mb" }));

// احفظ رابط Google Apps Script في متغيّر بيئي GOOGLE_SCRIPT_URL
const GA_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AK.../exec";

// endpoint للـ form يرسل البيانات إلى Google Script
app.post("/submit", async (req, res) => {
  try {
    const response = await fetch(GA_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    // حاول تحويل الرد من سكربت إلى JSON إذا أمكن
    let json;
    try {
      json = await response.json();
    } catch (err) {
      json = { status: "ok", rawStatus: response.status };
    }

    return res.json(json);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// health
app.get("/", (req, res) => res.send("GA Proxy is running"));

// start
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
