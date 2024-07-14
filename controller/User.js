const { User } = require("../model/User");
const { decrypt, encrypt } = require('../middleware/encryp');
const jwt = require('jsonwebtoken');
const { ProfileRegister } = require("../model/profile_register");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { OtpData } = require("../model/Otp"); 
const {OtpForgotPassword } = require("../model/OtpforgotPassword")


const UserRegister = async (req, res) => {
    try {
        let userBody = req.body;
        console.log("Received user body:", userBody);
    
        // Check if the email is already registered
        const existingUser = await User.findOne({ email: userBody.email });
        if (existingUser) {
            console.log("Email already registered:", userBody.email);
            return res.status(400).json({
                Error: 'Email already registered',
                Message: 'The provided email is already in use',
                ErrorCode: 309,
            });
        }
        let pass = await encrypt(userBody.password);

        // Create new User instance
        const UserData = new User({
            firstName : userBody.firstName,
            lastName : userBody.lastName,
            email : userBody.email,
            password : pass,
            profileVerified : userBody.profileVerified,
            emailVerified : userBody.emailVerified
    });
        console.log("UserData instance created:", UserData);

        // Save the user data to the database
        await UserData.save();
        console.log("User data saved successfully");

        // Send success response
        res.status(200).json({
            response: UserData,
            Message: 'Profile Details Saved',
            ErrorCode: null,
        });
    } catch (error) {
        // Log the error for debugging
        console.error("Error occurred:", error);

        // Send error response
        res.status(500).json({
            Error: 'Details not saved',
            Message: 'Database Issue',
            ErrorCode: 308,
        });
    }
};



const UserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for email:", email);

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found:", email);
            return res.status(400).json({
                Error: 'User not found',
                Message: 'The provided email does not exist',
                ErrorCode: 401,
            });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            console.log("Email not verified for user:", email);
            return res.status(400).json({
                Error: 'Email not verified',
                Message: 'The email address has not been verified',
                ErrorCode: 404,
            });
        }

        // Check if profile is verified
        if (!user.profileVerified) {
            console.log("Profile not verified for user:", email);
            return res.status(400).json({
                Error: 'Profile not verified',
                Message: 'The profile has not been verified',
                ErrorCode: 405,
            });
        }

        // Check if the password is not null or undefined
        if (!user.password) {
            console.log("User password is null or undefined:", email);
            return res.status(400).json({
                Error: 'Invalid credentials',
                Message: 'The user password is missing or invalid',
                ErrorCode: 403,
            });
        }

        // Decrypt and compare the password
        const decryptedPassword = await decrypt(user.password);
        if (decryptedPassword !== password) {
            console.log("Invalid password for email:", email);
            return res.status(400).json({
                Error: 'Invalid credentials',
                Message: 'The provided password is incorrect',
                ErrorCode: 402,
            });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );
         
        const fromProfile = await ProfileRegister.findOne({email : user.email })
        console.log("....fromprofile...",fromProfile)
        console.log("Login successful for email:", email);

        // Send success response
        res.status(200).json({
            response: {
                token,
                user: {
                    id: fromProfile._id,
                    firstName: fromProfile.name,
                    lastName: user.lastName,
                    email: fromProfile.email,
                },
            },
            Message: 'Login successful',
            ErrorCode: null,
        });
    } catch (error) {
        // Log the error for debugging
        console.error("Error occurred during login:", error);

        // Send error response
        res.status(500).json({
            Error: 'Login failed',
            Message: 'An error occurred during the login process',
            ErrorCode: 500,
        });
    }
};


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "krati123saxena@gmail.com",
    pass: "skql dgov ylgu qile",
  },
});

const sendOTPForForgotPassword = async (req, res) => {
  try {
    const { email , subject} = req.body;
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
    const existingOtpEntry = await OtpForgotPassword.findOne({ email });

    if (existingOtpEntry) {
      // Delete the existing OTP entry
      await OtpForgotPassword.deleteOne({ email });
    }

    // Save new OTP to database
    const otpEntry = new OtpForgotPassword({ email, subject ,otp});
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

// const otpPasswordChange = async () => {
//     try {
//         const { email , otp , password } = req.body;

//     } catch (error) {
//         res.status(500).send("Internal server error")
//     }
// }

const otpPasswordChange = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
console.log("...email...",email, otp , password)
        // Verify OTP
        const isOtpValid = await OtpForgotPassword.findOne({otp});
        console.log("...isOtpValid...",isOtpValid)
        if (!isOtpValid) {
            return res.status(400).send("Invalid OTP");
        }

        // Find the user by email
        const user = await User.findOne({ email });
        console.log("...user..",user)
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Hash the new password
        const hashedPassword = await encrypt(password);
        console.log("...hashedPassword...",hashedPassword)
        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).send("Password changed successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};

module.exports = {
    UserRegister , UserLogin ,otpPasswordChange , sendOTPForForgotPassword
};


