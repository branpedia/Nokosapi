// Update all fetch calls to include proper error handling
async function checkBalance() {
  balanceLoader.style.display = 'inline-block';
  checkBalanceBtn.disabled = true;
  
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
    console.error('Error:', error);
    showError(`Terjadi kesalahan: ${error.message}`, orderResult);
  } finally {
    balanceLoader.style.display = 'none';
    checkBalanceBtn.disabled = false;
  }
}

// Add similar error handling to all other API calls
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
    console.error('Error:', error);
    showError(`Terjadi kesalahan: ${error.message}`, orderResult);
  } finally {
    countryLoader.style.display = 'none';
  }
}
