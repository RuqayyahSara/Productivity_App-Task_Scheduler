import sendEmail from "./sendEmail.js";
import sendSMS from "./sendSMS.js";


function randomString(length) {
    let chars = "ABCDEF23456GHIJKLMNfghijklmnopqrstuvwxOPQRSTUVWXYZabcdeyz01789";
    let token = ""
    for (let i = 0; i < length; i++) {
        token += chars[Math.floor(Math.random() * (chars.length - 1))];
    }
    return token;
}



function strongPassowordGenerator(length) {
    var chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var password = "";
    for (var i = 0; i <= length; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
    }
    let regexPass = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/; //Regex for Password Validation
    if (regexPass.test(password)) {
        return password;
    } else {
        return strongPassowordGenerator(length);
    }

}



export { randomString, sendEmail, sendSMS, strongPassowordGenerator };