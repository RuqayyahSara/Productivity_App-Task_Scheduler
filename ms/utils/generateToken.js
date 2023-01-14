import jwt from "jsonwebtoken";
import cryptoJS from 'crypto-js';
import config from 'config';

const { JWT_TOKEN, CRYPTO_TOKEN } = config.get("SECRET_KEYS_MS")

function generateToken(payload) {
    try {
        const token = jwt.sign(payload, JWT_TOKEN, {})
        let cipherToken = cryptoJS.AES.encrypt(token, CRYPTO_TOKEN).toString();
        return cipherToken;
    } catch (err) {
        return;
    }
}

export default generateToken;