const otpGenerator = require("otp-generator");
const { Phoneotpdata } = require("../model/phoneOtp"); // Adjust the path as needed
const { User } = require("../model/User");
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region
});

const sns = new AWS.SNS();



const sendOTPByPhone = async (req, res) => {
  try {
    const { phoneno, subject } = req.body;
    console.log("Phone Number:", phoneno, "Subject:", subject);

    const user = await User.findOne({ phoneno });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mark user as confirmed
    user.isConfirmed = true;
    await user.save();
    console.log('User confirmed successfully:', user);

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

    const existingOtpEntry = await Phoneotpdata.findOne({ phoneno });
    if (existingOtpEntry) {
      await Phoneotpdata.deleteOne({ phoneno });
    }

    const otpEntry = new Phoneotpdata({ phoneno, otp, subject });
    await otpEntry.save();

    // Ensure phone number is in E.164 format
    const formattedPhoneNo = phoneno.startsWith('+') ? phoneno : `+${phoneno}`;
    console.log("...formatedd..",formattedPhoneNo)
    const params = {
      Message: `Your OTP code is ${otp}`,
      PhoneNumber: formattedPhoneNo,
    };

    sns.publish(params, (err, data) => {
      if (err) {
        console.error("Error sending SMS:", err.message);
        return res.status(500).json({ error: "Failed to send OTP.", details: err });
      }
      console.log("SMS sent successfully:", data);
      res.status(200).json({ message: 'OTP sent successfully', data });
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal server error.", details: error });
  }
};






const verifyPhoneOtp = async (req, res) => {
    try {
        const { phoneno, otp } = req.body;
        console.log("Verifying OTP for phoneno:", phoneno, "OTP:", otp);

        const otpEntry = await Phoneotpdata.findOne({ phoneno, otp });
        console.log("...otp from db ..", otpEntry);

        if (otpEntry) {
            // OTP matches, update emailVerified field in User collection
            const user = await User.findOne({phoneno : phoneno });

            if (!user) {
                return res.status(400).send("User not found.");
            }

            user.Verified = true;
            const updatedUser = await user.save();
            console.log("Updated user:", updatedUser);

            // Check if the emailVerified field is updated
            if (updatedUser.Verified) {
                console.log("phone no verified successfully.");
            } else {
                console.error("Failed to update PhoneVerified field.");
            }

            res.status(200).send("OTP matches and phone verified.");
        } else {
            // OTP does not match
            res.status(400).send("OTP does not match.");
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error.");
    }
};




module.exports = {
  sendOTPByPhone,verifyPhoneOtp
};
