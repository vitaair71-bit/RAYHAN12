// ======== IMPORT MODULE ========
import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ======== SETUP DASAR ========
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


// ======== MIDDLEWARE ========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder statis (HTML, CSS, JS, dan gambar)
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======== SETUP FOLDER UPLOAD ========
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// ======== KONFIGURASI MULTER (UPLOAD GAMBAR) ========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// ======== SIMPAN TRANSAKSI (POST) ========
app.post("/transaksi", upload.single("bukti"), (req, res) => {
  try {
    const { nama, telepon, alamat, metode, total } = req.body;
    const file = req.file ? `/uploads/${req.file.filename}` : null;

    if (!file) {
      return res.status(400).json({ error: "Bukti transfer tidak ditemukan" });
    }

    const dataPath = path.join(__dirname, "public", "transaksi.json");
    let allData = [];

    // Jika file transaksi.json sudah ada, baca isinya
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath);
      if (raw.length > 0) allData = JSON.parse(raw);
    }

    // Buat transaksi baru dengan ID unik
    const transaksiBaru = {
      id: Date.now().toString(),
      nama,
      telepon,
      alamat,
      metode,
      total,
      bukti: file,
      tanggal: new Date().toLocaleString("id-ID"),
    };

    // Simpan ke array & tulis ke file JSON
    allData.push(transaksiBaru);
    fs.writeFileSync(dataPath, JSON.stringify(allData, null, 2));

    res.json({ message: "Transaksi berhasil disimpan", data: transaksiBaru });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Gagal menyimpan transaksi" });
  }
});

// ======== LIHAT SEMUA TRANSAKSI (GET) ========
app.get("/transaksi", (req, res) => {
  const dataPath = path.join(__dirname, "public", "transaksi.json");
  if (!fs.existsSync(dataPath)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(dataPath));
  res.json(data);
});

// ======== HAPUS TRANSAKSI (DELETE) ========
app.delete("/transaksi/:id", (req, res) => {
  const dataPath = path.join(__dirname, "public", "transaksi.json");
  if (!fs.existsSync(dataPath))
    return res.status(404).json({ error: "Data tidak ditemukan" });

  const data = JSON.parse(fs.readFileSync(dataPath));
  const index = data.findIndex((t) => t.id === req.params.id);

  if (index === -1)
    return res.status(404).json({ error: "Transaksi tidak ditemukan" });

  // Hapus file bukti jika masih ada
  const filePath = path.join(__dirname, data[index].bukti);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  // Hapus dari array dan simpan kembali
  data.splice(index, 1);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  res.json({ message: "Transaksi berhasil dihapus" });
});

// ======== JALANKAN SERVER ========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
