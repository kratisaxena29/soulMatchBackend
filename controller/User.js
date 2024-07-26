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

        // Check if neither email nor phone number is provided
        if (!userBody.email && !userBody.phoneno) {
            return res.status(400).json({
                Error: 'Email or Phone Number required',
                Message: 'Either email or phone number must be provided',
                ErrorCode: 310,
            });
        }

        // Check if the email is already registered
        if (userBody.email) {
            const existingUser = await User.findOne({ email: userBody.email });
            if (existingUser) {
                console.log("Email already registered:", userBody.email);
                return res.status(400).json({
                    Error: 'Email already registered',
                    Message: 'The provided email is already in use',
                    ErrorCode: 309,
                });
            }
        }

        // Check if the phone number is already registered
        if (userBody.phoneno) {
            const existingPhoneNo = await User.findOne({ phoneno: userBody.phoneno });
            if (existingPhoneNo) {
                console.log("Phone number already registered:", userBody.phoneno);
                return res.status(400).json({
                    Error: 'Phone Number already registered',
                    Message: 'The provided number is already in use',
                    ErrorCode: 309,
                });
            }
        }

        // Encrypt the password
        let pass = await encrypt(userBody.password);

        // Create new User instance with conditional fields
        const userData = new User({
            firstName: userBody.firstName,
            lastName: userBody.lastName,
            email: userBody.email || undefined, // Include email only if it exists
            password: pass,
            profileVerified: userBody.profileVerified,
            Verified: userBody.Verified,
            phoneno: userBody.phoneno || undefined // Include phone number only if it exists
        });
        console.log("UserData instance created:", userData);

        // Save the user data to the database
        await userData.save();
        console.log("User data saved successfully");

        // Send success response
        res.status(200).json({
            response: userData,
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
        const { email, phoneno, password } = req.body;
        console.log("Login attempt for:", email || phoneno);

        // Find the user by email or phone number based on which one is provided
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (phoneno) {
            user = await User.findOne({ phoneno });
        }

        console.log("...user..", user);
        if (!user) {
            console.log("User not found:", email || phoneno);
            return res.status(400).json({
                Error: 'User not found',
                Message: 'The provided email or phone number does not exist',
                ErrorCode: 401,
            });
        }

        // Check if email or phone number is verified
        if (!user.Verified) {
            return res.status(400).json({
                Error: 'Email or PhoneNo not verified',
                Message: 'The address has not been verified',
                ErrorCode: 404,
            });
        }

        // Check if profile is verified
        if (!user.profileVerified) {
            console.log("Profile not verified for user:", email || phoneno);
            return res.status(400).json({
                Error: 'Profile not verified',
                Message: 'The profile has not been verified',
                ErrorCode: 405,
            });
        }

        // Check if the password is not null or undefined
        if (!user.password) {
            console.log("User password is null or undefined:", email || phoneno);
            return res.status(400).json({
                Error: 'Invalid credentials',
                Message: 'The user password is missing or invalid',
                ErrorCode: 403,
            });
        }

        // Decrypt and compare the password
        const decryptedPassword = await decrypt(user.password);
        if (decryptedPassword !== password) {
            console.log("Invalid password for:", email || phoneno);
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

        // Retrieve profile information
        let fromProfile;
        if (email) {
            console.log("...email...",email)
            fromProfile = await ProfileRegister.findOne({ email: user.email });
            console.log("...email...",fromProfile)
        } else if (phoneno) {
            console.log("...phoneno...",phoneno)
            console.log("Type of phoneno:", typeof phoneno);
             console.log("...user.phoneno...",typeof user.phoneno)
             console.log("...user phone number ...",typeof Number(user.phoneno))
             const number = Number(user.phoneno)
            //  fromProfile = await ProfileRegister.find()
            fromProfile = await ProfileRegister.findOne({ phoneNo: number});
            console.log("...phoneno...",fromProfile)
        }
          console.log("...fromProfile...",fromProfile)
        if (!fromProfile) {
            console.log("Profile not found for user:", email || phoneno);
            return res.status(400).json({
                Error: 'Profile not found',
                Message: 'The user profile does not exist',
                ErrorCode: 406,
            });
        }

        console.log("....fromprofile...", fromProfile , fromProfile.phoneno , );
        console.log("Login successful for:", email || phoneno );

        // Send success response
        res.status(200).json({
            response: {
                token,
                user: {
                    id: fromProfile._id,
                    firstName: fromProfile.name,
                    lastName: user.lastName,
                    email: email ? fromProfile.email : undefined,
                    phoneno: phoneno ? fromProfile.phoneNo : undefined,
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
const Testing = async (req, res) => {
    res.send('Hello from the backend');
}
module.exports = {
    UserRegister , UserLogin ,otpPasswordChange , sendOTPForForgotPassword ,Testing
};


