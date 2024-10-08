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
    origin: '*',
    //  origin: 'http://localhost:5173',
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
            return res.status(201).send({ user: { ...existingUser, telegramId: existingUser.telegramId.toString() } });
        }

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                telegramId,
                points: 0
            }
        });

        res.status(200).json({ message: 'User created successfully', user: { ...newUser, telegramId: newUser.telegramId.toString() } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error', msg: error });
    }
});

api.post('/save-progress', async (req, res) => {
    const { telegramId, points, pointsPerClick, energyBar, upgradeLevelClick } = req.body;
 
    try {

        await prisma.user.update({
            where: { telegramId: Number(telegramId)  },
             data: {
                points,
                pointsPerClick, 
                energyBar,
                upgradeLevelClick, 
            }
        });
        res.status(200).send({ success: true });
    } catch (error) {
        res.status(500).send({ error: 'Error saving progress', 'msg':error });
    }
});



// Listen to server start on port
api.listen(PORT, () => console.log(`express is up on port ${PORT}`))



export function launchApi() {


    return api
}



// Endpoint to create a new user


