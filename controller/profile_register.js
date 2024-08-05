const { response } = require("express");
const { AllProfiles } = require("../model/AllProfilesId");
const { ProfileRegister } = require("../model/profile_register");
const { User } = require("../model/User");



const profileRegister = async (req, res) => {
    let profileData = req.body;

    try {
if (profileData.email !== ""){
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

        // Update profileVerified field in User collection
        matchingEmail.profileVerified = true;
        await matchingEmail.save();

        return res.status(200).json({
            response: profile,
            Message: 'Profile Details Saved and profile verified',
            ErrorCode: null,
        });
    }
    if (profileData.phoneno !== ""){
        const matchingPhoneNo = await User.findOne({ phoneno: profileData.phoneNo });
        console.log("..matchingPhoneNo..", matchingPhoneNo);

        if (!matchingPhoneNo) {
            return res.status(400).json({
                response: null,
                Message: 'Phone no does not match',
                ErrorCode: 404,
            });
        }

        const profile = new ProfileRegister(profileData);
        await profile.save();

        // Update profileVerified field in User collection
        matchingPhoneNo.profileVerified = true;
        await matchingPhoneNo.save();

        return res.status(200).json({
            response: profile,
            Message: 'Profile Details Saved and profile verified',
            ErrorCode: null,
        });
    }
        // Save profile data
        
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
        // Get the email, ageRange, religion, caste, subcaste, and phoneno from the request query parameters
        const { email, ageRange, religion, caste, subcaste, phoneno } = req.query;

        // Define a filter object
        let filter = {};

        // Check if neither email nor phoneno is provided, return an error response
        if (!email && !phoneno) {
            return res.status(400).json({
                Error: 'Email or Phone Number is required',
                Message: 'You must provide either an email or phone number to fetch profiles',
                ErrorCode: 301,
            });
        }

        // Exclude the profile with the provided email or phone number
        if (email) {
            filter.email = { $ne: email };
        }
        if (phoneno) {
            filter.phoneNo = { $ne: phoneno };
        }

        // Add age range filter if provided
        if (ageRange) {
            const [minAge, maxAge] = ageRange.split('-').map(Number);
            filter.Part_ageFrom = { $gte: minAge, $lte: maxAge };
        }

        // Add religion filter if provided and not empty
        if (religion) {
            filter.Part_Religion = religion;
        }

        // Add caste filter if provided and not empty
        if (caste) {
            filter.Part_Caste = caste;
        }

        // Add subcaste filter if provided and not empty
        if (subcaste) {
            filter.Part_subCaste = subcaste;
        }

        // Fetch the profile associated with the provided email or phone number to get the plan value
        let userProfile;
        if (email) {
            userProfile = await ProfileRegister.findOne({ email });
        } else if (phoneno) {
            userProfile = await ProfileRegister.findOne({ phoneNo: phoneno });
        }

        if (!userProfile) {
            return res.status(404).json({
                Error: 'User Profile not found',
                Message: 'No profile found with the provided email or phone number',
                ErrorCode: 404,
            });
        }

        console.log("...userProfile.plan...", userProfile.plan);

        // Determine the limit based on the plan value
        let limit = 0;
        // if (userProfile) {
        //     switch (userProfile.plan) {
        //         case 1:
        //             // console.log("...case 1...",)
        //             limit = 2;
        //             break;
        //         case 2:
        //             // console.log("...case 2...",)
        //             limit = 3;
        //             break;
        //         case 3:
        //             // console.log("...case 3...",)
        //             limit = 0; // No limit for plan value 3
        //             break;
        //         default:
        //             // console.log("...case default...",)
        //             limit = 0; // Default no limit
        //             break;
        //     }
        // }

        if(userProfile.plan === "100")
        {
            console.log("....under 1")
            limit  = 2
        }
        else if(userProfile.plan === "200")
        {
            console.log("...under 2...")
            limit  = 3
        }
        else if (userProfile.plan === "300")
        {
            console.log("...under 3...")
            limit  = 0
        }else if (userProfile.plan === null){
            limit  = 0
        }

        console.log("...limit...", limit);

        // Query profiles collection with the filter and limit the results if applicable
        let profiles;
        if (limit > 0) {
            profiles = await ProfileRegister.find(filter).limit(limit);
            console.log("..profile 1...")
        } else {
            profiles = await ProfileRegister.find(filter);
            console.log("..profile 2...")
        }

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

    console.log("...idData...");

    // Ensure iddata contains either email or phoneno field
    if (!iddata.email && !iddata.phoneno) {
        return res.status(400).json({
            response: null,
            Message: "Email or Phone number is required",
            ErrorCode: 400,
        });
    }

    try {
        // Find the profile by email or phone number in ProfileRegister collection
        const query = iddata.email ? { email: iddata.email } : { phoneNo: iddata.phoneno };
        const profileFind = await ProfileRegister.findOne(query);
        console.log("...profileFind...", profileFind);

        // Check if the profile is found
        if (!profileFind) {
            return res.status(400).json({
                response: null,
                Message: "Profile does not match",
                ErrorCode: 404,
            });
        }

        // Set profileId in iddata
        iddata.profileId = profileFind._id;

        // Check if the profile already exists in AllProfiles collection
        const profileQuery = iddata.email ? { email: iddata.email } : { phoneno: iddata.phoneno };
        let existingProfile = await AllProfiles.findOne(profileQuery);
console.log("...existingProfile...",existingProfile)
        if (existingProfile) {
            // Push the new AllprofilesId into the existing array
            console.log("...idData..", iddata);
            existingProfile = await AllProfiles.findOneAndUpdate(
                profileQuery,
                { $addToSet: { AllprofilesId: { $each: iddata.AllprofilesId } }, $set: { profileId: iddata.profileId } },
                { new: true }
            );
            console.log("..updated data...", existingProfile);

            // Construct the response
            return res.status(200).json({
                response: {
                    email: iddata.email,
                    phoneno: iddata.phoneno,
                    profileId: profileFind._id,
                    AllprofilesId: existingProfile._id, // Use the _id of the updated document
                },
                Message: 'Profile ID updated',
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
                    phoneno: iddata.phoneno,
                    profileId: profileFind._id,
                    AllprofilesId: data._id, // Use the _id of the newly created document
                },
                Message: 'Profile ID saved',
                ErrorCode: null,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            Error: 'Details not saved',
            Message: 'Database issue',
            ErrorCode: 308,
        });
    }
};


const getAlltheProfileId = async (req, res) => {
    const { email, phoneno } = req.query;
    console.log("..email...", email);
    console.log("..phoneno...", phoneno);

    try {
        // Check if either email or phoneno is provided
        if (!email && !phoneno) {
            return res.status(400).json({
                response: null,
                Message: "Email or Phone number query parameter is required.",
                ErrorCode: 400
            });
        }

        // Create the match query object
        const matchQuery = email ? { email: email } : { phoneno: phoneno };
        console.log("..matchQuery...", matchQuery);

        // Aggregate query to find the main profile and lookup profile details
        const result = await AllProfiles.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'profileregisters', // The name of the profileregister collection
                    localField: 'AllprofilesId', // Field in AllProfiles
                    foreignField: '_id', // Field in profileregister
                    as: 'allProfilesDetails' // Name for the array of matched documents
                }
            }
        ]);

        console.log("...result ...", result);
        if (result.length === 0) {
            return res.status(404).json({
                response: null,
                Message: "Profile not found",
                ErrorCode: 404
            });
        }

        // Return the aggregated result
        return res.status(200).json({
            response: result[0], // result[0] contains the main profile and joined details
            Message: "Profiles fetched successfully",
            ErrorCode: null
        });
    } catch (error) {
        console.error("Error fetching profiles:", error);
        res.status(500).json({
            Error: 'Details not fetched',
            Message: 'Database Issue',
            ErrorCode: 308
        });
    }
};

const getprofileById = async(req,res) => {
    try {
        const profileIdentifier = req.params.identifier; // Use a generic identifier instead of email
      console.log("...profileIdentifier...",profileIdentifier)
        // let data;
    
        // // Check if the identifier is an email or a phone number
        // if (profileIdentifier.includes('@')) {
        //   // Assuming it's an email
        //   data = await ProfileRegister.findOne({ email: profileIdentifier });
        // } else {
        //   // Assuming it's a phone number
        //   data = await ProfileRegister.findOne({ phoneno: profileIdentifier });
        // }
    
        // if (!data) {
        //   return res.status(404).json({ message: 'Profile not found' });
        // }
        const data = await ProfileRegister.findOne({_id : profileIdentifier})
    
        res.status(200).json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    
}

const getOneprofileById = async(req,res) => {
    try {
        const profileIdentifier = req.params.identifier; // Use a generic identifier instead of email
      console.log("...profileIdentifier...",profileIdentifier)
        let data;
    
        // Check if the identifier is an email or a phone number
        if (profileIdentifier.includes('@')) {
          // Assuming it's an email
          data = await ProfileRegister.findOne({ email: profileIdentifier });
        } else {
          // Assuming it's a phone number
          data = await ProfileRegister.findOne({ phoneno: profileIdentifier });
        }
    
        if (!data) {
          return res.status(404).json({ message: 'Profile not found' });
        }
  
    
        res.status(200).json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    
}

const ProfileUpdate = async (req, res) => {
    try {
      const profileIdentifier = req.params.identifier;
      console.log("...profileIdentifier...", profileIdentifier);
  
      const updateData = req.body;
  
      // Remove phone and email fields from updateData if they exist
      delete updateData.phone;
      delete updateData.email;
  
      // Log the update data for debugging
      console.log("...updateData...", updateData);
  
      // Determine if the identifier is an email or phone number
      const identifierField = profileIdentifier.includes('@') ? 'email' : 'phone';
  
      // Find the profile and update the fields
      const updatedProfile = await ProfileRegister.findOneAndUpdate(
        { [identifierField]: profileIdentifier },
        { $set: updateData },
        { new: true, upsert: false }  // Ensure upsert is false
      );
  
      // Check if the profile was found and updated
      if (!updatedProfile) {
        console.log("Profile not found with identifier:", profileIdentifier);
        return res.status(404).json({ message: "Profile not found" });
      }
  
      console.log("Updated Profile:", updatedProfile);
      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  const getprofileByEmail = async(req,res) => {
    try {
        const profileIdentifier = req.params.identifier; // Use a generic identifier instead of email
      console.log("...profileIdentifier...",profileIdentifier)
        let data;
    
        // Check if the identifier is an email or a phone number
        if (profileIdentifier.includes('@')) {
          // Assuming it's an email
          data = await ProfileRegister.findOne({ email: profileIdentifier });
        } else {
          // Assuming it's a phone number
          data = await ProfileRegister.findOne({ phoneno: profileIdentifier });
        }
    
        if (!data) {
          return res.status(404).json({ message: 'Profile not found' });
        }
        const getProfile = await ProfileRegister.findOne({email : profileIdentifier})
    
        res.status(200).json(getProfile);
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
    getprofileById,
    ProfileUpdate,
    getOneprofileById , 
    getprofileByEmail
};
