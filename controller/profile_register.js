const { ProfileRegister } = require("../model/profile_register");
const { User } = require("../model/User");


const profileRegister = async (req, res) => {
    let profileData = req.body;
   
    
    try {
        const matchingEmail = await User.findOne({ email: profileData.email });
        console.log("..matchingEmail..", matchingEmail);

        if (!matchingEmail) {
            return res.status(400).json({
                response: null,
                Message: 'Email does not match',
                ErrorCode: 404,
            });
        }

       

        const profile = new ProfileRegister(profileData);
        await profile.save();

        return res.status(200).json({
            response: profile,
            Message: 'Profile Details Saved',
            ErrorCode: null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            Error: 'Details not saved',
            Message: 'Database Issue',
            ErrorCode: 308,
        });
    }
};

const getAllProfiles = async (req, res) => {
    try {
        const profiles = await ProfileRegister.find();
        return res.status(200).json({
            response: profiles,
            Message: 'All profiles fetched successfully',
            ErrorCode: null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            Error: 'Unable to fetch profiles',
            Message: 'Database Issue',
            ErrorCode: 308,
        });
    }
};


module.exports = {
    profileRegister ,
    getAllProfiles
};
