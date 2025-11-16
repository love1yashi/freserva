function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.username.value.trim();
    const password = form.password.value;

    // Validate login
    const users = JSON.parse(localStorage.getItem('freserva_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Store user data
        localStorage.setItem('freserva_user', JSON.stringify(user));
        
        // Get redirect URL or default to index
        const redirectUrl = localStorage.getItem('redirectAfterLogin') || '../index/index.html';
        localStorage.removeItem('redirectAfterLogin'); // Clear stored redirect
        
        // Show success message and redirect
        showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1000);
    } else {
        showMessage('Invalid username or password', 'error');
    }
}

function showMessage(text, type) {
    const el = document.getElementById('topMessage');
    el.className = 'message ' + (type || 'error');
    el.textContent = text;
    el.style.display = 'block';
    if (type === 'error') {
        setTimeout(() => {
            el.style.display = 'none';
        }, 6000);
    }
}