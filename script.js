// Payment Tracker App JavaScript
// Payment Tracker App JavaScript
document.addEventListener('DOMContentLoaded', function() {

    const API_URL = "http://localhost:3000/api/payments";

    // Initialize Chart
    const ctx = document.getElementById('payment-chart').getContext('2d');
    let paymentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Entertainment', 'Bills', 'Shopping', 'Food', 'Transport', 'Other'],
            datasets: [{
                data: [25, 20, 15, 18, 12, 10],
                backgroundColor: [
                    '#4361ee',
                    '#4895ef',
                    '#4cc9f0',
                    '#f8961e',
                    '#f72585',
                    '#7209b7'
                ],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });

    // Sample data
    let payments = [
        { id: 1, name: "Salary", amount: 2500, type: "income", category: "Salary", date: "2023-10-05", status: "paid" },
        { id: 2, name: "Netflix Subscription", amount: 15.99, type: "expense", category: "Entertainment", date: "2023-10-10", status: "pending" },
        { id: 3, name: "Electric Bill", amount: 120.50, type: "expense", category: "Bills", date: "2023-10-03", status: "paid" },
        { id: 4, name: "Grocery Shopping", amount: 85.25, type: "expense", category: "Food", date: "2023-10-01", status: "paid" },
        { id: 5, name: "Amazon Purchase", amount: 65.99, type: "expense", category: "Shopping", date: "2023-09-28", status: "overdue" },
        { id: 6, name: "Freelance Work", amount: 700, type: "income", category: "Freelance", date: "2023-10-07", status: "paid" }
    ];

    // Categories
    const categories = [
        { name: "Entertainment", color: "#4361ee" },
        { name: "Bills", color: "#4895ef" },
        { name: "Shopping", color: "#4cc9f0" },
        { name: "Food", color: "#f8961e" },
        { name: "Transport", color: "#f72585" },
        { name: "Salary", color: "#7209b7" },
        { name: "Freelance", color: "#3a0ca3" },
        { name: "Other", color: "#adb5bd" }
    ];

    // DOM Elements
    const paymentForm = document.getElementById('payment-form');
    const paymentsTableBody = document.getElementById('payments-table-body');
    const emptyPayments = document.getElementById('empty-payments');
    const categoryTags = document.getElementById('category-tags');
    const totalBalance = document.getElementById('total-balance');
    const pendingCount = document.getElementById('pending-count');
    const overdueCount = document.getElementById('overdue-count');
    const totalIncome = document.getElementById('total-income');
    const totalExpenses = document.getElementById('total-expenses');
    const totalPaymentsCount = document.getElementById('total-payments-count');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const submitPaymentBtn = document.getElementById('submit-payment');
    const updatePaymentBtn = document.getElementById('update-payment');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    // State
    let editPaymentId = null;
    let currentFilter = 'all';

    // Initialize app
    function initApp() {
        renderCategoryTags();
        renderPayments();
        updateSummary();
        updateChart();
        
        // Set today's date as default
        document.getElementById('payment-date').valueAsDate = new Date();
    }

    // Render category tags
    function renderCategoryTags() {
        categoryTags.innerHTML = '';
        categories.forEach(category => {
            const tag = document.createElement('div');
            tag.className = 'category-tag';
            tag.textContent = category.name;
            tag.style.backgroundColor = category.color + '20';
            tag.style.color = category.color;
            
            tag.addEventListener('click', function() {
                // Remove active class from all tags
                document.querySelectorAll('.category-tag').forEach(t => {
                    t.classList.remove('active');
                });
                
                // Add active class to clicked tag
                tag.classList.add('active');
                
                // Set the category in the form
                document.querySelector('select').value = category.name;
            });
            
            categoryTags.appendChild(tag);
        });
    }

    // Render payments table
    function renderPayments(filter = 'all') {
        currentFilter = filter;
        paymentsTableBody.innerHTML = '';
        
        // Filter payments
        let filteredPayments = payments;
        if (filter === 'income') {
            filteredPayments = payments.filter(p => p.type === 'income');
        } else if (filter === 'expense') {
            filteredPayments = payments.filter(p => p.type === 'expense');
        } else if (filter === 'pending') {
            filteredPayments = payments.filter(p => p.status === 'pending');
        }
        
        if (filteredPayments.length === 0) {
            emptyPayments.style.display = 'block';
        } else {
            emptyPayments.style.display = 'none';
            
            filteredPayments.forEach(payment => {
                const row = document.createElement('tr');
                
                // Format date
                const dateObj = new Date(payment.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                });
                
                // Status class
                let statusClass = '';
                if (payment.status === 'paid') statusClass = 'status-paid';
                if (payment.status === 'pending') statusClass = 'status-pending';
                if (payment.status === 'overdue') statusClass = 'status-overdue';
                
                // Find category color
                const categoryObj = categories.find(c => c.name === payment.category);
                const categoryColor = categoryObj ? categoryObj.color : '#adb5bd';
                
                row.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${payment.type === 'income' ? '#4cc9f0' : '#f72585'}"></div>
                            ${payment.name}
                        </div>
                    </td>
                    <td style="font-weight: 700; color: ${payment.type === 'income' ? '#2a9dbb' : '#d1145a'}">
                        ${payment.type === 'income' ? '+' : '-'}$${payment.amount.toFixed(2)}
                    </td>
                    <td>
                        <span class="category-tag" style="background-color: ${categoryColor}20; color: ${categoryColor}; padding: 5px 10px; border-radius: 50px; font-size: 12px;">
                            ${payment.category}
                        </span>
                    </td>
                    <td>${formattedDate}</td>
                    <td><span class="payment-status ${statusClass}">${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span></td>
                    <td>
                        <div class="payment-actions">
                            <button class="action-btn edit-btn" data-id="${payment.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" data-id="${payment.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                paymentsTableBody.appendChild(row);
            });
            
            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    editPayment(id);
                });
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    deletePayment(id);
                });
            });
        }
        
        // Update payments count
        totalPaymentsCount.textContent = payments.length;
    }

    // Update summary
    function updateSummary() {
        let totalIncomeAmount = 0;
        let totalExpensesAmount = 0;
        let pendingPayments = 0;
        let overduePayments = 0;
        
        payments.forEach(payment => {
            if (payment.type === 'income') {
                totalIncomeAmount += payment.amount;
            } else {
                totalExpensesAmount += payment.amount;
            }
            
            if (payment.status === 'pending') pendingPayments++;
            if (payment.status === 'overdue') overduePayments++;
        });
        
        const balance = totalIncomeAmount - totalExpensesAmount;
        
        // Update UI
        totalBalance.textContent = `$${balance.toFixed(2)}`;
        pendingCount.textContent = pendingPayments;
        overdueCount.textContent = overduePayments;
        totalIncome.textContent = `$${totalIncomeAmount.toFixed(2)}`;
        totalExpenses.textContent = `$${totalExpensesAmount.toFixed(2)}`;
    }

    // Update chart
    function updateChart() {
        // Calculate category totals
        const categoryTotals = {};
        categories.forEach(category => {
            categoryTotals[category.name] = 0;
        });
        
        // Only count expenses for the chart
        payments.forEach(payment => {
            if (payment.type === 'expense' && categoryTotals.hasOwnProperty(payment.category)) {
                categoryTotals[payment.category] += payment.amount;
            }
        });
        
        // Update chart data
        paymentChart.data.datasets[0].data = categories.map(category => categoryTotals[category.name]);
        paymentChart.update();
    }

    // Add or update payment
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('payment-name').value;
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const type = document.getElementById('payment-type').value;
        const category = document.querySelector('select').value || 'Other';
        const date = document.getElementById('payment-date').value;
        const status = document.getElementById('payment-status').value;
        
        if (editPaymentId) {
            // Update existing payment
            const index = payments.findIndex(p => p.id === editPaymentId);
            payments[index] = {
                id: editPaymentId,
                name,
                amount,
                type,
                category,
                date,
                status
            };
            
            // Reset edit mode
            cancelEditMode();
        } else {
            // Add new payment
            const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
            payments.push({
                id: newId,
                name,
                amount,
                type,
                category,
                date,
                status
            });
        }
        
        // Reset form
        paymentForm.reset();
        document.getElementById('payment-date').valueAsDate = new Date();
        
        // Update UI
        renderPayments(currentFilter);
        updateSummary();
        updateChart();
        
        // Show notification
        showNotification(editPaymentId ? 'Payment updated successfully!' : 'Payment added successfully!');
    });

    // Edit payment
    function editPayment(id) {
        const payment = payments.find(p => p.id === id);
        if (!payment) return;
        
        // Fill form with payment data
        document.getElementById('payment-name').value = payment.name;
        document.getElementById('payment-amount').value = payment.amount;
        document.getElementById('payment-type').value = payment.type;
        document.querySelector('select').value = payment.category;
        document.getElementById('payment-date').value = payment.date;
        document.getElementById('payment-status').value = payment.status;
        
        // Set active category tag
        document.querySelectorAll('.category-tag').forEach(tag => {
            if (tag.textContent === payment.category) {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });
        
        // Switch to edit mode
        editPaymentId = id;
        submitPaymentBtn.style.display = 'none';
        updatePaymentBtn.style.display = 'inline-flex';
        cancelEditBtn.style.display = 'inline-flex';
        
        // Scroll to form
        document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
    }

    // Cancel edit mode
    cancelEditBtn.addEventListener('click', cancelEditMode);
    
    function cancelEditMode() {
        editPaymentId = null;
        paymentForm.reset();
        document.getElementById('payment-date').valueAsDate = new Date();
        
        // Remove active class from all category tags
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.classList.remove('active');
        });
        
        // Switch back to add mode
        submitPaymentBtn.style.display = 'inline-flex';
        updatePaymentBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
    }

    // Delete payment
    function deletePayment(id) {
        if (confirm('Are you sure you want to delete this payment?')) {
            payments = payments.filter(p => p.id !== id);
            renderPayments(currentFilter);
            updateSummary();
            updateChart();
            showNotification('Payment deleted successfully!');
        }
    }

    // Filter payments
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter payments
            const filter = this.getAttribute('data-filter');
            renderPayments(filter);
        });
    });

    // Show notification
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#4361ee';
        notification.style.color = 'white';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        notification.style.zIndex = '1000';
        notification.style.transform = 'translateX(150%)';
        notification.style.transition = 'transform 0.3s ease';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(150%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Initialize the app
    initApp();
});