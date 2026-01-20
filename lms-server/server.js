const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===== folder uploads =====
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// serve file statis agar bisa di-download
app.use("/uploads", express.static(UPLOAD_DIR));

// ===== Multer config =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeBase = path
      .basename(file.originalname)
      .replace(/[^\w.\-() ]+/g, "_")
      .replace(/\s+/g, "_");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + safeBase);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// ===== DB sederhana (in-memory) =====
// (Kalau mau permanen beneran, nanti pindah ke database / file JSON)
const db = {
  tugas: [],
  materi: [],
};

// ===== endpoint upload file =====
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    fileUrl,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
  });
});

// ===== endpoint CRUD sederhana =====
app.get("/api/tugas", (req, res) => res.json(db.tugas));
app.post("/api/tugas", (req, res) => {
  const item = { id: Date.now(), ...req.body };
  db.tugas.unshift(item);
  res.json(item);
});

app.get("/api/materi", (req, res) => res.json(db.materi));
app.post("/api/materi", (req, res) => {
  const item = { id: Date.now(), ...req.body };
  db.materi.unshift(item);
  res.json(item);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server jalan di http://localhost:${PORT}`);
});
