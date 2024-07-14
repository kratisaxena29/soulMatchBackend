const mongoose = require('mongoose');
const Conversations = require('../model/Conversation')
const  { User} = require('../model/User');
const Messages = require('../model/Messages');
const { ProfileRegister } = require('../model/profile_register');


const createConversation =  async(req,res) => {
    try{
        const {senderId, receiverId } = req.body;
        const newConversation = new Conversations({ members: [senderId , receiverId]});
        await newConversation.save();
        res.status(200).send('Conversation created successfully');

    }catch(error) {
        console.log(error,'Error')
    }
}

//  const getconversationByuserId = async(req,res) => {
//     try {
//         const userId = req.params.userId;
//         console.log("..userId...",userId)
//         // $in bo sari id nikal lo jismy userid include ho
//         const conversations = await Conversations.find({members : {$in : [userId]}});
//         // console.log("..conversation...",conversations)
//         const conversationUserData = Promise.all(conversations.map(async(conversation) => {
//             const receiverId = conversation.members.find((member) => member !== userId);
//             // console.log("..receiverId..",receiverId)
//             const user = await ProfileRegister.findById({_id : receiverId});
//             // console.log("..user...",user)
//             return { user : {receiverId : user._id,email : user.email , fullName : user.fullName},conversationId : conversation._id}
//         }))
//         console.log("...conversationUserData...",await conversationUserData)
//         res.status(200).json(await conversationUserData);
//     } catch (error) {
//         console.log(error,'Error')
//     }
// }

const getconversationByuserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("..userId...", userId);

        // Fetch conversations where the user is a member
        const conversations = await Conversations.find({ members: { $in: [userId] } });
        console.log("..conversations...", conversations);

        // Fetch user data for each conversation
        const conversationUserData = await Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member.toString() !== userId);
            console.log("..receiverId..", receiverId);

            // Ensure receiverId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(receiverId)) {
                console.log("....invalid...",`${receiverId}`)
                throw new Error(`Invalid receiverId: ${receiverId}`);
            }

            const user = await ProfileRegister.findById(receiverId);
            console.log("..user...", user);

            if (user) {
                return {
                    user: {
                        receiverId: user._id,
                        email: user.email,
                        fullName: user.name
                    },
                    conversationId: conversation._id
                };
            } else {
                throw new Error(`User not found for id: ${receiverId}`);
            }
        }));

        console.log("...conversationUserData...", conversationUserData);
        res.status(200).json(conversationUserData);
    } catch (error) {
        console.error(error, 'Error');
        res.status(500).json({ error: error.message });
    }
}


const createMessage = async (req,res) => {
    try {
        const { conversationId, senderId, message, receiverId = '' } = req.body;
    console.log("message body ...",req.body)
        // Validate required fields
        if (!senderId || !message) {
          return res.status(400).send('Please fill all required fields');
        }
    
        // Create new conversation and send message if `conversationId` is 'new'
        if (conversationId === 'new' && receiverId) {
          const newConversation = new Conversations({ members: [senderId, receiverId] });
          await newConversation.save();
          const newMessage = new Messages({ conversationId: newConversation._id, senderId, message });
          await newMessage.save();
        //   return res.status(200).send(
            
        //     'New conversation created and message sent successfully'
        // );
        return res.status(200).json({
            response: newConversation,
            Message: 'New conversation created and message sent successfully',
            ErrorCode :null,
          });
        } else if (!conversationId && !receiverId) {
          return res.status(400).send('Please fill all required fields');
        }
    
        // Send message to existing conversation if `conversationId` is provided
        const newMessage = new Messages({ conversationId, senderId, message });
        console.log("..newMessage..",newMessage)
        await newMessage.save();
        // res.status(200).send('Message sent successfully');
        res.status(200).json({
            response: newMessage,
            Message: 'Message sent successfully',
            ErrorCode :null,
          });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
      }
}


const getMessageByConversationId = async (req, res) => {
    try {
        const checkMessages = async (conversationId) => {
            console.log("conversationId:", conversationId);
            const messages = await Messages.find({ conversationId });
            console.log("messages:", messages);
            const messageUserData = await Promise.all(messages.map(async (message) => {
                console.log("...mess..",message)
                // const user = await Users.findById(message.senderId);
                const user = await ProfileRegister.findOne({ _id: message.senderId });
                console.log("user:", user);
                return {
                    user: {
                        id: user._id,
                        email: user.email,
                        fullName: user.name
                    },
                    message: message.message
                };
            }));
            console.log("messageUserData:", messageUserData);
            res.status(200).json(messageUserData);
        };

        const conversationId = req.params.conversationId;
        console.log("conversationId for second:", conversationId);

        if (conversationId === 'new') {
            const checkConversation = await Conversations.find({ members: { $all: [req.body.senderId, req.body.receiverId] } });
            console.log("checkConversation:", checkConversation);
            if (checkConversation.length > 0) {
                console.log("if checkMessage:", checkConversation[0]._id);
                await checkMessages(checkConversation[0]._id);
            } else {
                return res.status(200).json([]);
            }
        } else {
            console.log("third ConversationId:", conversationId);
            await checkMessages(conversationId);
        }
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createConversation,
    getconversationByuserId ,
    createMessage ,
    getMessageByConversationId
}