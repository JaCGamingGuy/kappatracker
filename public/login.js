document.addEventListener('DOMContentLoaded', async () => {
    // Function to show login form and hide signup form
    const showLoginForm = () => {
        const loginContainer = document.getElementById('loginContainer');
        const signupContainer = document.getElementById('signupContainer');
        if (loginContainer && signupContainer) {
            loginContainer.style.display = 'block';
            signupContainer.style.display = 'none';
        } else {
            console.error('Login or signup container not found.');
        }
    };

    // Function to show signup form and hide login form
    const showSignupForm = () => {
        const loginContainer = document.getElementById('loginContainer');
        const signupContainer = document.getElementById('signupContainer');
        if (loginContainer && signupContainer) {
            signupContainer.style.display = 'block';
            loginContainer.style.display = 'none';
        } else {
            console.error('Login or signup container not found.');
        }
    };

    // Initial setup to display login form
    showLoginForm();

    // Function to handle login form submission
    const handleLogin = async (username, password) => {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            const messageElement = document.getElementById('loginMessage');
            messageElement.textContent = result.message;

            if (response.ok) {
                messageElement.style.color = 'green';
                // Redirect to protected page upon successful login
                window.location.href = '/protected';
            } else {
                messageElement.style.color = 'red';
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        await handleLogin(username, password);
    });

    // Signup form submission
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;

        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        const messageElement = document.getElementById('signupMessage');
        messageElement.textContent = result.message;

        if (response.ok) {
            messageElement.style.color = 'green';
        } else {
            messageElement.style.color = 'red';
        }
    });

    // Register link click event to show sign-up form
    document.getElementById('showSignup')?.addEventListener('click', (e) => {
        e.preventDefault();
        showSignupForm();
    });

    // Login link click event to show login form
    document.getElementById('showLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
});
