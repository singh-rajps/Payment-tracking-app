const express = require("express");

const {
    getPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    getSummary,
    getCategorySummary
} = require("../controllers/paymentController");

const router = express.Router();

// GET all payments
router.get("/", getPayments);

// GET payment summary
router.get("/summary", getSummary);

// GET category summary
router.get("/categories/summary", getCategorySummary);

// GET payment by ID
router.get("/:id", getPaymentById);

// CREATE payment
router.post("/", createPayment);

// UPDATE payment
router.put("/:id", updatePayment);

// DELETE payment
router.delete("/:id", deletePayment);

module.exports = router;