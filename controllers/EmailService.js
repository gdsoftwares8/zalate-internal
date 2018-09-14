var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "vaishnavvishwas22@gmail.com",
        // Your email id
        pass: "9352330039"
        // Your password
    }
});
module.exports = transporter;

