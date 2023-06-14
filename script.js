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
  console.log("Hello")
  var datePicker = document.getElementById('date-picker');
  var selectedDateValue = datePicker.value;
  var selectedDate = new Date(selectedDateValue);
  console.log(selectedDate);
  var timeInterval = selectedDate.getTime() / 1000;  // Convert milliseconds to seconds
  
  var passwordField = document.getElementById('password-field');

  let password = passwordField.value; // password must be 16 characters long
  let value = timeInterval;

  encrypt(value.toString(), password).then(encrypted => {
    var licenseKeyDisplay = document.getElementById('license-key-display');
    var licenseKeyQR = document.getElementById('license-key-qr');

    let result = encrypted.replace(/\+/g, "_");
    licenseKeyDisplay.textContent = result;

    var imageURL = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + result;
    licenseKeyQR.src = imageURL;
  });
}