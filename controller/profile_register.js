const { response } = require("express");
const mongoose = require('mongoose');
const { AllProfiles } = require("../model/AllProfilesId");
const { AllSendRequest } = require("../model/AllSendRequest");
const { ProfileRegister } = require("../model/profile_register");
const { User } = require("../model/User");
const { photoUrlfunction } = require("./multiplePhoto");
const { Photurl } = require("../model/multiplePhoto");
const { DeleteRequest } = require('../model/DeleteRequest');
const { ObjectId } = mongoose.Types; 


const profileRegister = async (req, res) => {
  let profileData = req.body;

  try {
    if (profileData.email !== "") {
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
    if (profileData.phoneno !== "") {
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
    const { email, ageRange, religion, caste, subcaste, phoneno } = req.query;

    let filter = {};
console.log("...phoneNo...",phoneno)
    if (!email && !phoneno) {
      return res.status(400).json({
        Error: 'Email or Phone Number is required',
        Message: 'You must provide either an email or phone number to fetch profiles',
        ErrorCode: 301,
      });
    }

    if (email) {
      filter.email = { $ne: email };
    }
    if (phoneno) {
      filter.phoneNo = { $ne: phoneno };
    }

let formattedPhoneNo
console.log("..+${phoneno}...", formattedPhoneNo);
    let userProfile;
    if (email) {
      userProfile = await ProfileRegister.findOne({ email });
    } else if (phoneno) {
      formattedPhoneNo = `+${phoneno.trim()}`;
      userProfile = await ProfileRegister.findOne({ phoneNo: formattedPhoneNo });
    }

    if (!userProfile) {
      return res.status(404).json({
        Error: 'User Profile not found',
        Message: 'No profile found with the provided email or phone number',
        ErrorCode: 404,
      });
    }

    console.log("User Profile:", userProfile);

    // Add gender-based filtering
    if (userProfile.Part_gender) {
      console.log("...profilegender...",userProfile.Part_gender)
      filter.gender = userProfile.Part_gender;
      console.log("Gender filter applied:", filter.gender);
    } else {
      console.log("Gender not found in user profile");
    }

    console.log("Initial Filter applied:", filter);

    // Apply limit based on user's plan before filtering
    let limit = 0;

    if (userProfile.plan === "69900") {
      limit = 100;
    } else if (userProfile.plan === "99900") {
      limit = 150;
    } else if (userProfile.plan === "139900") {
      limit = 300; // No limit, fetch all
    } else if (userProfile.plan === null) {
      limit = 0; // No limit, fetch all
    }

    let profiles;
    console.log("...limit..",limit)
    if (limit > 0) {
      profiles = await ProfileRegister.find(filter).limit(limit); // Apply limit first
    } else {
      profiles = await ProfileRegister.find(filter); // Fetch all if no limit
    }

    // Now apply additional filtering on the limited profiles
    profiles = profiles.filter(profile => {
      // let parsedAgeRange;

      // if (ageRange) {
      //   // Parse the ageRange if it's passed as a string
      //   try {
      //     parsedAgeRange = JSON.parse(ageRange);  // Use a new variable to store the parsed result
      //   } catch (e) {
      //     console.error("Error parsing ageRange:", e);
      //     return false;
      //   }
    
      //   let isWithinAgeRange = false;
        
      //   parsedAgeRange.forEach(range => {
         
      //     console.log("....parsedAgeRanges...",parsedAgeRange)
      //     if(profile.Part_ageFrom.includes(parsedAgeRange)){
      //       isWithinAgeRange = true;
      //     }
      //   });
    
      //   // If the profile's age is not within any of the ranges, filter it out
      //   if (!isWithinAgeRange) {
      //     return false;
      //   }
      // }
    
      // let parsedcaste;

      // if (caste) {
      //   // Parse the ageRange if it's passed as a string
      //   try {
      //     parsedcaste = JSON.parse(caste);  // Use a new variable to store the parsed result
      //   } catch (e) {
      //     console.error("Error parsing ageRange:", e);
      //     return false;
      //   }
    
      //   let isWithinAgeRange = false;
        
      //   parsedcaste.forEach(range => {
         
      //     console.log("....parsedcaste...",parsedcaste)
      //     if(profile.Part_Caste.includes(parsedcaste)){
      //       isWithinAgeRange = true;
      //     }
      //   });
    
      //   // If the profile's age is not within any of the ranges, filter it out
      //   if (!isWithinAgeRange) {
      //     return false;
      //   }
      // }


      // let parsedreligion;

      // if (religion) {
      //   // Parse the ageRange if it's passed as a string
      //   try {
      //     parsedreligion = JSON.parse(religion);  // Use a new variable to store the parsed result
      //   } catch (e) {
      //     console.error("Error parsing ageRange:", e);
      //     return false;
      //   }
    
      //   let isWithinAgeRange = false;
        
      //   parsedreligion.forEach(range => {
         
      //     console.log("....parsedreligion...",parsedreligion)
      //     if(profile.Part_Religion.includes(parsedreligion)){
      //       isWithinAgeRange = true;
      //     }
      //   });
    
      //   // If the profile's age is not within any of the ranges, filter it out
      //   if (!isWithinAgeRange) {
      //     return false;
      //   }
      // }

      // let parsedsubcaste;

      // if (subcaste) {
      //   // Parse the ageRange if it's passed as a string
      //   try {
      //     parsedsubcaste = JSON.parse(subcaste);  // Use a new variable to store the parsed result
      //   } catch (e) {
      //     console.error("Error parsing ageRange:", e);
      //     return false;
      //   }
    
      //   let isWithinAgeRange = false;
        
      //   parsedsubcaste.forEach(range => {
         
      //     console.log("....parsedreligion...",parsedsubcaste)
      //     if(profile.Part_subCaste.includes(parsedsubcaste)){
      //       isWithinAgeRange = true;
      //     }
      //   });
    
      //   // If the profile's age is not within any of the ranges, filter it out
      //   if (!isWithinAgeRange) {
      //     return false;
      //   }
      // }

      if (ageRange && !profile.Part_ageFrom.includes(ageRange)) {
        return false;
      }
      if (religion && !profile.Part_Religion.includes(religion)) {
        console.log(".religion..",religion)
        console.log("..profile.Part_Religion..",profile.Part_Religion)
        return false;
      }
      if (caste && !profile.Part_Caste.includes(caste)) {
        console.log(".caste..",caste)
        console.log("..profile.Part_Caste..",profile.Part_Caste)
        return false;
      }
      if (subcaste && !profile.Part_subCaste.includes(subcaste)) {
        console.log(".caste..",caste)
        console.log("..profile.Part_Caste..",profile.Part_Caste)
        return false;
      }
      return true;
    });
    // console.log("..getprofile...",profiles)
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
    console.log("...existingProfile...", existingProfile)

    // If AllprofilesId is not an array, wrap it in an array
    if (!Array.isArray(iddata.AllprofilesId)) {
      iddata.AllprofilesId = [iddata.AllprofilesId];
    }

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
  console.log("....krati....")

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
    const matchQuery = email ? { email: email } : { phoneno: `+${phoneno.trim()}` };
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

const getprofileById = async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier; // Use a generic identifier instead of email
    console.log("...profileIdentifier...", profileIdentifier)
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
    const data = await ProfileRegister.findOne({ _id: profileIdentifier })

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

}

const getOneprofileById = async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier; // Use a generic identifier instead of email
    console.log("...profileIdentifier...", profileIdentifier)
    let data;

    // Check if the identifier is an email or a phone number
    if (profileIdentifier.includes('@')) {
      // Assuming it's an email
      data = await ProfileRegister.findOne({ email: profileIdentifier });
    } else {
      // Assuming it's a phone number
      data = await ProfileRegister.findOne({ phoneNo: profileIdentifier });
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
    const identifierField = profileIdentifier.includes('@') ? 'email' : 'phoneNo';
console.log("...identifier...",identifierField)
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

const getprofileByEmail = async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier; // Use a generic identifier instead of email
    console.log("...profileIdentifier krati...", profileIdentifier)
    let data;

    // Check if the identifier is an email or a phone number
    if (profileIdentifier.includes('@')) {
      // Assuming it's an email
      data = await ProfileRegister.findOne({ email: profileIdentifier });
    } else {
      // Assuming it's a phone number
      data = await ProfileRegister.findOne({ phoneNo: profileIdentifier });
    }

    if (!data) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    // const getProfile = await ProfileRegister.findOne({ email: profileIdentifier })
console.log("... Krati...data...",data )
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

}

const getphotosByEmailOrPhoneNo = async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier; // Use a generic identifier instead of email
    console.log("...Url...", profileIdentifier)
    let data;

    // Check if the identifier is an email or a phone number
    if (profileIdentifier.includes('@')) {
      // Assuming it's an email
      data = await Photurl.findOne({ email: profileIdentifier });
    } else {
      // Assuming it's a phone number
      data = await Photurl.findOne({ phoneNo: profileIdentifier });
    }
    console.log("...photo data...", data)
    if (!data) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    // const getProfile = await ProfileRegister.findOne({email : profileIdentifier})

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

}
const deletephotosByEmailOrPhoneNo = async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier; // Use a generic identifier instead of email
    const photoToDelete = req.body.photoToDelete; // URL of the photo to delete
    console.log("...Profile Identifier...", profileIdentifier);
    console.log("...Photo to delete...", photoToDelete);

    let data;

    // Check if the identifier is an email or a phone number
    if (profileIdentifier.includes('@')) {
      // Assuming it's an email
      data = await Photurl.findOne({ email: profileIdentifier });
      console.log("...data found by email...", data);
    } else {
      // Assuming it's a phone number
      data = await Photurl.findOne({ phoneNo: profileIdentifier });
      console.log("...data found by phone number...", data);
    }

    if (!data) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Log the current photo URLs
    console.log("...Current photo URLs...", data.photoUrl);

    // Remove the photo from the photoUrl array
    const updatedPhotos = data.photoUrl.filter(url => url !== photoToDelete);

    // Log the updated photo URLs
    console.log("...Updated photo URLs...", updatedPhotos);

    if (updatedPhotos.length === data.photoUrl.length) {
      return res.status(404).json({ message: 'Photo not found in profile' });
    }

    // Update the document with the new array
    data.photoUrl = updatedPhotos;
    await data.save();

    res.status(200).json({ message: 'Photo deleted successfully', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



const getphotosById = async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier; // Use a generic identifier instead of email
    console.log("...Url...", profileIdentifier);

    // Ensure the identifier is treated as an ObjectId
    //   const objectId = mongoose.Types.ObjectId(profileIdentifier);

    let data = await Photurl.findOne({ id: profileIdentifier });
    console.log("...data...", data);

    if (!data) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



const pushAllTheSendId = async (req, res) => {
  let iddata = req.body;

  console.log("...idData...");

  if (!iddata.email && !iddata.phoneno) {
    return res.status(400).json({
      response: null,
      Message: "Email or Phone number is required",
      ErrorCode: 400,
    });
  }

  try {
    const query = iddata.email ? { email: iddata.email } : { phoneNo: iddata.phoneno };
    console.log("...query...",query)
    const profileFind = await ProfileRegister.findOne(query);

    if (!profileFind) {
      return res.status(400).json({
        response: null,
        Message: "Profile does not match",
        ErrorCode: 404,
      });
    }

    iddata.profileId = profileFind._id;

    const profileQuery = iddata.email ? { email: iddata.email } : { phoneno: iddata.phoneno };
    let existingProfile = await AllSendRequest.findOne(profileQuery);
console.log("..existingProfile..",existingProfile)
    if (existingProfile) {
      existingProfile = await AllSendRequest.findOneAndUpdate(
        profileQuery,
        { $addToSet: { AllprofilesId: { $each: iddata.AllprofilesId } }, $set: { profileId: iddata.profileId } },
        { new: true }
      );

      return res.status(200).json({
        response: {
          email: iddata.email,
          phoneno: iddata.phoneno,
          profileId: profileFind._id,
          AllprofilesId: existingProfile._id,
        },
        Message: 'Profile ID updated',
        ErrorCode: null,
      });
    } else {
      const data = new AllSendRequest(iddata);
      console.log("...data...",data)
      await data.save();

      return res.status(200).json({
        response: {
          email: iddata.email,
          phoneno: iddata.phoneno,
          profileId: profileFind._id,
          AllprofilesId: data._id,
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

const getAllRequestById = async (req, res) => {
  const { id } = req.params; // Get the id from params

  try {
    console.log("..id...", id);

    // Find all documents where the provided `id` is in the `AllprofilesId` array
    const requests = await AllSendRequest.find({
      AllprofilesId: { $in: [new ObjectId(id)] }
    });

    console.log("...requests...", requests);

    // If no matching documents are found
    // if (requests.length === 0) {
    //   return res.status(404).json({
    //     message: 'No profiles found with the given id in AllprofilesId',
    //     data: null
    //   });
    // }

    const profileIds = requests.map((request) => request.profileId);
    console.log("...profileIds...",profileIds)
    const profiles = await ProfileRegister.find({
      _id: { $in: profileIds }},
      { name: 1, fileUpload: 1 }
    );

    console.log("...profiles...", profiles);

    res.status(200).json({
      message: 'Profiles fetched successfully',
      counts : profiles.length,
      data: profiles // Return all matching documents
    });
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

// const deleteRequestById = async (req, res) => {
//   const { id, requestId } = req.query; // Get `id` and `requestId` from query parameters
// // id means addi ki profile
// // requestId - nupur ki profile id 
//   try {
//     console.log("..profileId...", id);
//     console.log("..requestId...", requestId);

//     // Find the document that matches the provided `profileId`
//     const requests = await AllSendRequest.findOne({
//       profileId: requestId
//     });

//     console.log("...requests...", requests);

//     // If no matching document is found
//     if (!requests) {
//       return res.status(404).json({
//         message: 'No profiles found with the given profileId',
//         data: null
//       });
//     }

//     // Check if the requestId is in the AllprofilesId array
//     const index = requests.AllprofilesId.indexOf(id);
//     if (index === -1) {
//       return res.status(404).json({
//         message: 'requestId not found in AllprofilesId',
//         data: null
//       });
//     }

//     // Remove the requestId from the AllprofilesId array
//     requests.AllprofilesId.splice(index, 1);

//     // Save the updated document
//     await requests.save();
//     let deleteRequest = await DeleteRequest.findOne({
//       profileId: id, // 'id' should be saved in the `profileId` field
//     });

//     // If no document is found, create a new one
//     if (!deleteRequest) {
//       deleteRequest = new DeleteRequest({
//         profileId: id,
//         AllprofilesId: [requestId], // Initialize AllprofilesId array with the requestId
//         modifiedAt: new Date(),
//       });
//     } else {
//       // If the document already exists, update it
//       // Check if the requestId is already in the AllprofilesId array
//       if (!deleteRequest.AllprofilesId.includes(requestId)) {
//         deleteRequest.AllprofilesId.push(requestId); // Add requestId if it doesn't exist
//       }
//       deleteRequest.modifiedAt = new Date(); // Update the modifiedAt field
//     }
// console.log("....delete requests...",requests)
//     res.status(200).json({
//       message: 'Request deleted successfully',
//       data: requests
//     });
//   } catch (err) {
//     console.error("Error processing request:", err);
//     res.status(500).json({
//       message: 'Internal server error',
//     });
//   }
// };




// const deleteRequestById = async (req, res) => {
//   const { id, requestId } = req.query; // Get `id` and `requestId` from query parameters
//   try {
//     console.log("..profileId...", id);
//     console.log("..requestId...", requestId);

//     // Check if a request already exists with the provided `profileId`
//     let deleteRequest = await DeleteRequest.findOne({
//       profileId: id, // 'id' should be saved in the `profileId` field
//     });

//     // If no document is found, create a new one
//     if (!deleteRequest) {
//       deleteRequest = new DeleteRequest({
//         profileId: id,
//         AllprofilesId: [requestId], // Initialize AllprofilesId array with the requestId
//         modifiedAt: new Date(),
//       });
//     } else {
//       // If the document already exists, update it
//       // Check if the requestId is already in the AllprofilesId array
//       if (!deleteRequest.AllprofilesId.includes(requestId)) {
//         deleteRequest.AllprofilesId.push(requestId); // Add requestId if it doesn't exist
//       }
//       deleteRequest.modifiedAt = new Date(); // Update the modifiedAt field
//     }

//     // Save the document
//     await deleteRequest.save();

//     console.log("....saved delete request...", deleteRequest);
//     res.status(200).json({
//       message: 'Request saved successfully',
//       data: deleteRequest,
//     });
//   } catch (err) {
//     console.error("Error processing request:", err);
//     res.status(500).json({
//       message: 'Internal server error',
//     });
//   }
// };

const deleteRequestById = async (req, res) => {
  const { id, requestId } = req.query; // Get `id` and `requestId` from query parameters
  // id means addi ki profile
  // requestId - nupur ki profile id 
  try {
    console.log("..profileId...", id);
    console.log("..requestId...", requestId);

    // Find the document that matches the provided `profileId`
    const requests = await AllSendRequest.findOne({
      profileId: requestId
    });

    console.log("...requests...", requests);

    // If no matching document is found
    if (!requests) {
      return res.status(404).json({
        message: 'No profiles found with the given profileId',
        data: null
      });
    }

    // Check if the `id` is in the AllprofilesId array
    const index = requests.AllprofilesId.indexOf(id);
    if (index === -1) {
      return res.status(404).json({
        message: 'id not found in AllprofilesId',
        data: null
      });
    }

    // Remove the `id` from the AllprofilesId array
    requests.AllprofilesId.splice(index, 1);

    // Save the updated document
    await requests.save();

    let deleteRequest = await DeleteRequest.findOne({
      profileId: id, // 'id' should be saved in the `profileId` field
    });

    // If no document is found, create a new one
    if (!deleteRequest) {
      deleteRequest = new DeleteRequest({
        profileId: id,
        AllprofilesId: [requestId], // Initialize AllprofilesId array with the requestId
        modifiedAt: new Date(),
      });
    } else {
      // If the document already exists, update it
      // Check if the requestId is already in the AllprofilesId array
      if (!deleteRequest.AllprofilesId.includes(requestId)) {
        deleteRequest.AllprofilesId.push(requestId); // Add requestId if it doesn't exist
      }
      deleteRequest.modifiedAt = new Date(); // Update the modifiedAt field
    }

    // Save the deleteRequest document after modifications
    await deleteRequest.save();

    console.log("....delete requests...", deleteRequest);
    
    res.status(200).json({
      message: 'Request deleted and saved successfully',
      data: {
        updatedRequests: requests,
        deleteRequest: deleteRequest
      }
    });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};


const getAcceptInterest = async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier;
    console.log("...profileIdentifier...", profileIdentifier);
    let data;

    // Check if the identifier is an email or a phone number
    if (profileIdentifier.includes('@')) {
      data = await AllProfiles.findOne({ email: profileIdentifier }).select('AllprofilesId'); // Only retrieve the array
    } else {
      data = await AllProfiles.findOne({ phoneno: profileIdentifier }).select('AllprofilesId');
    }

    if (!data) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get the count of the elements in the AllprofilesId array
    const count = data.AllprofilesId.length;
      const responseData = data.AllprofilesId
      console.log("...res",responseData)
    res.status(200).json({ 
      responseData,
      count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getOtherAccept = async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier;
    console.log("...profileIdentifier...", profileIdentifier);

    // Find documents where the profileIdentifier exists in the AllprofilesId array
    let data = await AllProfiles.find({ AllprofilesId: profileIdentifier });
console.log("..data...",data)
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get the count of matching documents
    const count = data.length;

    // Optionally, you can just return the matched profiles' IDs
    const responseData = data.map(profile => profile.profileId);
    console.log("...res", responseData);

    res.status(200).json({ 
      responseData,
      count 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getSendRequestIds= async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier;
    console.log("...profileIdentifier...", profileIdentifier);
    let dataProfile;

    // Check if the identifier is an email or a phone number
    if (profileIdentifier.includes('@')) {
      dataProfile = await AllSendRequest.findOne({ email: profileIdentifier })
    } else {
      dataProfile = await AllSendRequest.findOne({ phoneno: profileIdentifier })
    }

    if (!dataProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get the count of the elements in the AllprofilesId array
  
    const count = dataProfile.AllprofilesId.length;
    const responseData = dataProfile.AllprofilesId
    res.status(200).json({ 
      count,
      responseData
     });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDeleteRequest = async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier;
    console.log("...profileIdentifier...", profileIdentifier);
    let data;

   
    data = await DeleteRequest.findOne({ profileId : profileIdentifier })
    if (!data) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get the count of the elements in the AllprofilesId array
    const count = data.AllprofilesId.length;
     const responseData = data.AllprofilesId
    res.status(200).json({
      responseData,
       count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getOtherDelete = async (req, res) => {
  try {
    const profileIdentifier = req.params.identifier;
    console.log("...profileIdentifier...", profileIdentifier);
    let data;

   
    data = await DeleteRequest.find({ AllprofilesId : profileIdentifier })
    console.log("...data...",data)
    if (!data) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get the count of the elements in the AllprofilesId array
    const count = data.length;
     const responseData = data.map(profile => profile.profileId)
    res.status(200).json({
      responseData,
       count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const OpenId = async (req, res) => {
  const { ids } = req.body;
  console.log("..ids...", ids);

  try {
    const profiles = await ProfileRegister.aggregate([
      { 
        $match: { _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } }
      },
      // Now the lookup is outside of $match
      {
        $lookup: {
          from: "photurls", // The collection to join
          let: { profileId : "$_id" }, // Use the email from ProfileRegister
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$id", "$$profileId"] } // Match email from Photurls with email from ProfileRegister
              }
            }
          ],
          as: "photoSection" // The resulting field that will hold the matched documents
        }
      },
      { 
        $unwind: { 
          path: "$photoSection", 
          preserveNullAndEmptyArrays: true // This ensures documents without a match are not dropped
        }
      },
      
    ]);
    
    

    console.log("...profiles..", profiles);
    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error fetching profiles", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  pushAllTheSendId,
  profileRegister,
  getAllProfiles,
  pushAllTheprofilesId,
  getAlltheProfileId,
  getprofileById,
  ProfileUpdate,
  getOneprofileById,
  getprofileByEmail,
  getphotosByEmailOrPhoneNo,
  deletephotosByEmailOrPhoneNo,
  getphotosById,
  getAllRequestById,
  deleteRequestById,
  getAcceptInterest,
  getSendRequestIds,
  getDeleteRequest,
  getOtherAccept,
  getOtherDelete,
  OpenId
};
