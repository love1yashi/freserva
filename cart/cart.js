document.addEventListener('DOMContentLoaded', function () {
    const cartContainer = document.getElementById('cart-items-container');
    const itemCountElem = document.getElementById('item-count');
    const subtotalElem = document.getElementById('subtotal');
    const deliveryFeeElem = document.getElementById('delivery-fee');
    const totalElem = document.getElementById('total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');

    const deliveryFee = 50;

    // Function to load cart from reservations
    function loadCart() {
        const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
        if (!user) {
            window.location.href = '../login/login.html';
            return;
        }

        const reservationsKey = `freserva_reservations_${user.username}`;
        const storedReservations = JSON.parse(localStorage.getItem(reservationsKey) || '[]');

        cartContainer.innerHTML = '';
        let totalItems = 0;
        let subtotal = 0;
        let selectedItems = [];

        if (storedReservations.length > 0) {
            storedReservations.forEach(reservation => {
                reservation.items.forEach(item => {
                    const itemPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                    totalItems += item.qty;
                    subtotal += itemPrice * item.qty;

                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'cart-item';
                    itemDiv.dataset.id = item.id;

                    // Checkbox
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'item-checkbox';
                    checkbox.checked = true; // Default to checked
                    checkbox.addEventListener('change', updateTotals);
                    itemDiv.appendChild(checkbox);

                    // Image
                    const img = document.createElement('img');
                    img.src = item.img || '../assets/broccolii.png';
                    img.alt = item.name;
                    itemDiv.appendChild(img);

                    // Info container
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'item-info';

                    const title = document.createElement('div');
                    title.className = 'item-title';
                    title.textContent = item.name;
                    infoDiv.appendChild(title);

                    const weight = document.createElement('div');
                    weight.className = 'item-weight';
                    weight.textContent = item.weight || '1kg'; // Assuming default
                    infoDiv.appendChild(weight);

                    // Quantity controls
                    const qtyControls = document.createElement('div');
                    qtyControls.className = 'qty-controls';

                    const minusBtn = document.createElement('button');
                    minusBtn.textContent = '-';
                    minusBtn.addEventListener('click', () => updateQuantity(item.id, -1));
                    qtyControls.appendChild(minusBtn);

                    const qtySpan = document.createElement('span');
                    qtySpan.textContent = item.qty;
                    qtyControls.appendChild(qtySpan);

                    const plusBtn = document.createElement('button');
                    plusBtn.textContent = '+';
                    plusBtn.addEventListener('click', () => updateQuantity(item.id, 1));
                    qtyControls.appendChild(plusBtn);

                    infoDiv.appendChild(qtyControls);
                    itemDiv.appendChild(infoDiv);

                    // Price
                    const priceDiv = document.createElement('div');
                    priceDiv.className = 'price';
                    priceDiv.innerHTML = `
                        <div>Unit: ₱${itemPrice.toFixed(2)}</div>
                        <div>Total: ₱${(itemPrice * item.qty).toFixed(2)}</div>
                    `;
                    itemDiv.appendChild(priceDiv);

                    // Remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'delete-btn';
                    removeBtn.textContent = '×';
                    removeBtn.addEventListener('click', () => removeItem(item.id));
                    itemDiv.appendChild(removeBtn);

                    cartContainer.appendChild(itemDiv);
                });
            });
        } else {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        }

        itemCountElem.textContent = totalItems;
        subtotalElem.textContent = `₱${subtotal.toFixed(2)}`;
        deliveryFeeElem.textContent = `₱${deliveryFee.toFixed(2)}`;
        totalElem.textContent = `₱${(subtotal + deliveryFee).toFixed(2)}`;

        // Update select all checkbox
        updateSelectAllCheckbox();
    }

    // Function to update quantity
    function updateQuantity(itemId, delta) {
        const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
        if (!user) return;

        const reservationsKey = `freserva_reservations_${user.username}`;
        const storedReservations = JSON.parse(localStorage.getItem(reservationsKey) || '[]');

        storedReservations.forEach(reservation => {
            reservation.items.forEach(item => {
                if (item.id === itemId) {
                    item.qty = Math.max(1, item.qty + delta);
                    // Recalculate reservation totals
                    reservation.subtotal = reservation.items.reduce((sum, i) => sum + (parseFloat(i.price.replace(/[^0-9.]/g, '')) * i.qty), 0);
                    reservation.total = reservation.subtotal + reservation.deliveryFee;
                }
            });
        });

        localStorage.setItem(reservationsKey, JSON.stringify(storedReservations));
        loadCart(); // Refresh the cart
    }

    // Function to remove item
    function removeItem(itemId) {
        const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
        if (!user) return;

        const reservationsKey = `freserva_reservations_${user.username}`;
        const storedReservations = JSON.parse(localStorage.getItem(reservationsKey) || '[]');

        storedReservations.forEach(reservation => {
            reservation.items = reservation.items.filter(item => item.id !== itemId);
        });

        // Remove empty reservations
        const filteredReservations = storedReservations.filter(reservation => reservation.items.length > 0);

        localStorage.setItem(reservationsKey, JSON.stringify(filteredReservations));
        loadCart(); // Refresh the cart
    }

    // Place order handler
    placeOrderBtn.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
        if (!user) {
            window.location.href = '../login/login.html';
            return;
        }

        const reservationsKey = `freserva_reservations_${user.username}`;
        const storedReservations = JSON.parse(localStorage.getItem(reservationsKey) || '[]');

        if (storedReservations.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Get selected items
        const selectedItems = [];
        const itemCheckboxes = document.querySelectorAll('.item-checkbox:checked');

        if (itemCheckboxes.length === 0) {
            alert('Please select at least one item to checkout.');
            return;
        }

        itemCheckboxes.forEach(checkbox => {
            const itemDiv = checkbox.closest('.cart-item');
            const itemId = itemDiv.dataset.id;

            storedReservations.forEach(reservation => {
                reservation.items.forEach(item => {
                    if (item.id === itemId) {
                        selectedItems.push(item);
                    }
                });
            });
        });

        let subtotal = selectedItems.reduce((sum, item) => sum + parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.qty, 0);
        const total = subtotal + deliveryFee;

        // Create order
        const order = {
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            items: selectedItems,
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            total: total,
            status: 'pending',
            date: new Date().toISOString(),
            deliveryAddress: '123 abcd street, barangay addition hills, Mandaluyong City 1550'
        };

        // Save order
        const ordersKey = `freserva_orders_${user.username}`;
        const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        existingOrders.push(order);
        localStorage.setItem(ordersKey, JSON.stringify(existingOrders));

        // Remove selected items from reservations
        storedReservations.forEach(reservation => {
            reservation.items = reservation.items.filter(item => !selectedItems.some(selected => selected.id === item.id));
        });

        // Remove empty reservations
        const filteredReservations = storedReservations.filter(reservation => reservation.items.length > 0);
        localStorage.setItem(reservationsKey, JSON.stringify(filteredReservations));

        loadCart(); // Refresh cart

        // Navigate to order placed page
        window.location.href = '../order/order-placed.html';
    });

    // Function to update totals based on selected items
    function updateTotals() {
        const itemCheckboxes = document.querySelectorAll('.item-checkbox');
        let selectedSubtotal = 0;
        let selectedItemsCount = 0;

        itemCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const itemDiv = checkbox.closest('.cart-item');
                const itemId = itemDiv.dataset.id;
                const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
                const reservationsKey = `freserva_reservations_${user.username}`;
                const storedReservations = JSON.parse(localStorage.getItem(reservationsKey) || '[]');

                storedReservations.forEach(reservation => {
                    reservation.items.forEach(item => {
                        if (item.id === itemId) {
                            const itemPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                            selectedSubtotal += itemPrice * item.qty;
                            selectedItemsCount += item.qty;
                        }
                    });
                });
            }
        });

        subtotalElem.textContent = `₱${selectedSubtotal.toFixed(2)}`;
        totalElem.textContent = `₱${(selectedSubtotal + deliveryFee).toFixed(2)}`;
        itemCountElem.textContent = selectedItemsCount;

        // Update select all checkbox
        updateSelectAllCheckbox();

        // Enable/disable place order button
        placeOrderBtn.disabled = selectedItemsCount === 0;
    }

    // Function to update select all checkbox state
    function updateSelectAllCheckbox() {
        const itemCheckboxes = document.querySelectorAll('.item-checkbox');
        const checkedBoxes = document.querySelectorAll('.item-checkbox:checked');

        if (itemCheckboxes.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedBoxes.length === itemCheckboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedBoxes.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }

    // Select all checkbox event listener
    selectAllCheckbox.addEventListener('change', () => {
        const itemCheckboxes = document.querySelectorAll('.item-checkbox');
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        updateTotals();
    });

    // Load cart on page load
    loadCart();
});
