// DOM Elements
const apiKeyInput = document.getElementById('api-key');
const saveApiKeyBtn = document.getElementById('save-api-key');
const keyStatus = document.getElementById('key-status');
const checkBalanceBtn = document.getElementById('check-balance');
const balanceDisplay = document.getElementById('balance');
const balanceLoader = document.getElementById('balance-loader');
const countrySelect = document.getElementById('country');
const countryLoader = document.getElementById('country-loader');
const operatorSelect = document.getElementById('operator');
const operatorLoader = document.getElementById('operator-loader');
const serviceSelect = document.getElementById('service');
const serviceLoader = document.getElementById('service-loader');
const orderBtn = document.getElementById('order-btn');
const orderLoader = document.getElementById('order-loader');
const orderResult = document.getElementById('order-result');
const otpContainer = document.getElementById('otp-container');
const phoneNumberInput = document.getElementById('phone-number');
const checkOtpBtn = document.getElementById('check-otp');
const cancelOrderBtn = document.getElementById('cancel-order');
const otpResult = document.getElementById('otp-result');
const orderHistoryTable = document.getElementById('order-history').querySelector('tbody');

// Variables
let currentOrderId = null;
let currentPhoneNumber = null;
let currentService = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Disable all features until API key is validated
    checkBalanceBtn.disabled = true;
    countrySelect.disabled = true;
    orderBtn.disabled = true;
});

saveApiKeyBtn.addEventListener('click', saveApiKey);
checkBalanceBtn.addEventListener('click', checkBalance);
countrySelect.addEventListener('change', onCountryChange);
orderBtn.addEventListener('click', createOrder);
checkOtpBtn.addEventListener('click', checkOtp);
cancelOrderBtn.addEventListener('click', cancelOrder);

// Save API Key with enhanced feedback
async function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showError('Masukkan API Key terlebih dahulu', orderResult);
        return;
    }

    // UI Feedback
    saveApiKeyBtn.disabled = true;
    saveApiKeyBtn.textContent = 'Memverifikasi...';
    keyStatus.textContent = 'Memverifikasi API Key...';
    keyStatus.style.color = 'blue';
    
    try {
        const response = await fetch('/api/set-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ apiKey })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        if (data.success) {
            keyStatus.textContent = '✔️ API Key valid';
            keyStatus.style.color = 'green';
            
            showSuccess(`
                <p>API Key berhasil disimpan!</p>
                ${data.balance ? `<p>Saldo saat ini: Rp${data.balance.toLocaleString('id-ID')}</p>` : ''}
            `, orderResult);
            
            // Enable all features
            checkBalanceBtn.disabled = false;
            countrySelect.disabled = false;
            loadCountries();
            checkBalance();
        } else {
            throw new Error(data.message || 'Gagal menyimpan API Key');
        }
    } catch (error) {
        keyStatus.textContent = '❌ Gagal verifikasi';
        keyStatus.style.color = 'red';
        showError(`Gagal menyimpan API Key: ${error.message}`, orderResult);
    } finally {
        saveApiKeyBtn.disabled = false;
        saveApiKeyBtn.textContent = 'Simpan API Key';
    }
}

// [Keep all other existing functions from previous script.js]
// (checkBalance, loadCountries, onCountryChange, createOrder, 
// checkOtp, cancelOrder, and all helper functions)
