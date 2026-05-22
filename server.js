import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';

const app = express();

// This allows your Cloudflare frontend to safely communicate with this backend
app.use(cors({
  origin: '*' 
}));
app.use(express.json());

// Initialize Razorpay using secure environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// The single endpoint your frontend will call to get an order ID
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount } = req.body; 

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert rupees to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order); // Sends the order details (including order_id) back to your frontend
    
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

// Use Render's dynamic port assignment
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Payment backend running on port ${PORT}`);
});
