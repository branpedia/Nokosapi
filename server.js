require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Key Management
let userApiKey = process.env.API_KEY || '';

app.post('/api/set-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: 'API Key is required' });
  }
  userApiKey = apiKey;
  res.json({ success: true, message: 'API Key saved' });
});

// API Endpoints
const API_BASE_URL = 'https://api.jasaotp.id/v1';

// Check Balance
app.get('/api/balance', async (req, res) => {
  if (!userApiKey) {
    return res.status(400).json({ error: 'API Key not set' });
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/balance.php?api_key=${userApiKey}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Countries
app.get('/api/countries', async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/negara.php`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Operators
app.get('/api/operators', async (req, res) => {
  const { country } = req.query;
  try {
    const response = await fetch(`${API_BASE_URL}/operator.php?negara=${country}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Services
app.get('/api/services', async (req, res) => {
  const { country } = req.query;
  try {
    const response = await fetch(`${API_BASE_URL}/layanan.php?negara=${country}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Order
app.get('/api/order', async (req, res) => {
  if (!userApiKey) {
    return res.status(400).json({ error: 'API Key not set' });
  }

  const { country, service, operator } = req.query;
  try {
    const response = await fetch(
      `${API_BASE_URL}/order.php?api_key=${userApiKey}&negara=${country}&layanan=${service}&operator=${operator}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check OTP
app.get('/api/otp', async (req, res) => {
  if (!userApiKey) {
    return res.status(400).json({ error: 'API Key not set' });
  }

  const { orderId } = req.query;
  try {
    const response = await fetch(`${API_BASE_URL}/sms.php?api_key=${userApiKey}&id=${orderId}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel Order
app.get('/api/cancel', async (req, res) => {
  if (!userApiKey) {
    return res.status(400).json({ error: 'API Key not set' });
  }

  const { orderId } = req.query;
  try {
    const response = await fetch(`${API_BASE_URL}/cancel.php?api_key=${userApiKey}&id=${orderId}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
