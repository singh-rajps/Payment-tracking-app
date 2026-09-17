const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/payments.json");

function readPayments() {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

function writePayments(payments) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(payments, null, 2)
    );
}

// GET /api/payments
exports.getPayments = (req, res) => {
    try {
        let payments = readPayments();

        const {
            type,
            status,
            category
        } = req.query;

        // Filter by type
        if (type) {
            payments = payments.filter(
                payment => payment.type === type
            );
        }

        // Filter by status
        if (status) {
            payments = payments.filter(
                payment => payment.status === status
            );
        }

        // Filter by category
        if (category) {
            payments = payments.filter(
                payment => payment.category === category
            );
        }

        res.json({
            success: true,
            count: payments.length,
            data: payments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments"
        });
    }
};


// GET /api/payments/:id
exports.getPaymentById = (req, res) => {
    try {
        const payments = readPayments();

        const id = Number(req.params.id);

        const payment = payments.find(
            payment => payment.id === id
        );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        res.json({
            success: true,
            data: payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment"
        });
    }
};


// POST /api/payments
exports.createPayment = (req, res) => {
    try {
        const payments = readPayments();

        const {
            name,
            amount,
            type,
            category,
            date,
            status
        } = req.body;

        // Validation
        if (!name || amount === undefined || !type) {
            return res.status(400).json({
                success: false,
                message: "name, amount and type are required"
            });
        }

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "type must be income or expense"
            });
        }

        const newId =
            payments.length > 0
                ? Math.max(...payments.map(p => p.id)) + 1
                : 1;

        const newPayment = {
            id: newId,
            name,
            amount: Number(amount),
            type,
            category: category || "Other",
            date: date || new Date().toISOString().split("T")[0],
            status: status || "pending"
        };

        payments.push(newPayment);

        writePayments(payments);

        res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: newPayment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create payment"
        });
    }
};


// PUT /api/payments/:id
exports.updatePayment = (req, res) => {
    try {
        const payments = readPayments();

        const id = Number(req.params.id);

        const index = payments.findIndex(
            payment => payment.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        const existingPayment = payments[index];

        const updatedPayment = {
            ...existingPayment,
            ...req.body,
            id,
            amount:
                req.body.amount !== undefined
                    ? Number(req.body.amount)
                    : existingPayment.amount
        };

        payments[index] = updatedPayment;

        writePayments(payments);

        res.json({
            success: true,
            message: "Payment updated successfully",
            data: updatedPayment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update payment"
        });
    }
};


// DELETE /api/payments/:id
exports.deletePayment = (req, res) => {
    try {
        const payments = readPayments();

        const id = Number(req.params.id);

        const index = payments.findIndex(
            payment => payment.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        const deletedPayment = payments[index];

        payments.splice(index, 1);

        writePayments(payments);

        res.json({
            success: true,
            message: "Payment deleted successfully",
            data: deletedPayment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete payment"
        });
    }
};


// GET /api/payments/summary
exports.getSummary = (req, res) => {
    try {
        const payments = readPayments();

        let totalIncome = 0;
        let totalExpenses = 0;
        let pendingPayments = 0;
        let overduePayments = 0;

        payments.forEach(payment => {

            if (payment.type === "income") {
                totalIncome += payment.amount;
            }

            if (payment.type === "expense") {
                totalExpenses += payment.amount;
            }

            if (payment.status === "pending") {
                pendingPayments++;
            }

            if (payment.status === "overdue") {
                overduePayments++;
            }
        });

        const balance = totalIncome - totalExpenses;

        res.json({
            success: true,
            data: {
                totalBalance: Number(balance.toFixed(2)),
                totalIncome: Number(totalIncome.toFixed(2)),
                totalExpenses: Number(totalExpenses.toFixed(2)),
                pendingPayments,
                overduePayments,
                totalPayments: payments.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to calculate summary"
        });
    }
};


// GET /api/payments/categories/summary
exports.getCategorySummary = (req, res) => {
    try {
        const payments = readPayments();

        const categoryTotals = {};

        payments.forEach(payment => {

            if (payment.type !== "expense") {
                return;
            }

            if (!categoryTotals[payment.category]) {
                categoryTotals[payment.category] = 0;
            }

            categoryTotals[payment.category] += payment.amount;
        });

        const result = Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                amount: Number(amount.toFixed(2))
            }));

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to calculate category summary"
        });
    }
};