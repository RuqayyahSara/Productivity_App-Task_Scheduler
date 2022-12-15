import jwt from "jsonwebtoken";
import cryptoJS from 'crypto-js';
import config from 'config';

const { JWT, CRYPTO } = config.get("SECRET_KEYS1")

function verifyOTPToken(req, res, next) {
    try {
        let token = req.headers['x-otp-token'];
        let bytes = cryptoJS.AES.decrypt(token, CRYPTO); // decrypting token
        let originalToken = bytes.toString(cryptoJS.enc.Utf8); // original token
        const payload = jwt.verify(originalToken, JWT); // decoding token & getting payload
        req.payloadOTP = payload;
        return next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ error: "Session timeout. Login Again." });
    }
}

export default verifyOTPToken;