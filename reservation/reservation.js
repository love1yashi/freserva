document.addEventListener('DOMContentLoaded', function () {
    const reservationContainer = document.querySelector('.reservation-cards-container');

    function loadReservationsFromStorage() {
        const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
        if (!user) {
            // Redirect to login if not logged in
            window.location.href = '..//login/login.html';
            return;
        }

        const reservationsKey = `freserva_reservations_${user.username}`;
        const storedReservations = JSON.parse(localStorage.getItem(reservationsKey) || '[]');

        // Clear existing cards
        reservationContainer.innerHTML = '';

        if (storedReservations.length > 0) {
            // Display each item in each reservation as a card
            storedReservations.forEach(reservation => {
                reservation.items.forEach(item => {
                    const cardEl = document.createElement('div');
                    cardEl.className = 'reservation-card';

                    // Create order number if not exists
                    if (!reservation.orderNumber) {
                        reservation.orderNumber = '#' + Math.random().toString(36).substr(2, 9).toUpperCase();
                    }

                    cardEl.innerHTML = `
                        <div class="item-top-section">
                            <div class="item-visual">
                                <img src="${item.img || '..//assets/broccolii.png'}" alt="${item.name}" class="item-image">
                            </div>
                            <div class="item-details">
                                <h3 class="item-name">${item.name}</h3>
                                <p class="item-price">${item.price}</p>
                                <p class="item-quantity">Quantity: ${item.qty}</p>
                                <div class="vendor-name">
                                    <img src="${item.vendorIcon || '..//assets/alingmyrnaa.png'}" alt="Vendor" class="vendor-icon">
                                    <span>${item.vendor || 'Aling Myrna\'s stall'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="delivery-info">
                            <p class="info-line">
                                <img src="..//assets/calendar.png" alt="Calendar" class="info-icon">
                                <span class="info-value"><strong>Delivery date:</strong> ${reservation.deliveryDate || 'July 05, 2025'}</span>
                            </p>
                            <p class="info-line">
                                <img src="..//assets/clock.png" alt="Clock" class="info-icon">
                                <span class="info-value"><strong>Delivery time:</strong> ${reservation.deliveryTime || '1:00 PM - 2:00 PM'}</span>
                            </p>
                            <p class="info-line">
                                <img src="..//assets/location.png" alt="Location" class="info-icon">
                                <span class="info-value address"><strong>Delivery address:</strong> ${reservation.address || '123 abc street barangay Addition hills, Mandaluyong City 1550'}</span>
                            </p>
                        </div>
                        <div class="card-actions">
                            <button class="action-btn edit-btn" onclick="editReservation('${reservation.id}', '${item.id}')">Edit</button>
                            <button class="action-btn mark-delivered-btn" onclick="markAsDelivered('${reservation.id}', '${item.id}')">Mark as Delivered</button>
                        </div>
                    `;
                    reservationContainer.appendChild(cardEl);
                });
            });
        } else {
            // Show empty state
            reservationContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No reservations yet. Start reserving products from the home page!</p>';
        }
    }

    // Function to edit reservation
    window.editReservation = function(reservationId) {
        // For now, just show an alert. In a real app, this would navigate to edit page or open modal
        alert('Edit functionality for reservation ' + reservationId + ' will be implemented.');
    };

    // Function to mark as delivered
    window.markAsDelivered = function(reservationId, itemId) {
        if (confirm('Mark this reservation as delivered?')) {
            const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
            if (!user) return;

            const reservationsKey = `freserva_reservations_${user.username}`;
            const storedReservations = JSON.parse(localStorage.getItem(reservationsKey) || '[]');
            const updatedReservations = storedReservations.map(res => {
                if (res.id === reservationId) {
                    res.items = res.items.filter(item => item.id !== itemId);
                }
                return res;
            }).filter(res => res.items.length > 0); // Remove reservations with no items
            localStorage.setItem(reservationsKey, JSON.stringify(updatedReservations));
            loadReservationsFromStorage(); // Refresh the display
            alert('Reservation marked as delivered.');
        }
    };

    // Load reservations on page load
    loadReservationsFromStorage();
});
