// const express = require('express');
// const axios = require('axios');
//
// // Initialize Express app
// const app = express();
// app.use(express.json());
//
// // Replace with your actual OpenAI API key
// const OPENAI_API_KEY = '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';
//
// // Endpoint to process messages
// app.post('/chat', async (req, res) => {
//     const userMessage = req.body.message;
//     console.log("Received message:", userMessage);
//
//     try {
//         // Call OpenAI Chat Completion API
//         const chatGptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
//             model: "gpt-3.5-turbo",
//             messages: [{ "role": "user", "content": userMessage }],
//             temperature: 0.7
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${OPENAI_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//
//         // Send response back
//         const responseMessage = chatGptResponse.data.choices[0].message.content;
//         res.send(responseMessage);
//     } catch (error) {
//         console.error('Error:', error.message);
//         if (error.response) {
//             console.error('Response data:', error.response.data);
//             console.error('Response status:', error.response.status);
//             console.error('Response headers:', error.response.headers);
//         } else if (error.request) {
//             console.error('Request:', error.request);
//         } else {
//             console.error('Error:', error.message);
//         }
//         res.status(500).send('Error processing the message');
//     }
// });
//
//
//
//
// app.post('/user-gender', async (req, res) => {
//     // const userMessage = req.body.message;
//     console.log(req.body);
// });
//
// // Start the server
// const PORT = 3000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



// Import required modules
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const axios = require('axios');
const OPENAI_API_KEY = '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';
// Initialize Express app
const app = express();
app.use(express.json());

// Initialize Sequelize to connect to your PostgreSQL database
// Replace 'your_database', 'your_username', and 'your_password' with your actual database details
const sequelize = new Sequelize('telegram2', 'erfan', '16day1378', {
    host: 'localhost',
    dialect: 'postgres'
});

// Define User model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique : true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    // Other model options
});

// Sync models with the database
sequelize.sync();

// Endpoint to add a new user
app.post('/start', async (req, res) => {
    try {
        const { username, token } = req.body;

        const existingUser = await User.findOne({ where: { username : username } });

        if (existingUser) {
            // User already exists - handle as needed (send a message or update user)
            res.status(409).send({ message: 'User already exists' });
        } else {
            // Create a new user
            const newUser = await User.create({ username, token });
            res.status(201).send(newUser);
        }
        //
        // const newUser = await User.create({ username, token });
        // res.status(201).send(newUser);
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const  username = req.body.username;
    const inappropriateWords = ['کص', 'کیر', 'تخم' , 'کون' , 'سکس' , 'سکسی' , 'جنسی', 'ممه' , 'کیری' , 'کوبص' , 'جنده', 'چوچول' , 'chatgpt' , 'chat gpt' , 'چت جی پی تی' ,  'چت جی'];
    console.log("Received message:", userMessage);
    if (/[a-zA-Z]/.test(userMessage)) {
        console.log("english detected");
        return res.status(400).send({ error: 'فارسی رو پاس بدار رفیق.' });
    }
    const containsInappropriateContent = inappropriateWords.some(word => userMessage.includes(word));
    if (containsInappropriateContent) {
        return res.status(400).send({ error: 'خیلی بی ادب شدیا اینا ممنوعه رعایت نکنی از امتیاز هات کم میشه حواست باشه.' });
    }
    try {
        const user = await User.findOne({ where: { username : username } });
        if ( 0) {
            return res.status(403).send({error : 'موجودی ناکافی'})
        }
        // Call OpenAI Chat Completion API
        const chatGptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ "role": "user", "content": userMessage + "نمره imdb و rotten tomato را هم بده و خلاصه از داستان ها هرکدوم بنویس برام "  + "پیشنهاد های فیلم یا سریال مشابه توضیح هایم را بهم معرفی کن لطفا" + "اسم فیلم را هم به انگلیسی هم به فارسی بنویس"}],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
//        user.token -= 1;
//        await user.save();

        // Send response back
        const responseMessage = chatGptResponse.data.choices[0].message.content;
        console.log(responseMessage);
        res.send(responseMessage);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request:', error.request);
        } else {
            console.error('Error:', error.message);
        }
        res.status(500).send('Error processing the message');
    }
});




app.post('/user-gender', async (req, res) => {
    // const userMessage = req.body.message;
    console.log(req.body);
});

// Your existing endpoints and additional logic...

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
