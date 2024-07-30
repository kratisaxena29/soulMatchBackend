const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const {Photurl }= require('../model/multiplePhoto');  // Adjust the path to your actual model file

// AWS S3 configuration
const s3 = new AWS.S3({
  credentials: {
      accessKeyId: "AKIAW3MEC3XJGSISPYIW",
      secretAccessKey: "oCz86rR61Zax3q0AqLZ89gGugedpvdsyfTCgAslV",
  },
  region: "ap-south-1",
});



// Endpoint to handle file upload
const photoUrlfunction = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const email = req.params.email;

  try {
    const myFile = req.file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const fileName = `${uuid()}.${fileType}`;

    const params = {
      Bucket: 'bucket-for-profile-picture',
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
        // Check if a document with the given email exists
        let existingProfile = await Photurl.findOne({ email });

        if (existingProfile) {
          // If the document exists, update it by adding the new photoUrl to the array
          existingProfile.photoUrl.push(photoUrl);
          await existingProfile.save();
        } else {
          // If the document does not exist, create a new one
          existingProfile = new Photurl({ email, photoUrl: [photoUrl] });
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