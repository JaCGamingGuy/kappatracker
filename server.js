const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { v4: uuidv4 } = require('uuid'); // Import uuid library
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable for port

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Session configuration
app.use(session({
    store: new FileStore({}),
    secret: secretKey, // Use environment variable for session secret
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 60 * 60 * 1000 // 1 hour
    }
}));

const readUsers = () => {
    const data = fs.readFileSync('users.json');
    return JSON.parse(data);
};

const saveUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
};

// Check login status endpoint
app.get('/api/status', (req, res) => {
    try {
        if (req.session.userId) {
            const users = readUsers();
            const user = users.find(u => u.id === req.session.userId);
            if (user) {
                res.json({ loggedIn: true, username: user.username });
            } else {
                res.json({ loggedIn: false });
            }
        } else {
            res.json({ loggedIn: false });
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        res.status(500).json({ message: 'Failed to retrieve login status' });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Failed to logout' });
            }
            res.clearCookie('connect.sid'); // Clear session cookie
            res.json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Failed to logout' });
    }
});

// Login route
app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const users = readUsers();
        const user = users.find(u => u.username === username);

        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id; // Save user ID in session
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Failed to login' });
    }
});

// Signup route
app.post('/signup', (req, res) => {
    try {
        const { username, password } = req.body;
        const users = readUsers();
        const existingUser = users.find(u => u.username === username);

        if (existingUser) {
            res.status(409).json({ message: 'Username already taken' });
        } else {
            const hashedPassword = bcrypt.hashSync(password, 8);
            const newUser = {
                id: uuidv4(), // Generate unique ID
                username,
                password: hashedPassword
            };
            users.push(newUser);
            saveUsers(users);
            res.json({ message: 'Signup successful' });
        }
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Failed to signup' });
    }
});



// Middleware to protect routes
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'You must be logged in to access this resource' });
    }
    next();
};

// Serve the protected.html file on the /protected route
app.get('/protected', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'protected_files', 'protected.html'));
});

// Serve index.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ message: 'Something went wrong' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// Add readCompletedItems and saveCompletedItems functions
const readCompletedItems = () => {
    try {
        const data = fs.readFileSync('completed_items.json');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading completed items:', error);
        return {};
    }
};

const saveCompletedItems = (completedItems) => {
    try {
        fs.writeFileSync('completed_items.json', JSON.stringify(completedItems, null, 2));
    } catch (error) {
        console.error('Error saving completed items:', error);
    }
};

// Endpoint to get completed items for the logged-in user
app.get('/api/completed-items', requireLogin, (req, res) => {
    const completedItems = readCompletedItems();
    const userCompletedItems = completedItems[req.session.userId] || [];
    res.json({ completedItems: userCompletedItems });
});

// Endpoint to update completed items for the logged-in user
app.post('/api/completed-items', requireLogin, (req, res) => {
    const { itemId, completed } = req.body;
    const completedItems = readCompletedItems();

    if (!completedItems[req.session.userId]) {
        completedItems[req.session.userId] = [];
    }

    if (completed) {
        completedItems[req.session.userId].push(itemId);
    } else {
        completedItems[req.session.userId] = completedItems[req.session.userId].filter(id => id !== itemId);
    }

    saveCompletedItems(completedItems);
    res.json({ message: 'Completed items updated' });
});