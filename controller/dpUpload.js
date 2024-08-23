const AWS = require('aws-sdk');
const uuid = require('uuid').v4;

const s3 = new AWS.S3({
    credentials: {
        // accessKeyId: "AKIAW3MEC3XJGSISPYIW",
        // secretAccessKey: "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",
        accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
 
    },
    // region: "ap-south-1", // Specify your AWS region if necessary
    region: process.env.region
});

const dpUpload = async (req, res) => {
    try {
        console.log('File field name:', req.file.fieldname); // Log field name

        if (!req.file) {
            return res.status(400).send({ error: 'No file uploaded.' });
        }

        const email = req.query.email;
        if (!email) {
            return res.status(400).send({ error: 'Email query parameter is required.' });
        }

        const myFile = req.file.originalname.split('.');
        const fileType = myFile[myFile.length - 1];
        const fileName = `${uuid()}.${fileType}`;

        const params = {
            Bucket: 'soulmatch-images-upload-bucket', // Replace with your bucket name
            Key: fileName, // File name you want to save as in S3
            Body: req.file.buffer,
            ACL: 'public-read', // Make file publicly readable (optional)
            Metadata: {
                email: email // Add email as metadata
            }
        };

        s3.upload(params, (error, data) => {
            if (error) {
                console.error('Error uploading file:', error);
                return res.status(500).send(error);
            }

            console.log("File uploaded successfully:", data);
            res.status(200).send(data);
        });

    } catch (error) {
        console.error("Error in ImageUpload:", error);
        res.status(500).send({ error: 'Failed to upload image.' });
    }
};

module.exports = {
    dpUpload
};
