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

// API Endpoints
const API_BASE_URL = 'https://api.jasaotp.id/v1';

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Check Balance
app.get('/api/balance', async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/balance.php?api_key=${process.env.API_KEY}`);
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
  const { country, service, operator } = req.query;
  try {
    const response = await fetch(
      `${API_BASE_URL}/order.php?api_key=${process.env.API_KEY}&negara=${country}&layanan=${service}&operator=${operator}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check OTP
app.get('/api/otp', async (req, res) => {
  const { orderId } = req.query;
  try {
    const response = await fetch(`${API_BASE_URL}/sms.php?api_key=${process.env.API_KEY}&id=${orderId}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel Order
app.get('/api/cancel', async (req, res) => {
  const { orderId } = req.query;
  try {
    const response = await fetch(`${API_BASE_URL}/cancel.php?api_key=${process.env.API_KEY}&id=${orderId}`);
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server error!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
