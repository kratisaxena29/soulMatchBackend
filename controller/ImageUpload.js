const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const { ProfileRegister } = require('../model/profile_register'); // Adjust the path as necessary
const {ImageUploadURL} = require("../model/ImageUpload")
const {IdentificationImage } = require("../model/IdentificationImage")

const s3 = new AWS.S3({
    credentials: {
        // accessKeyId: "AKIAW3MEC3XJGSISPYIW",
        // secretAccessKey: "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",
        accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  
    },
    // region: "ap-south-1",
    region: process.env.region
});

const ImageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: 'No file uploaded.' });
        }

        const myFile = req.file.originalname.split('.');
        const fileType = myFile[myFile.length - 1];
        const fileName = `${uuid()}.${fileType}`;

        const params = {
            Bucket: 'soulmatch-images-upload-bucket',
            Key: fileName,
            Body: req.file.buffer,
            ACL: 'public-read',
        };

        s3.upload(params, async (error, data) => {
            if (error) {
                console.error('Error uploading file:', error);
                return res.status(500).send(error);
            }

            // Check if either email or phoneno is provided
            const email = req.query.email;
            const phoneno = req.query.phoneno;
            if (!email && !phoneno) {
                return res.status(400).send({ error: 'Email or Phone number query parameter is required.' });
            }

            // Create the query object to find the profile
            // const formatedphoneno = `+${phoneno.trim()}`
            console.log()
            const query = email ? { email: email } : { phoneNo: `+${phoneno.trim()}` };
console.log("..query...",query)
            // Update the profile with the URL of the uploaded image
            const profile = await ProfileRegister.findOneAndUpdate(
                query,
                { fileUpload: data.Location },
                { new: true }
            );

            if (!profile) {
                return res.status(404).send({ error: 'Profile not found.' });
            }

            // Create the update object
            const updateData = {
                imageUrl: data.Location,
                modifiedAt: new Date()
            };
            if (email) {
                updateData.email = email;
            }
            if (phoneno) {
                updateData.phoneno = phoneno;
            }

            // Update or create the document in ImageUploadURL collection
            const imageUpload = await ImageUploadURL.findOneAndUpdate(
                query,
                updateData,
                { upsert: true, new: true }
            );

            // console.log("File uploaded successfully:", data);
            console.log("...imageupload...",imageUpload)
            res.status(200).send(profile);
        });

    } catch (error) {
        console.error("Error in ImageUpload:", error);
        res.status(500).send({ error: 'Failed to upload image.' });
    }
};




const getprofileByemail = async (req,res) => {
    try {
        const dataidentifier = req.params.identifier 
        let value 
        let data
        if(dataidentifier.includes('@')){
            value  = req.params.identifier
             data = await ImageUploadURL.find({email : value })
        }else{
            value  = req.params.identifier 
            data = await ImageUploadURL.find({phoneNo: value })
        }

        // console.log("...dataparams",dataidentifier)
       
        
        return res.status(200).json({
            response: data[0],
            Message: 'image fetched successfully',
            ErrorCode: null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            Error: 'Unable to fetch url',
            Message: 'Database Issue',
            ErrorCode: 308,
        });
    }
}

const IdentificationImageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: 'No file uploaded.' });
        }

        const myFile = req.file.originalname.split('.');
        const fileType = myFile[myFile.length - 1];
        const fileName = `${uuid()}.${fileType}`;

        const params = {
            Bucket: 'soulmatch-images-upload-bucket',
            Key: fileName,
            Body: req.file.buffer,
            ACL: 'public-read',
        };

        s3.upload(params, async (error, data) => {
            if (error) {
                console.error('Error uploading file:', error);
                return res.status(500).send(error);
            }

            const email = req.params.email; // Get email from URL parameter
            if (!email) {
                return res.status(400).send({ error: 'Email parameter is required.' });
            }

            // Assuming IdentificationImage is your Mongoose model
            const identImage = new IdentificationImage({
                email,
                identificationImageUrl: data.Location,
            });

            await identImage.save();

            console.log("File uploaded successfully:", data);
            res.status(200).send(identImage);
        });

    } catch (error) {
        console.error("Error in ImageUpload:", error);
        res.status(500).send({ error: 'Failed to upload image.' });
    }
};


module.exports = {
    ImageUpload ,
    getprofileByemail,
    IdentificationImageUpload
};
