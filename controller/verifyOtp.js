const { OtpData } = require("../model/Otp");
const {User} = require("../model/User"); // Adjust the path according to your project structure

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log("Verifying OTP for email:", email, "OTP:", otp);

        const otpEntry = await OtpData.findOne({ email, otp });
        console.log("...otp from db ..", otpEntry);

        if (otpEntry) {
            // OTP matches, update emailVerified field in User collection
            const user = await User.findOne({email : email });

            if (!user) {
                return res.status(400).send("User not found.");
            }

            user.Verified = true;
            const updatedUser = await user.save();
            console.log("Updated user:", updatedUser);

            // Check if the emailVerified field is updated
            if (updatedUser.Verified) {
                console.log("Email verified successfully.");
            } else {
                console.error("Failed to update emailVerified field.");
            }

            res.status(200).send("OTP matches and email verified.");
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
    verifyOtp
};
