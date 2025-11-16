// Category filter logic
document.addEventListener('DOMContentLoaded', function() {
    // Navigation active state - set initial active state based on current page
    const navLinks = document.querySelectorAll('.nav-menu .nav-item');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Check if current path ends with or includes the href
        if (href && (currentPath.endsWith(href) || currentPath.includes(href.split('/').pop()))) {
            link.classList.add('active');
        }
    });

    // Category switching functionality
    const categoryLinks = document.querySelectorAll('.category-nav a');
    const productGrids = document.querySelectorAll('.product-grid');

    // Initially hide all grids except vegetables
    productGrids.forEach(grid => {
        if (grid.id !== 'vegetables') {
            grid.style.display = 'none';
        }
    });

    // Check URL hash and activate corresponding category on page load
    const urlHash = window.location.hash.substring(1); // Remove the '#'
    if (urlHash && ['vegetables', 'meat', 'seafood', 'fruits'].includes(urlHash)) {
        // Update active category
        categoryLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.category-nav a[href="#${urlHash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Show the corresponding grid
        productGrids.forEach(grid => {
            if (grid.id === urlHash) {
                grid.style.display = 'grid';
                grid.style.opacity = '1';
                grid.style.transform = 'translateY(0)';
                grid.style.pointerEvents = 'auto';
            } else {
                grid.style.display = 'none';
            }
        });
    }

    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Update active category
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Smooth transition: fade out current, fade in new
            const categoryId = this.getAttribute('href').substring(1);
            const selectedGrid = document.getElementById(categoryId);

            if (selectedGrid) {
                // First, hide all grids and fade out visible ones
                productGrids.forEach(grid => {
                    if (grid.id !== categoryId) {
                        grid.style.display = 'none';
                    }
                    grid.style.opacity = '0';
                    grid.style.transform = 'translateY(10px)';
                    grid.style.pointerEvents = 'none';
                });

                // Then show and fade in the selected grid after a brief delay
                setTimeout(() => {
                    selectedGrid.style.display = 'grid'; // or 'flex' depending on layout
                    selectedGrid.style.opacity = '1';
                    selectedGrid.style.transform = 'translateY(0)';
                    selectedGrid.style.pointerEvents = 'auto';
                }, 100); // Fast transition
            }
        });
    });

    // Cart functionality
    const cartBtn = document.querySelector('.cart-btn');
    let cartCount = 0;

    function updateCartCount() {
        const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
        if (user) {
            const reservationsKey = `freserva_reservations_${user.username}`;
            const storedReservations = JSON.parse(localStorage.getItem(reservationsKey) || '[]');
            cartCount = storedReservations.reduce((total, reservation) => total + reservation.items.reduce((sum, item) => sum + item.qty, 0), 0);
        } else {
            cartCount = 0;
        }

        const cartCounter = document.querySelector('.cart-count') ||
            cartBtn.appendChild(document.createElement('span'));
        cartCounter.className = 'cart-count';
        cartCounter.textContent = cartCount > 99 ? '99+' : cartCount;
        cartCounter.style.display = cartCount > 0 ? 'block' : 'none';
    }

    // Reserve button functionality
    const reserveBtns = document.querySelectorAll('.reserve-btn');
    reserveBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
            if (!user) {
                // Redirect to login if not logged in
                localStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = '../login/login.html';
                return;
            }

            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent.trim();
            const productPrice = productCard.querySelector('.product-price').textContent;
            const productImg = productCard.querySelector('img').src;

            // Create product object
            const product = {
                id: 'p-' + productName.toLowerCase().replace(/\s+/g, '-'),
                name: productName,
                qty: 1,
                unit: parseFloat(productPrice.replace(/[^0-9.]/g, '')),
                price: productPrice,
                img: productImg,
                vendor: 'Mandaluyong Wet Market', // Assuming default vendor
                vendorIcon: '../assets/vendors.png', // Assuming default icon
                reservedAt: new Date().toISOString()
            };

            // Add to user-specific reservations in localStorage
            const reservationsKey = `freserva_reservations_${user.username}`;
            let reservations = JSON.parse(localStorage.getItem(reservationsKey) || '[]');

            // Find the latest reservation or create a new one if none exists
            let currentReservation;
            if (reservations.length > 0) {
                currentReservation = reservations[reservations.length - 1];
            } else {
                currentReservation = {
                    id: Date.now().toString(),
                    orderNumber: '#' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    items: [],
                    subtotal: 0,
                    deliveryFee: 50, // Assuming default delivery fee
                    total: 0,
                    timestamp: new Date().toISOString(),
                    deliveryDate: '2023-12-15', // Placeholder
                    deliveryTime: '10:00 AM', // Placeholder
                    address: '123 Sample Address, Mandaluyong' // Placeholder
                };
                reservations.push(currentReservation);
            }

            // Check if the product already exists in the current reservation
            const existingItemIndex = currentReservation.items.findIndex(item => item.id === product.id);
            if (existingItemIndex >= 0) {
                // Increase quantity if exists
                currentReservation.items[existingItemIndex].qty += 1;
            } else {
                // Add new item
                currentReservation.items.push(product);
            }

            // Recalculate totals
            currentReservation.subtotal = currentReservation.items.reduce((sum, item) => sum + (item.unit * item.qty), 0);
            currentReservation.total = currentReservation.subtotal + currentReservation.deliveryFee;

            localStorage.setItem(reservationsKey, JSON.stringify(reservations));

            updateCartCount();

            // Visual feedback
            this.textContent = 'Reserved!';
            this.style.backgroundColor = '#2a5420';
            setTimeout(() => {
                this.textContent = 'Reserve';
                this.style.backgroundColor = '';
            }, 1000);
        });
    });

    // --- Cart image + click behaviour (added, does not modify HTML file) ---
    if (!cartBtn) return;

    // Ensure an <img> exists (fixes the broken/missing attribute in HTML)
    let cartImg = cartBtn.querySelector('img');
    if (!cartImg) {
        cartImg = document.createElement('img');
        cartImg.className = 'icon';
        cartBtn.insertBefore(cartImg, cartBtn.firstChild);
    }

    // Set image source and accessibility attributes
    cartImg.src = '../assets/cart.png';
    cartImg.alt = 'Cart';

    // Visible icon size 32x32, keep hit target >= 44x44
    cartImg.style.width = '32px';
    cartImg.style.height = '32px';
    cartImg.style.objectFit = 'contain';
    cartImg.style.pointerEvents = 'none'; // let the button handle clicks

    // Ensure button has accessible hit area and pointer cursor
    cartBtn.style.minWidth = '44px';
    cartBtn.style.minHeight = '44px';
    cartBtn.style.padding = cartBtn.style.padding || '6px';
    cartBtn.style.display = cartBtn.style.display || 'inline-flex';
    cartBtn.style.alignItems = 'center';
    cartBtn.style.justifyContent = 'center';
    cartBtn.style.cursor = 'pointer';

    // Click -> open cart page
    cartBtn.addEventListener('click', function (e) {
        // Navigate immediately without fade transition
        window.location.href = '../cart/cart.html';
    });
});