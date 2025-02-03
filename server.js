const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to PostgreSQL
const pool = new Pool({
    user: 'your_pg_user',
    host: 'localhost',
    database: 'viti_game',
    password: 'your_password',
    port: 5432, // Default PostgreSQL port
});

pool.query(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    matches INTEGER DEFAULT 0,
    gamesPlayed INTEGER DEFAULT 0
)`);

app.post('/login', async (req, res) => {
    const { username } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            await pool.query('INSERT INTO users (username) VALUES ($1)', [username]);
            res.json({ username, matches: 0, gamesPlayed: 0 });
        }
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/update-stats', async (req, res) => {
    const { username, matches, gamesPlayed } = req.body;
    try {
        await pool.query(
            'UPDATE users SET matches = matches + $1, gamesPlayed = gamesPlayed + $2 WHERE username = $3',
            [matches, gamesPlayed, username]
        );
        res.json({ message: 'Stats updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/stats/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
