async function encrypt(data, password) {
  const enc = new TextEncoder();
  const passKey = await window.crypto.subtle.importKey(
    "raw", 
    enc.encode(password), 
    {name: "PBKDF2"}, 
    false, 
    ["deriveBits", "deriveKey"]
  );
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await window.crypto.subtle.deriveKey(
    {name: "PBKDF2", salt: salt, iterations: 1000, hash: "SHA-256"},
    passKey,
    {name: "AES-CBC", length: 128}, 
    true, 
    ["encrypt", "decrypt"]
  );
  const encryptedContent = await window.crypto.subtle.encrypt(
    {name: "AES-CBC", iv: iv}, 
    key, 
    enc.encode(data)
  );
  const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
  buffer.set(new Uint8Array(salt), 0);
  buffer.set(new Uint8Array(iv), salt.byteLength);
  buffer.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);
  return btoa(String.fromCharCode(...buffer));
}

function toggleStartDate() {
    const startDatePicker = document.getElementById('start-date-picker');
    const startDateLabel = document.querySelector('.input-label');
    const enableStartDate = document.getElementById('disable-start-date');
    
    startDatePicker.disabled = !enableStartDate.checked;
    startDateLabel.style.color = !enableStartDate.checked ? '#999' : '#000';
    generateKey();
}

function generateKey() {
    var startDatePicker = document.getElementById('start-date-picker');
    var expiryDatePicker = document.getElementById('date-picker');
    var passwordField = document.getElementById('password-field');
    var enableStartDate = document.getElementById('disable-start-date');

    var expiryDate = new Date(expiryDatePicker.value);
    var expiryTime = expiryDate.getTime() / 1000;

    let password = passwordField.value;
    // Only include start time if start date is enabled
    let value = enableStartDate.checked ? 
        `${startDatePicker.value ? new Date(startDatePicker.value).getTime() / 1000 : ''};${expiryTime}` : 
        `${expiryTime}`;

    document.querySelector('#info p').textContent = `${value}`;

    encrypt(value, password).then(encrypted => {
        var licenseKeyDisplay = document.getElementById('license-key-display');
        var licenseKeyQR = document.getElementById('license-key-qr');

        let result = encrypted.replace(/\+/g, "%2B");
        licenseKeyDisplay.textContent = encrypted;

        var imageURL = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + result;
        licenseKeyQR.src = imageURL;
    });
}

function handleStartDateChange() {
  const startDatePicker = document.getElementById('start-date-picker');
  const endDatePicker = document.getElementById('date-picker');
  
  // Set minimum end date to start date
  endDatePicker.min = startDatePicker.value;
  
  // If end date is before start date, update it
  if (endDatePicker.value < startDatePicker.value) {
    endDatePicker.value = startDatePicker.value;
  }
  
  generateKey();
}

function handleEndDateChange() {
  const startDatePicker = document.getElementById('start-date-picker');
  const endDatePicker = document.getElementById('date-picker');
  
  // If end date is before start date, revert to start date
  if (endDatePicker.value < startDatePicker.value) {
    endDatePicker.value = startDatePicker.value;
  }
  
  generateKey();
}

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const startDatePicker = document.getElementById('start-date-picker');
    const endDatePicker = document.getElementById('date-picker');

    startDatePicker.value = today.toISOString().split('T')[0];
    startDatePicker.min = startDatePicker.value;
    
    // Set initial min value for end date picker
    endDatePicker.min = startDatePicker.value;
    endDatePicker.value = nextMonth.toISOString().split('T')[0];
    
    toggleStartDate();
    generateKey();
});