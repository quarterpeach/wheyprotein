// backend/src/index.js
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors()); // อนุญาตให้ frontend (คนละ port) เรียกหาได้
app.use(express.json()); // ให้ server อ่าน JSON ที่ส่งมาได้

// --- API Routes ---

// 1. API ดึงสินค้าทั้งหมด
app.get("/api/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

// 2. API ดึงสินค้าชิ้นเดียว (ตาม ID)
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });
  res.json(product);
});

// 3. API สมัครสมาชิก
app.post("/api/register", async (req, res) => {
  // (ในชีวิตจริง: ต้อง hash password ด้วย bcrypt ก่อน)
  const { email, password, name } = req.body;
  try {
    const user = await prisma.user.create({
      data: { email, password, name },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// 4. API Login
// (ในชีวิตจริง: ต้องเช็ค password และส่ง JWT Token กลับไป)
app.post("/api/login", async (req, res) => {
    // ... (Logic การ Login)
});


// 5. API สร้างการชำระเงิน (จะเชื่อมกับ Omise ในขั้นตอนที่ 6)
app.post("/api/checkout", async (req, res) => {
    // ... (Logic การสร้าง Order และ Charge เงิน)
});


// --- จบ API Routes ---

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});