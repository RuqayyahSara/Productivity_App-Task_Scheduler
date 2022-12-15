import jwt from "jsonwebtoken";
import cryptoJS from 'crypto-js';
import config from 'config';

const { JWT_TOKEN, CRYPTO_TOKEN } = config.get("SECRET_KEYS_MS")

function msAuthMiddleware(req, res, next) {
    try {
        console.log(req.headers);
        let token = req.headers['ms-auth-token'];
        let bytes = cryptoJS.AES.decrypt(token, CRYPTO_TOKEN); // decrypting token
        let originalToken = bytes.toString(cryptoJS.enc.Utf8); // original token
        const payload = jwt.verify(originalToken, JWT_TOKEN); // decoding token & getting payload
        req.payload = payload;
        console.log(payload);
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Access Denied. Invalid Token/Token Expired" });
    }
}

export default msAuthMiddleware;