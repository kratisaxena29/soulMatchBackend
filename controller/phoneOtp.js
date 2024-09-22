const otpGenerator = require("otp-generator");
const { Phoneotpdata } = require("../model/phoneOtp"); // Adjust the path as needed
const { User } = require("../model/User");
const AWS = require('aws-sdk');
const {  SubscribeCommand } = require('@aws-sdk/client-sns');
const {SNSClient , PublishCommand} = require('@aws-sdk/client-sns')

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region
});





const sns = new SNSClient({
  region: process.env.region,
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  }
});

// const subscribePhoneNumber = async (phoneNumber, topicArn) => {
//   try {
//     const params = {
//       Protocol: 'sms',
//       Endpoint: phoneNumber, // The phone number must be in E.164 format (e.g., +919871627742)
//       TopicArn: topicArn,
//     };

//     const command = new SubscribeCommand(params);
//     const data = await sns.send(command);
//     console.log("Subscription response:", data);
//     return data;
//   } catch (error) {
//     console.error("Error subscribing phone number:", error.message);
//     throw error;
//   }
// };

// const sendOTPByPhone = async (req, res) => {
//   try {
//     const { phoneno, subject } = req.body;
//     console.log("Phone Number:", phoneno, "Subject:", subject);

//     // Ensure phone number is provided
//     if (!phoneno) {
//       return res.status(400).json({ error: 'Phone number is required.' });
//     }

//     const formattedPhoneNo = phoneno.startsWith('+91') ? phoneno : `+91${phoneno}`;
//     console.log("Formatted Phone Number:", formattedPhoneNo);

//     const user = await User.findOne({ phoneno: formattedPhoneNo });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     // Mark user as confirmed
//     user.isConfirmed = true;
//     await user.save();
//     console.log('User confirmed successfully:', user);

//     // Generate OTP
//     const otp = otpGenerator.generate(6, {
//       digits: true,
//       upperCaseAlphabets: false,
//       specialChars: false,
//       lowerCaseAlphabets: false,
//     });
//     console.log("Generated OTP:", otp);

//     // Check if an OTP already exists for this phone number and delete it
//     await Phoneotpdata.deleteOne({ phoneno: formattedPhoneNo });

//     // Save the new OTP entry
//     const otpEntry = new Phoneotpdata({ phoneno: formattedPhoneNo, otp, subject });
//     await otpEntry.save();
//     console.log('OTP saved successfully:', otpEntry);

//     // Publish OTP to SNS Topic
//     const topicArn = 'arn:aws:sns:ap-south-1:471112801746:soulmatch-topic'; // Replace with your topic ARN

//     // Subscribe phone number to the topic
//     await subscribePhoneNumber(formattedPhoneNo, topicArn);

//     // Prepare SNS publish parameters
//     const params = {
//       Message: `(SoulMatch) Use OTP for authentication , OTP code is ${otp}`,
//       TopicArn: topicArn,
//       MessageAttributes: {
//         'AWS.SNS.SMS.SMSType': {
//           DataType: 'String',
//           StringValue: 'Transactional' // Use 'Transactional' for OTPs
//         }
//       }
//     };

//     const command = new PublishCommand(params);
//     const data = await sns.send(command);

//     console.log("OTP sent via topic successfully:", data);
//     res.status(200).json({ message: 'OTP sent via topic successfully', data });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ error: "Internal server error.", details: error });
//   }
// };

const sendOTPByPhone = async (req, res) => {
  try {
    const { phoneno, subject } = req.body;
    console.log("Phone Number:", phoneno, "Subject:", subject);

    if (!phoneno) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const formattedPhoneNo = phoneno.startsWith('+91') ? phoneno : `+91${phoneno}`;
    console.log("Formatted Phone Number:", formattedPhoneNo);

    const user = await User.findOne({ phoneno: formattedPhoneNo });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Mark user as confirmed
    user.isConfirmed = true;
    await user.save();
    console.log('User confirmed successfully:', user);

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    console.log("Generated OTP:", otp);

    // Check if an OTP already exists for this phone number and delete it
    await Phoneotpdata.deleteOne({ phoneno: formattedPhoneNo });

    // Save the new OTP entry
    const otpEntry = new Phoneotpdata({ phoneno: formattedPhoneNo, otp, subject });
    await otpEntry.save();
    console.log('OTP saved successfully:', otpEntry);

    // Send OTP directly via SNS
    const params = {
      Message: `(SoulMatch) Use OTP for authentication, OTP code is ${otp}`,
      PhoneNumber: formattedPhoneNo,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional' // Use 'Transactional' for OTPs
        }
      }
    };

    const command = new PublishCommand(params);
    const data = await sns.send(command);

    console.log("OTP sent successfully:", data);
    res.status(200).json({ message: 'OTP sent successfully', data });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal server error.", details: error });
  }
};





const verifyPhoneOtp = async (req, res) => {
    try {
        const { phoneno, otp } = req.body;
        console.log("Verifying OTP for phoneno:", phoneno, "OTP:", otp);

        const otpEntry = await Phoneotpdata.findOne({ phoneno, otp });
        console.log("...otp from db ..", otpEntry);

        if (otpEntry) {
            // OTP matches, update emailVerified field in User collection
            const user = await User.findOne({phoneno : phoneno });

            if (!user) {
                return res.status(400).send("User not found.");
            }

            user.Verified = true;
            const updatedUser = await user.save();
            console.log("Updated user:", updatedUser);

            // Check if the emailVerified field is updated
            if (updatedUser.Verified) {
                console.log("phone no verified successfully.");
            } else {
                console.error("Failed to update PhoneVerified field.");
            }

            res.status(200).send("OTP matches and phone verified.");
        } else {
            // OTP does not match
            res.status(400).send("OTP does not match.");
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error.");
    }
};




module.exports = {
  sendOTPByPhone,verifyPhoneOtp
};
