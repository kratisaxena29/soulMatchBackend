const { response } = require("express");
const { AllProfiles } = require("../model/AllProfilesId");
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
        const { email, ageRange, religion , caste } = req.query;

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
            filter.Part_Religion = religion;
        }

        if(caste !== undefined){
            filter.Part_Caste = caste
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



const pushAllTheprofilesId = async (req, res) => {
    let iddata = req.body;

    // Ensure iddata contains the email field
    if (!iddata.email) {
        return res.status(400).json({
            response: null,
            Message: "Email is required",
            ErrorCode: 400,
        });
    }

    try {
        // Find the profile by email in ProfileRegister collection
        const emailFind = await ProfileRegister.findOne({ email: iddata.email });
        console.log("...emailFind...", emailFind);

        // Check if the profile is found
        if (!emailFind) {
            return res.status(400).json({
                response: null,
                Message: "Email does not match",
                ErrorCode: 404,
            });
        }

        // Set profileId in iddata
        iddata.profileId = emailFind._id;

        // Check if the email already exists in AllProfiles collection
        let existingProfile = await AllProfiles.findOne({ email: iddata.email });

        if (existingProfile) {
            // Push the new AllprofilesId into the existing array
            console.log("...idData..", iddata);
            existingProfile = await AllProfiles.findOneAndUpdate(
                { email: iddata.email },
                { $addToSet: { AllprofilesId: { $each: iddata.AllprofilesId } }, $set: { profileId: iddata.profileId } },
                { new: true }
            );
            console.log("..updated data...", existingProfile);

            // Construct the response
            return res.status(200).json({
                response: {
                    email: iddata.email,
                    profileId: emailFind._id,
                    AllprofilesId: existingProfile._id, // Use the _id of the updated document
                },
                Message: 'Profile id Updated',
                ErrorCode: null,
            });
        } else {
            // Create a new document in AllProfiles collection
            const data = new AllProfiles(iddata);
            await data.save();
            console.log("..data...", data);

            // Construct the response
            return res.status(200).json({
                response: {
                    email: iddata.email,
                    profileId: emailFind._id,
                    AllprofilesId: data._id, // Use the _id of the newly created document
                },
                Message: 'Profile id Saved',
                ErrorCode: null,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            Error: 'Details not saved',
            Message: 'Database Issue',
            ErrorCode: 308,
        });
    }
};



const getAlltheProfileId = async (req, res) => {
    const { email } = req.query;
console.log("..email...",email)
    try {
        // Step 1: Aggregate query to find the main profile and lookup profile details
        const result = await AllProfiles.aggregate([
            // Match the profile with the given email
            { $match: { email: email } },
            
            // Lookup to join with profileregister collection using AllprofilesId
            {
                $lookup: {
                    from: 'profileregisters', // The name of the profileregister collection
                    localField: 'AllprofilesId', // Field in AllProfiles
                    foreignField: '_id', // Field in profileregister
                    as: 'allProfilesDetails' // Name for the array of matched documents
                }
            }
        ]);
console.log("...result ...",result)
        if (result.length === 0) {
            return res.status(404).json({
                response: null,
                Message: "Profile not found",
                ErrorCode: 404
            });
        }

        // Step 2: Return the aggregated result
        return res.status(200).json({
            response: result[0], // result[0] contains the main profile and joined details
            Message: "Profiles fetched successfully",
            ErrorCode: null
        });
    } catch (error) {
        console.error("Error fetching profiles:", error);
        res.status(500).json({
            Error: 'Details not fetch',
            Message: 'Database Issue',
            ErrorCode: 308
        });
    }
};

const getprofileById = async(req,res) => {
    try {
        const profileId = req.params.id

        const data = await ProfileRegister.findOne({_id : profileId})
        if (!data) {
            return res.status(404).json({ message: 'Profile not found' });
          }
      
          res.status(200).json(data); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
    
}





module.exports = {
    profileRegister ,
    getAllProfiles ,
    pushAllTheprofilesId ,
    getAlltheProfileId , 
    getprofileById
};
