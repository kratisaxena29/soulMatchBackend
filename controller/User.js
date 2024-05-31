const { User } = require("../model/User");
const { decrypt, encrypt } = require('../middleware/encryp');
const jwt = require('jsonwebtoken');

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
            password : pass
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

        console.log("Login successful for email:", email);

        // Send success response
        res.status(200).json({
            response: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
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

module.exports = {
    UserRegister , UserLogin
};


