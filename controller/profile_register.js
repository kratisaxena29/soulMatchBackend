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

        // Save profile data
        const profile = new ProfileRegister(profileData);
        await profile.save();

        // Update profileVerified field in User collection
        matchingEmail.profileVerified = true;
        await matchingEmail.save();

        return res.status(200).json({
            response: profile,
            Message: 'Profile Details Saved and profile verified',
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
        // Get the minimum and maximum age from the request query parameters
        const { ageRange , religion} = req.query;

        // Check if both minAge and maxAge are undefined, if so, fetch all profiles
        if (ageRange === undefined) {
            const allProfiles = await ProfileRegister.find();
            return res.status(200).json({
                response: allProfiles,
                Message: 'All profiles fetched successfully',
                ErrorCode: null,
            });
        }

       
        
        console.log("...ageFilter...",ageRange)

        // Query profiles collection with age filter
        const profiles = await ProfileRegister.find({ Part_ageFrom: ageRange });

        return res.status(200).json({
            response: profiles,
            Message: 'Profiles fetched successfully',
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
