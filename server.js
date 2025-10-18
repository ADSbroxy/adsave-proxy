import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد CORS
app.use(cors());

// تحديد معدل الطلبات (Rate Limiting)
const limiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة وحدة
  max: 5, // أقصى عدد طلبات في الدقيقة لكل IP
  message: "❌ تم تجاوز الحد المسموح، حاول لاحقًا."
});
app.use(limiter);

// لتقديم الملفات من مجلد public
app.use(express.static(path.join(__dirname, "public")));

// المسار الرئيسي
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// مسار التحميل
app.get("/api/download", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: "يرجى إدخال رابط الفيديو" });

  try {
    const response = await fetch(`${process.env.API_BASE_URL}?token=${process.env.API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: videoUrl })
    });

    const data = await response.json();

    if (!data || !data[0] || !data[0].url)
      return res.status(500).json({ error: "فشل التحميل أو الرابط غير مدعوم" });

    res.json({
      success: true,
      downloadUrl: data[0].url
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء الاتصال بالسيرفر" });
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 AD Save Server يعمل على المنفذ ${PORT}`);
});