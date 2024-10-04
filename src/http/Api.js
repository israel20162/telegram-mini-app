import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js'
import { prisma } from './prisma.js';
const supabaseUrl = 'https://ljtjkdhtecpvzbdlzjbi.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const PORT = 8000
var corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
export const MESSAGE_PATH = "/message"
// Setup HTTP api
const api = express()
api.use(express.json())
api.use(cors(corsOptions))
api.use(bodyParser.json());

api.post('/user', async (req, res) => {
    const { telegramId } = req.body;
    
    if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
        // Check if the user already exists
        let existingUser = await prisma.user.findUnique({ where: { telegramId: telegramId } })
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                telegramId,
                points: 0
            }
        });

        return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: 'Server error', msg: error });
    }
});



// Listen to server start on port
api.listen(PORT, () => console.log(`express is up on port ${PORT}`))



export function launchApi() {


    return api
}



// Endpoint to create a new user


