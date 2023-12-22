const nodemailer = require('nodemailer');

const mailSender = async (email, code) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: {
      name: "Hases Team",
      address: process.env.GMAIL_USER,
    },
    to: email,
    subject: "Verification Code",
    html: `<h2 style="color: #2196F3; font-family: Arial, sans-serif; text-align: center;">Thank you for signing up for Hases Job Market Place!</h2>
        <p style="color: #333333; font-family: Arial, sans-serif; text-align: center;">Your verification code is:</p>
        <p style="color: #2196F3; font-family: Arial, sans-serif; font-size: 36px; font-weight: bold; text-align: center;">${code}</p>
        <p style="color: #333333; font-family: Arial, sans-serif;">Please enter this code in the verification section of the Hases Job Market Place app to complete your registration. If you didn't sign up for Hases Job Market Place, please disregard this message.</p>
        <p style="color: #333333; font-family: Arial, sans-serif;">Welcome to Hases Job Market Place, and we hope you find the perfect job opportunities through our app!</p>`,
  });

  return info.response;
};

module.exports = mailSender;