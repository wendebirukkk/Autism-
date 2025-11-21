// Simple authentication system
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    clearErrors();
}

function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    clearErrors();
}

function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.textContent = '');
    document.getElementById('auth-error').textContent = '';
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('auth-error');

    // Simple validation
    if (!email || !password) {
        errorElement.textContent = 'Please fill in all fields';
        return;
    }

    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Store current user session
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Redirect to home page
        window.location.href = 'home.html';
    } else {
        errorElement.textContent = 'Invalid email or password';
    }
}

function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const errorElement = document.getElementById('auth-error');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        errorElement.textContent = 'Please fill in all fields';
        return;
    }

    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        return;
    }

    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        errorElement.textContent = 'User with this email already exists';
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    // Redirect to home page
    window.location.href = 'home.html';
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'home.html';
    }
});