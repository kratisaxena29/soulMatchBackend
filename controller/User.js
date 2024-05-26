const { User } = require("../model/User");

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
        
        // Create new User instance
        const UserData = new User(userBody);
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

module.exports = { 
    UserRegister
};
