// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/api/book", (req, res) => {
    const booking = req.body;
    console.log("📦 New Booking Received:", booking);

    // Optional: Generate a random booking ID
    const bookingId = "EVT" + Math.floor(100000 + Math.random() * 900000);

    // Respond with confirmation message
    res.json({
        success: true,
        message: "🎉 Booking confirmed! Thank you, " + booking.payment.name + ".",
        bookingId: bookingId
    });
});

app.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
