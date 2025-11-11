// backend/src/index.js (ใน Route /api/checkout)
const omise = require('omise')({
  secretKey: process.env.OMISE_SECRET_KEY, // เก็บใน .env
});

const { omiseToken, cartItems, userId } = req.body;

// 1. คำนวณราคารวม (ต้องดึงราคาจริงจาก DB ห้ามเชื่อราคาจาก frontend)
let totalAmount = 0;
for (const item of cartItems) {
    const product = await prisma.product.findUnique({ where: { id: item.id }});
    totalAmount += product.price * item.quantity;
}

// 2. สร้าง Order ใน DB (สถานะ PENDING)
const order = await prisma.order.create({
    data: {
        userId: userId, // ต้องมาจากระบบ Login
        total: totalAmount,
        status: "PENDING",
        items: {
            create: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price // ควรดึงราคาจริงจาก DB
            }))
        }
    }
});

// 3. สั่ง Charge เงินผ่าน Omise
try {
    const charge = await omise.charges.create({
        amount: totalAmount * 100, // Omise ใช้หน่วยสตางค์
        currency: 'thb',
        card: omiseToken, // ใช้ Token ที่ได้จาก Frontend
        description: `Order ID: ${order.id}`
    });

    // 4. ถ้า Charge สำเร็จ -> Update Order status
    if (charge.status === 'successful') {
        await prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID" }
        });
        res.json({ success: true, message: "Payment successful" });
    } else {
        throw new Error("Payment failed");
    }

} catch (error) {
    // ถ้า Charge ไม่ผ่าน (เช่น วงเงินเต็ม)
    await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" }
    });
    res.status(400).json({ success: false, message: error.message });
}