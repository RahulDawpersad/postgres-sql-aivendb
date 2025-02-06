require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

// PostgreSQL Connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }  // Aiven requires SSL
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));  // Serve static files like HTML

// Route to serve the registration form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// Handle form submission
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        res.send('Registration Successful! 🎉');
    } catch (err) {
        console.error(err);
        res.send('Error: Could not register user.');
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
