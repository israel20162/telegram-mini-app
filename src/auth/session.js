import { sign } from 'jsonwebtoken';
const CryptoJS = require('crypto-js');

// Function to create and encrypt a JWT
export function encryptJWT(payload, secretKey, encryptionKey) {
    // Sign the JWT with the secret key
    const token = sign(payload, secretKey);

    // Encrypt the JWT using AES encryption
    const encryptedToken = CryptoJS.AES.encrypt(token, encryptionKey).toString();

    return encryptedToken;
}

// Function to decrypt and verify a JWT
export function decryptJWT(encryptedToken, secretKey, encryptionKey) {
    // Decrypt the JWT using AES decryption
    const bytes = CryptoJS.AES.decrypt(encryptedToken, encryptionKey);
    const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

    // Verify the JWT with the secret key
    const decodedPayload = jwt.verify(decryptedToken, secretKey);

    return decodedPayload;
}

