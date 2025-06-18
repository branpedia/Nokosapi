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
    loadCountries();
});

saveApiKeyBtn.addEventListener('click', saveApiKey);
checkBalanceBtn.addEventListener('click', checkBalance);
countrySelect.addEventListener('change', onCountryChange);
orderBtn.addEventListener('click', createOrder);
checkOtpBtn.addEventListener('click', checkOtp);
cancelOrderBtn.addEventListener('click', cancelOrder);

// Save API Key
async function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showError('Masukkan API Key terlebih dahulu', orderResult);
        return;
    }

    saveApiKeyBtn.disabled = true;
    saveApiKeyBtn.textContent = 'Menyimpan...';
    
    try {
        const response = await fetch('/api/set-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ apiKey })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            keyStatus.textContent = '✔️ API Key tersimpan';
            keyStatus.style.color = 'green';
            checkBalance(); // Check balance after saving key
        } else {
            throw new Error(data.message || 'Gagal menyimpan API Key');
        }
    } catch (error) {
        keyStatus.textContent = '❌ Gagal menyimpan';
        keyStatus.style.color = 'red';
        showError(`Gagal menyimpan API Key: ${error.message}`, orderResult);
    } finally {
        saveApiKeyBtn.disabled = false;
        saveApiKeyBtn.textContent = 'Simpan';
    }
}

// Check Balance
async function checkBalance() {
    balanceLoader.style.display = 'inline-block';
    checkBalanceBtn.disabled = true;
    orderResult.style.display = 'none';
    
    try {
        const response = await fetch('/api/balance');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            balanceDisplay.textContent = `Rp${data.data.saldo.toLocaleString('id-ID')}`;
            showSuccess(`Saldo Anda: Rp${data.data.saldo.toLocaleString('id-ID')}`, orderResult);
        } else {
            showError(`Gagal mengambil saldo: ${data.message}`, orderResult);
        }
    } catch (error) {
        showError(`Terjadi kesalahan: ${error.message}`, orderResult);
    } finally {
        balanceLoader.style.display = 'none';
        checkBalanceBtn.disabled = false;
    }
}

// Load Countries
async function loadCountries() {
    countryLoader.style.display = 'inline-block';
    countrySelect.disabled = true;
    
    try {
        const response = await fetch('/api/countries');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            countrySelect.innerHTML = '<option value="">Pilih Negara</option>';
            data.data.forEach(country => {
                const option = document.createElement('option');
                option.value = country.id_negara;
                option.textContent = country.nama_negara;
                countrySelect.appendChild(option);
            });
            countrySelect.disabled = false;
        } else {
            showError(`Gagal memuat daftar negara: ${data.message}`, orderResult);
        }
    } catch (error) {
        showError(`Terjadi kesalahan: ${error.message}`, orderResult);
    } finally {
        countryLoader.style.display = 'none';
    }
}

// On Country Change
async function onCountryChange() {
    const countryId = countrySelect.value;
    if (!countryId) {
        operatorSelect.disabled = true;
        serviceSelect.disabled = true;
        orderBtn.disabled = true;
        return;
    }
    
    // Load operators
    operatorLoader.style.display = 'inline-block';
    operatorSelect.disabled = true;
    operatorSelect.innerHTML = '<option value="">Memuat operator...</option>';
    
    try {
        const response = await fetch(`/api/operators?country=${countryId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            const operators = data.data[countryId] || [];
            operatorSelect.innerHTML = '<option value="">Pilih Operator</option>';
            operators.forEach(operator => {
                const option = document.createElement('option');
                option.value = operator;
                option.textContent = operator;
                operatorSelect.appendChild(option);
            });
            operatorSelect.disabled = false;
        } else {
            showError(`Gagal memuat operator: ${data.message}`, orderResult);
            operatorSelect.innerHTML = '<option value="">Gagal memuat operator</option>';
        }
    } catch (error) {
        showError(`Terjadi kesalahan: ${error.message}`, orderResult);
        operatorSelect.innerHTML = '<option value="">Gagal memuat operator</option>';
    } finally {
        operatorLoader.style.display = 'none';
    }
    
    // Load services
    serviceLoader.style.display = 'inline-block';
    serviceSelect.disabled = true;
    serviceSelect.innerHTML = '<option value="">Memuat layanan...</option>';
    
    try {
        const response = await fetch(`/api/services?country=${countryId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const services = data[countryId] || {};
        serviceSelect.innerHTML = '<option value="">Pilih Layanan</option>';
        
        for (const [code, service] of Object.entries(services)) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${service.layanan} (Rp${service.harga})`;
            option.dataset.price = service.harga;
            serviceSelect.appendChild(option);
        }
        serviceSelect.disabled = false;
        
        updateOrderButtonState();
    } catch (error) {
        showError(`Terjadi kesalahan: ${error.message}`, orderResult);
        serviceSelect.innerHTML = '<option value="">Gagal memuat layanan</option>';
    } finally {
        serviceLoader.style.display = 'none';
    }
}

// Create Order
async function createOrder() {
    const countryId = countrySelect.value;
    const operator = operatorSelect.value;
    const service = serviceSelect.value;
    
    orderLoader.style.display = 'inline-block';
    orderBtn.disabled = true;
    orderResult.style.display = 'none';
    
    try {
        const response = await fetch(`/api/order?country=${countryId}&service=${service}&operator=${operator}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            currentOrderId = data.data.order_id;
            currentPhoneNumber = data.data.number;
            currentService = serviceSelect.options[serviceSelect.selectedIndex].text;
            
            showSuccess(`
                <h4>Pesanan Berhasil!</h4>
                <p><strong>ID Pesanan:</strong> ${currentOrderId}</p>
                <p><strong>Nomor Telepon:</strong> ${currentPhoneNumber}</p>
                <p><strong>Layanan:</strong> ${currentService}</p>
            `, orderResult);
            
            otpContainer.style.display = 'block';
            phoneNumberInput.value = currentPhoneNumber;
            otpResult.textContent = '';
            
            addToOrderHistory(currentOrderId, currentService, currentPhoneNumber, 'pending');
            
            // Update balance
            checkBalance();
        } else {
            showError(`Gagal membuat pesanan: ${data.message}`, orderResult);
        }
    } catch (error) {
        showError(`Terjadi kesalahan: ${error.message}`, orderResult);
    } finally {
        orderLoader.style.display = 'none';
        orderBtn.disabled = false;
    }
}

// Check OTP
async function checkOtp() {
    const orderId = currentOrderId;
    if (!orderId) {
        showError('Tidak ada pesanan aktif', otpResult);
        return;
    }
    
    checkOtpBtn.disabled = true;
    checkOtpBtn.textContent = 'Memeriksa...';
    
    try {
        const response = await fetch(`/api/otp?orderId=${orderId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            otpResult.textContent = `Kode OTP: ${data.data.otp}`;
            updateOrderHistoryStatus(orderId, 'completed');
        } else {
            showError(`Gagal mendapatkan OTP: ${data.message}`, otpResult);
        }
    } catch (error) {
        showError(`Terjadi kesalahan: ${error.message}`, otpResult);
    } finally {
        checkOtpBtn.disabled = false;
        checkOtpBtn.textContent = 'Cek OTP';
    }
}

// Cancel Order
async function cancelOrder() {
    const orderId = currentOrderId;
    if (!orderId) {
        showError('Tidak ada pesanan aktif', orderResult);
        return;
    }
    
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
        return;
    }
    
    cancelOrderBtn.disabled = true;
    cancelOrderBtn.textContent = 'Membatalkan...';
    
    try {
        const response = await fetch(`/api/cancel?orderId=${orderId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(`
                <p><strong>Pesanan berhasil dibatalkan!</strong></p>
                <p>ID Pesanan: ${data.data.order_id}</p>
                <p>Saldo dikembalikan: Rp${data.data.refunded_amount.toLocaleString('id-ID')}</p>
            `, orderResult);
            
            otpContainer.style.display = 'none';
            updateOrderHistoryStatus(orderId, 'canceled');
            currentOrderId = null;
            currentPhoneNumber = null;
            currentService = null;
            
            checkBalance();
        } else {
            showError(`Gagal membatalkan pesanan: ${data.message}`, orderResult);
        }
    } catch (error) {
        showError(`Terjadi kesalahan: ${error.message}`, orderResult);
    } finally {
        cancelOrderBtn.disabled = false;
        cancelOrderBtn.textContent = 'Batalkan Pesanan';
    }
}

// Helper Functions
function updateOrderButtonState() {
    orderBtn.disabled = !(
        countrySelect.value && 
        operatorSelect.value && 
        serviceSelect.value
    );
}

function addToOrderHistory(orderId, service, phoneNumber, status) {
    const row = document.createElement('tr');
    row.dataset.orderId = orderId;
    
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge status-${status}`;
    statusBadge.textContent = status === 'pending' ? 'Menunggu OTP' : 
                              status === 'completed' ? 'Selesai' : 'Dibatalkan';
    
    row.innerHTML = `
        <td>${orderId}</td>
        <td>${service}</td>
        <td>${phoneNumber}</td>
        <td></td>
        <td>
            <button class="btn btn-primary btn-sm view-order">Lihat</button>
        </td>
    `;
    
    row.querySelector('td:nth-child(4)').appendChild(statusBadge);
    orderHistoryTable.prepend(row);
    
    // Add event listener to view button
    row.querySelector('.view-order').addEventListener('click', () => {
        viewOrderDetails(orderId, service, phoneNumber, status);
    });
}

function updateOrderHistoryStatus(orderId, status) {
    const row = orderHistoryTable.querySelector(`tr[data-order-id="${orderId}"]`);
    if (row) {
        const statusCell = row.querySelector('td:nth-child(4)');
        statusCell.innerHTML = '';
        
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge status-${status}`;
        statusBadge.textContent = status === 'pending' ? 'Menunggu OTP' : 
                                  status === 'completed' ? 'Selesai' : 'Dibatalkan';
        
        statusCell.appendChild(statusBadge);
    }
}

function viewOrderDetails(orderId, service, phoneNumber, status) {
    currentOrderId = orderId;
    currentPhoneNumber = phoneNumber;
    currentService = service;
    
    showSuccess(`
        <h4>Detail Pesanan</h4>
        <p><strong>ID Pesanan:</strong> ${orderId}</p>
        <p><strong>Nomor Telepon:</strong> ${phoneNumber}</p>
        <p><strong>Layanan:</strong> ${service}</p>
        <p><strong>Status:</strong> ${status === 'pending' ? 'Menunggu OTP' : status === 'completed' ? 'Selesai' : 'Dibatalkan'}</p>
    `, orderResult);
    
    if (status === 'pending') {
        otpContainer.style.display = 'block';
        phoneNumberInput.value = phoneNumber;
        otpResult.textContent = '';
    } else {
        otpContainer.style.display = 'none';
    }
}

function showSuccess(message, element) {
    element.style.display = 'block';
    element.className = 'result-box';
    element.innerHTML = message;
}

function showError(message, element) {
    element.style.display = 'block';
    element.className = 'result-box error';
    element.innerHTML = `<p>${message}</p>`;
}
