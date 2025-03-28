require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize subscribers file if it doesn't exist
const initSubscribersFile = async () => {
    try {
        await fs.access(SUBSCRIBERS_FILE);
        console.log('Subscribers file exists');
    } catch {
        // File doesn't exist, create it with empty array
        await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify([]));
        console.log('Created new subscribers file');
    }
};

// Initialize the subscribers file
initSubscribersFile();

// API Routes
app.post('/api/subscribe', async (req, res) => {
    try {
        console.log('Received subscription request:', req.body);
        const { email } = req.body;
        
        if (!email) {
            console.log('Error: Email is required');
            return res.status(400).json({ message: 'Email is required' });
        }

        // Read current subscribers
        const subscribers = JSON.parse(await fs.readFile(SUBSCRIBERS_FILE));
        console.log('Current subscribers:', subscribers);
        
        // Check if email already exists
        if (subscribers.some(sub => sub.email === email)) {
            console.log('Error: Email already subscribed:', email);
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        // Add new subscriber
        subscribers.push({
            email: email,
            subscribedAt: new Date().toISOString()
        });

        // Save updated subscribers
        await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
        console.log('Successfully added new subscriber:', email);

        res.status(201).json({ message: 'Successfully subscribed' });
    } catch (error) {
        console.error('Subscription error:', error.message);
        res.status(500).json({ message: 'Error processing subscription' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 