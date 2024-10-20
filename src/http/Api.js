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
    const { telegramId, fren, username } = req.body;
    function toObject(obj) {
        return JSON.parse(JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    } 
    if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
    }

    try {
        // Check if the user already exists
        let existingUser = await prisma.user.findUnique({ where: { telegramId: telegramId } })
        if (existingUser) {
            await prisma.user.update({
                where: { telegramId: existingUser.telegramId },
                data: {
                    username: username
                }
            })
            return res.status(201).json({ user: toObject(existingUser) });
        }

        const referrer = await prisma.user.findUnique({
            where: { telegramId: fren }
        });

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                telegramId,
                referredBy: referrer ? referrer.telegramId : null, // Associate referrer if present
                points: 0,
                username: username
            }
        });
        // If a 'fren' (referral) is provided, find the referrer

        if (fren) {
            const referrer = await prisma.user.findUnique({
                where: { telegramId: fren }
            });

            if (!referrer) {
                res.status(400).json({ error: 'Invalid referral code.' });
            }
            // If there's a referrer, create the referral entry and reward the referrer
            if (referrer) {
                await prisma.referral.create({
                    data: {
                        userId: newUser.telegramId, // New user who was referred
                        referrerTelegramId: referrer.telegramId, // Referrer's Telegram ID
                    }
                })
                await prisma.user.update({
                    where: { telegramId: referrer.telegramId },
                    data: {
                        points: {
                            increment: 5000 // Give the referrer 5000 points for the referral
                        },

                    }
                });
            }

        }




        res.status(200).json({ message: 'User created successfully', user: toObject(newUser) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error', msg: error });
    }
});

api.post('/save-progress', async (req, res) => {
    const { telegramId, points, pointsPerClick, energyBar, upgradeLevelClick, upgradeLevelEnergy, upgradeLevelRecharge, profitPerHour, rechargeSpeed } = req.body;

    try {

        await prisma.user.update({
            where: { telegramId: Number(telegramId) },
            data: {
                points,
                pointsPerClick,
                energyBar,
                upgradeLevelClick,
                upgradeLevelEnergy,
                upgradeLevelRecharge,
                profitPerHour,
                rechargeSpeed
            }
        });
        res.status(200).send({ success: true });
    } catch (error) {
        res.status(500).send({ error: 'Error saving progress', 'msg': error });
    }
});

api.get('get-friends/:telegramId', async (req, res) => {
    const { telegramId } = req.params;
    try {
        // Find all users who were referred by the current user
        const friends = await prisma.user.findMany({
            where: {
                referredBy: telegramId // Filter based on the 'referredBy' field
            },
            select: {
                telegramId: true, // You can customize which fields to select
                username: true,
                points: true,
                profitPerHour: true
            }
        });

        res.status(200).json(friends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
})



// Listen to server start on port
api.listen(PORT, () => console.log(`express is up on port ${PORT}`))



export function launchApi() {


    return api
}



// Endpoint to create a new user


