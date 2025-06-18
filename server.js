require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Better body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Key Storage
const apiKeys = {};

// API Key Endpoint with Validation
app.post('/api/set-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    // Validation
    if (!apiKey) {
      return res.status(400).json({ 
        success: false,
        message: 'API Key harus diisi'
      });
    }

    if (!/^[a-f0-9]{32}$/i.test(apiKey)) {
      return res.status(400).json({
        success: false,
        message: 'Format API Key tidak valid (harus 32 karakter hexadesimal)'
      });
    }

    // Test the API key
    const testUrl = `https://api.jasaotp.id/v1/balance.php?api_key=${apiKey}`;
    const testResponse = await fetch(testUrl);
    
    if (!testResponse.ok) {
      throw new Error(`API test failed with status ${testResponse.status}`);
    }

    const testData = await testResponse.json();
    
    if (!testData.success) {
      return res.status(401).json({
        success: false,
        message: 'API Key tidak valid: ' + (testData.message || 'Tidak dapat mengakses API')
      });
    }

    // Store the valid key
    apiKeys.default = apiKey;
    
    res.json({
      success: true,
      message: 'API Key berhasil disimpan dan divalidasi',
      balance: testData.data.saldo
    });

  } catch (error) {
    console.error('Error saving API key:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
});

// Protected endpoints middleware
const requireApiKey = (req, res, next) => {
  if (!apiKeys.default) {
    return res.status(401).json({ 
      success: false,
      message: 'API Key belum disetel' 
    });
  }
  next();
};

// API Endpoints
const API_BASE_URL = 'https://api.jasaotp.id/v1';

// Check Balance
app.get('/api/balance', requireApiKey, async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/balance.php?api_key=${apiKeys.default}`);
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
app.get('/api/order', requireApiKey, async (req, res) => {
  const { country, service, operator } = req.query;
  try {
    const response = await fetch(
      `${API_BASE_URL}/order.php?api_key=${apiKeys.default}&negara=${country}&layanan=${service}&operator=${operator}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check OTP
app.get('/api/otp', requireApiKey, async (req, res) => {
  const { orderId } = req.query;
  try {
    const response = await fetch(`${API_BASE_URL}/sms.php?api_key=${apiKeys.default}&id=${orderId}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel Order
app.get('/api/cancel', requireApiKey, async (req, res) => {
  const { orderId } = req.query;
  try {
    const response = await fetch(`${API_BASE_URL}/cancel.php?api_key=${apiKeys.default}&id=${orderId}`);
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
