const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { OtpData } = require("../model/Otp"); // Adjust the path as needed

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "krati123saxena@gmail.com",
    pass: "skql dgov ylgu qile",
  },
});

const sendOTPByEmail = async (req, res) => {
  try {
    const { email, subject } = req.body;
    console.log("Email:", email, "Subject:", subject);

    const generateOTP = () => {
      return otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
    };

    const otp = generateOTP();
    console.log("Generated OTP:", otp);

    // Check if the email already exists in the database
    const existingOtpEntry = await OtpData.findOne({ email });

    if (existingOtpEntry) {
      // Delete the existing OTP entry
      await OtpData.deleteOne({ email });
    }

    // Save new OTP to database
    const otpEntry = new OtpData({ email, otp, subject });
    await otpEntry.save();

    const mailOptions = {
      from: "krati123saxena@gmail.com",
      to: email,
      subject: subject,
      text: `Your OTP is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Error sending OTP.");
      } else {
        console.log("Email sent successfully:", info.response);
        res.status(200).send("OTP sent successfully.");
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error.");
  }
};

module.exports = {
  sendOTPByEmail,
};
