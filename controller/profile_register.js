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
        // Get the email, ageRange, and religion from the request query parameters
        const { email, ageRange, religion } = req.query;

        // Check if the email is provided, if not, return an error response
        if (!email) {
            return res.status(400).json({
                Error: 'Email is required',
                Message: 'You must provide an email to fetch profiles',
                ErrorCode: 301,
            });
        }

        // Define a filter object
        let filter = { email: { $ne: email } };  // Exclude the profile with the provided email

        // Add age range filter if provided
        if (ageRange !== undefined) {
            filter.Part_ageFrom = ageRange;
        }

        // Add religion filter if provided
        if (religion !== undefined) {
            filter.religion = religion;
        }

        console.log("...Filter...", filter);

        // Query profiles collection with the filter
        const profiles = await ProfileRegister.find(filter);

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
