const { ProfileRegister } = require("../model/profile_register");
const { profileRegister } = require("./profile_register");


const getNoOfProfiles = async (req, res) => {
    try {
        const profiles = await ProfileRegister.find(); // Fetch all profiles
        const numberOfProfiles = profiles.length; // Get the number of profiles

        res.status(200).json({
            message: 'Profiles retrieved successfully',
            profiles: profiles, // List of profiles
            numberOfProfiles: numberOfProfiles // Number of profiles
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const TodayRegistration = async(req, res) => {
    
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of the day
    
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1); // End of the day
    
            const count = await ProfileRegister.countDocuments({
                $or: [
                    { createdAt: { $gte: today, $lt: tomorrow } },
                    { modifiedAt: { $gte: today, $lt: tomorrow } }
                ]
            });
    
            res.json({ count });
        } catch (error) {
            res.status(500).json({ error: 'Something went wrong' });
        }
}

const activeSubscription = async(req,res) => {
    try {
 
        const activesubscription = await ProfileRegister.countDocuments({
            plan: { $in: [69900, 99900, 139900] }
          });

          const plan100Count = await ProfileRegister.countDocuments({ plan: 69900 });
          const plan200Count = await ProfileRegister.countDocuments({ plan: 99900 });
          const plan300Count = await ProfileRegister.countDocuments({ plan: 139900 });

      res.status(200).json({
        message: 'ActivePlan retrieved successfully',
        ActiveSub : activesubscription, // List of profiles
        plan100: plan100Count,
        plan200: plan200Count,
        plan300: plan300Count,
      })  
    } catch (error) {
        res.status(500).json({message : "Server error"})
    }
}

const verifyProfile = async (req, res) => {
    const id = req.params.id;
    console.log("id:", id);

    try {
        // Find the profile by ID and update the verifyProfile field to false
        const data = await ProfileRegister.findOneAndUpdate(
            { _id: id },
            { $set: { verifyProfile: true } },
            { new: true } // This option returns the updated document
        );

        console.log("...data...", data);

        if (!data) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json({ message: "Profile verification status updated", data });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteProfile = async (req, res) => {
    const id = req.params.id;
    console.log("id:", id);

    try {
      
        const data = await ProfileRegister.findOneAndDelete(
            { _id: id },
       
        );

        console.log("...data...", data);

        if (!data) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json({ message: "Profile  has been deleted", data });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getMonthlyUserCount = async (req,res) => {
    try {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const userCounts = await ProfileRegister.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$modifiedAt" },
                        year: { $year: "$modifiedAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            },
            {
                $project: {
                    _id: 0,
                    month: { $arrayElemAt: [monthNames, { $subtract: ["$_id.month", 1] }] },
                    year: "$_id.year",
                    count: 1
                }
            }
        ]);

         userCounts;
    
        res.status(200).json( userCounts );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    getNoOfProfiles ,
    TodayRegistration ,
    activeSubscription,
    verifyProfile,
    deleteProfile,
    getMonthlyUserCount
}