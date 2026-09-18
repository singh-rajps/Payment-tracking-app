const express = require("express");
const cors = require("cors");
const path = require("path");

const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(__dirname));

// API
app.use("/api/payments", paymentRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Payment Tracker running at http://localhost:${PORT}`);
});
