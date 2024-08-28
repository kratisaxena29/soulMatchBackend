const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const {Photurl }= require('../model/multiplePhoto');  // Adjust the path to your actual model file
const { ProfileRegister } = require('../model/profile_register');

// AWS S3 configuration
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



// Endpoint to handle file upload
const photoUrlfunction = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const identifier = req.params.identifier;

  try {
    const myFile = req.file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid()}.${fileType}`;

    const params = {
      Bucket: 'soulmatch-images-upload-bucket',
      Key: fileName,
      Body: req.file.buffer,
      ACL: 'public-read',
    };

    // Upload file to S3
    s3.upload(params, async (error, data) => {
      if (error) {
        console.error('Error uploading to S3:', error);
        return res.status(500).send('Error uploading file.');
      }

      const photoUrl = data.Location;

      try {
        // Construct query based on identifier type (email or phone number)
        let query = {};
        if (identifier.includes('@')) {
          query.email = identifier;
        } else {
          query.phoneNo = identifier;
        }

        // Fetch the id from the ProfileRegister collection
        let idprofile = await ProfileRegister.findOne(query);
        if (!idprofile || !idprofile._id) {
          console.error('Profile not found for identifier:', identifier);
          return res.status(404).send('Profile not found.');
        }

        console.log("ProfileRegister ID:", idprofile._id);

        // Find existing Photurl document or create a new one
        let existingProfile = await Photurl.findOne(query);
        if (existingProfile) {
          // If the document exists, update it by adding the new photoUrl to the array
          existingProfile.photoUrl.push(photoUrl);
          await existingProfile.save();
        } else {
          // If the document does not exist, create a new one with the id
          existingProfile = new Photurl({
            id: idprofile._id,
            email: idprofile.email || '', // Save email if available
            phoneNo: idprofile.phoneNo || '', // Save phone number if available
            photoUrl: [photoUrl],
            modifiedAt: new Date(),
          });
          await existingProfile.save();
        }

        res.json({
          message: 'File uploaded and URL saved successfully',
          fileUrl: photoUrl,
        });
      } catch (dbError) {
        console.error('Error saving photo URL:', dbError);
        res.status(500).send('Server error');
      }
    });
  } catch (error) {
    console.error('Error in file upload process:', error);
    res.status(500).send('Server error');
  }
};









module.exports = {
  photoUrlfunction,
};