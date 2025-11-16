document.addEventListener('DOMContentLoaded', function () {
    // Menu sidebar toggle + outside click to close
    const menuBtn = document.getElementById('menuBtn');
    const menuSidebar = document.getElementById('menuSidebar');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

    if (menuBtn && menuSidebar) {
        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            menuSidebar.classList.toggle('open');
            const opened = menuSidebar.classList.contains('open');
            menuBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
            menuSidebar.setAttribute('aria-hidden', opened ? 'false' : 'true');
        });

        // Close sidebar when clicking the X button
        if (sidebarCloseBtn) {
            sidebarCloseBtn.addEventListener('click', function () {
                menuSidebar.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuSidebar.setAttribute('aria-hidden', 'true');
            });
        }

        // close when clicking outside
        document.addEventListener('click', function (e) {
            if (!menuSidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                menuSidebar.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuSidebar.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Account dropdown toggle + outside click to close
    const accountBtn = document.getElementById('accountBtn');
    const accountDropdown = accountBtn ? accountBtn.closest('.account-dropdown') : null;
    const dropdownContent = accountDropdown ? accountDropdown.querySelector('.dropdown-content') : null;

    // Function to update dropdown content based on login status
    function updateAccountDropdown() {
        const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
        if (user) {
            // Logged in: show username and logout
            accountBtn.innerHTML = `<span>${user.username}</span><span class="dropdown-arrow">▼</span>`;
            if (dropdownContent) {
                dropdownContent.innerHTML = '<a href="#" id="logoutLink">Logout</a>';
                // Add logout handler
                const logoutLink = document.getElementById('logoutLink');
                if (logoutLink) {
                    logoutLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        // Clear user and cart on logout
                        localStorage.removeItem('freserva_user');
                        // Cart is per user, so no need to clear global cart
                        // Redirect to home or login
                        window.location.href = '../index/index.html';
                    });
                }
            }
        } else {
            // Not logged in: show ACCOUNT and login/signup
            accountBtn.innerHTML = `<span>ACCOUNT</span><span class="dropdown-arrow">▼</span>`;
            if (dropdownContent) {
                dropdownContent.innerHTML = `
                    <a href="../login/login.html">Login</a>
                    <a href="../login/signup.html">Sign up</a>
                `;
            }
        }
        // No fade-in needed to prevent flickering
    }

    // Set initial account button text based on login status to prevent flicker
    const initialUser = JSON.parse(localStorage.getItem('freserva_user') || 'null');
    if (initialUser) {
        accountBtn.innerHTML = `<span>${initialUser.username}</span><span class="dropdown-arrow">▼</span>`;
    } else {
        accountBtn.innerHTML = `<span>ACCOUNT</span><span class="dropdown-arrow">▼</span>`;
    }

    // Initial update - no opacity manipulation to prevent flickering
    updateAccountDropdown();

    if (accountBtn && accountDropdown) {
        accountBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            accountDropdown.classList.toggle('open');
            const opened = accountDropdown.classList.contains('open');
            accountBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
            if (dropdownContent) dropdownContent.setAttribute('aria-hidden', opened ? 'false' : 'true');
        });

        // close when clicking outside
        document.addEventListener('click', function (e) {
            if (!accountDropdown.contains(e.target)) {
                accountDropdown.classList.remove('open');
                accountBtn.setAttribute('aria-expanded', 'false');
                if (dropdownContent) dropdownContent.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Handle nav item clicks with smooth sliding underline transition
    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    const navMenu = document.querySelector('.nav-menu');

    // Initialize active nav item on page load
    function initializeActiveNav() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-menu .nav-item');

        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Initialize active sidebar links
        const sidebarLinks = document.querySelectorAll('.menu-sidebar .sidebar-content a');
        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Initialize on load
    initializeActiveNav();

    navItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (!href) return;

            // Remove active class from all nav items and add to clicked item
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');

            // Add smooth transition delay before navigation
            setTimeout(() => {
                window.location.href = href;
            }, 150); // Small delay to allow animation to start
        });
    });

    // Make the header logo clickable (click anywhere inside .logo navigates)
    document.querySelectorAll('.logo').forEach(logoEl => {
        logoEl.style.cursor = 'pointer';
        logoEl.addEventListener('click', function (e) {
            // prefer existing anchor inside .logo
            const a = logoEl.querySelector('a[href]') || logoEl.closest('a[href]');
            const href = a ? a.getAttribute('href') : (logoEl.dataset.href || '../index/index.html');
            if (!href) return;
            // allow normal anchor default if clicked on the anchor itself
            if (e.target.closest('a')) return;
            // Navigate immediately without fade transition
            window.location.href = href;
        });
    });

    // Preload other pages for faster navigation
    const pagesToPreload = [
        '../reservation/reservation.html',
        '../vendor/vendors.html',
        '../about/about.html',
        '../cart/cart.html'
    ];

    pagesToPreload.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
    });

    // Update navbar cart count only
    function updateNavCounts() {
        const user = JSON.parse(localStorage.getItem('freserva_user') || 'null');
        let cartCount = 0;
        if (user) {
            const reservationsKey = `freserva_reservations_${user.username}`;
            const storedReservations = JSON.parse(localStorage.getItem(reservationsKey) || '[]');
            cartCount = storedReservations.reduce((total, reservation) => total + reservation.items.reduce((sum, item) => sum + item.qty, 0), 0);
        }

        // Update cart count
        const cartBtn = document.querySelector('.cart-btn');
        if (cartBtn) {
            let cartCounter = cartBtn.querySelector('.cart-count');
            if (!cartCounter) {
                cartCounter = document.createElement('span');
                cartCounter.className = 'cart-count';
                cartBtn.appendChild(cartCounter);
            }
            cartCounter.textContent = cartCount > 99 ? '99+' : cartCount;
            cartCounter.style.display = cartCount > 0 ? 'block' : 'none';
        }

        // Also update cart title count if on cart page
        const cartTitleCount = document.getElementById('cartCount');
        if (cartTitleCount) {
            cartTitleCount.textContent = cartCount;
        }
    }

    // Update counts on page load
    updateNavCounts();

    // Update counts when localStorage changes (for cross-tab updates)
    window.addEventListener('storage', updateNavCounts);

    // Smooth page transition: fade out on internal link clicks, fade in on load
    (function () {
      const FADE_DURATION = 260; // matches CSS transition duration in ms
      const body = document.body;

      // Ensure transition class exists on the body
      function initPageTransition() {
        body.classList.add('page-transition');

        // Start with a quick fade-in on load
        // Add an exit state first so removal will trigger the CSS transition to 1
        body.classList.add('page-exit');
        // next frame remove exit to fade in
        requestAnimationFrame(() => {
          body.classList.remove('page-exit');
        });
      }

      // Intercept clicks on local links and do a fade-out before navigation
      function bindLinkTransitions() {
        document.addEventListener('click', (e) => {
          const a = e.target.closest('a');
          if (!a) return;

          const href = a.getAttribute('href');
          // Ignore external links, anchors, mailto, javascript, links with target=_blank,
          // and links marked with data-no-transition
          if (!href ||
              href.startsWith('http') && new URL(href, location.href).origin !== location.origin ||
              href.startsWith('#') ||
              href.startsWith('mailto:') ||
              href.startsWith('javascript:') ||
              a.target === '_blank' ||
              a.hasAttribute('data-no-transition')) {
            return;
          }

          // Allow same-page navigation to anchor without transition
          const url = new URL(href, location.href);
          if (url.pathname === location.pathname && url.hash) {
            return; // let default behavior jump to anchor
          }

          // Prevent instant navigation, play exit animation, then navigate
          e.preventDefault();
          body.classList.add('page-exit');

          setTimeout(() => {
            window.location.href = url.href;
          }, FADE_DURATION);
        }, { capture: true });
      }

      // Initialize
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          initPageTransition();
          bindLinkTransitions();
        });
      } else {
        initPageTransition();
        bindLinkTransitions();
      }
    })();
});
