const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const Photurl = require('../model/multiplePhoto');  // Adjust the path to your actual model file

// AWS S3 configuration
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer S3 configuration for file upload
const uploadPhotos = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'bucket-for-profile-picture',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '_' + file.originalname);
    },
  }),
});

// Endpoint to handle file upload
const photoUrlfunction = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const email = req.params.email;  // Use params for route parameters
  const photoUrl = req.file.location;
  console.log("..photoUrl...", photoUrl);

  try {
   
   
   
      // User doesn't exist, create a new document
    const  photurl = new Photurl({ email, photoUrl: [photoUrl] });
    

    await photurl.save();
    res.json({
      message: 'File uploaded and URL saved successfully',
      fileUrl: photoUrl
    });
  } catch (error) {
    console.error('Error saving photo URL:', error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  photoUrlfunction,
  uploadPhotos,
};
