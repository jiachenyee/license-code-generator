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

function generateKey() {
  var startDatePicker = document.getElementById('start-date-picker');
  var expiryDatePicker = document.getElementById('date-picker');
  var passwordField = document.getElementById('password-field');

  var startDate = new Date(startDatePicker.value);
  var expiryDate = new Date(expiryDatePicker.value);
  
  var startTime = startDate.getTime() / 1000;  // Convert to seconds
  var expiryTime = expiryDate.getTime() / 1000;
  
  let password = passwordField.value;
  // Combine both timestamps with a separator
  let value = `${startTime};${expiryTime}`;
  console.log(value);

  encrypt(value, password).then(encrypted => {
    var licenseKeyDisplay = document.getElementById('license-key-display');
    var licenseKeyQR = document.getElementById('license-key-qr');

    let result = encrypted.replace(/\+/g, "%2B");
    licenseKeyDisplay.textContent = encrypted;

    var imageURL = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + result;
    licenseKeyQR.src = imageURL;
  });
}