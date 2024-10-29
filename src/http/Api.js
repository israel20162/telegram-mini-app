import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js'
import { prisma } from './prisma.mjs';
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
function toObject(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    ));
}
api.post('/user', async (req, res) => {
    const { telegramId, fren, username } = req.body;

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

        let referrer


        // If a 'fren' (referral) is provided, find the referrer

        if (fren) {
            referrer = await prisma.user.findUnique({
                where: { telegramId: fren }
            });

            if (!referrer) {
                res.status(400).json({ error: 'Invalid referral code.' });
            }
            // Create a new user
            const newUser = await prisma.user.create({
                data: {
                    telegramId,
                    referredBy: referrer ? referrer.telegramId : null, // Associate referrer if present
                    points: 0,
                    username: username
                }
            });
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


            res.status(200).json({ message: 'User created successfully', user: toObject(newUser) });

        } else {
            const newUser = await prisma.user.create({
                data: {
                    telegramId,
                    referredBy: referrer ? referrer.telegramId : null, // Associate referrer if present
                    points: 0,
                    username: username
                }
            });

            res.status(200).json({ message: 'User created successfully', user: toObject(newUser) });
        }




        //res.status(200).json({ message: 'User created successfully', user: toObject(newUser) });
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

api.get('/get-friends/:telegramId', async (req, res) => {
    const { telegramId } = req.params;
    try {
        // Find all users who were referred by the current user
        const friends = await prisma.user.findMany({
            where: {
                referredBy: telegramId // Filter based on the 'referredBy' field
            },
            select: {
                // telegramId: true, // You can customize which fields to select
                username: true,
                points: true,
                profitPerHour: true
            }
        });

        res.status(200).json(toObject(friends));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
})

api.get('/get-card/all', async (req, res) => {
    try {
        const cards = await prisma.card.findMany()
        res.status(200).json(toObject(cards));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
})

api.get('/get-unlocked-cards/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const unlockedCards = await prisma.userCard.findMany({
            where: { userId },
            select: {
                cardId: true,
                upgradeLevel: true,
            },
        });
        res.status(200).json(unlockedCards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch unlocked cards' });
    }
});

api.get('/get-card/:userId/:cardId', async (req, res) => {
    const { userId, cardId } = req.params
    try {
        // Find the user card entry
        const userCard = await prisma.userCard.findUnique({
            where: {
                userId_cardId: {
                    userId,
                    cardId,
                },
            },
            select: {
                upgradeLevel: true,
            },
        });

        if (!userCard) {
            // Card not found, meaning the user hasn't unlocked it
            res.status(201).send({ unlocked: false })
        }

        // Card is unlocked, return the level
        res.status(201).send({ unlocked: true, level: userCard.upgradeLevel })
    } catch (error) {
        console.error('Error fetching user card level:', error);
        res.status(500).send('Failed to fetch user card level')

    }
}
)

// Unlock a card for the user
app.post('/unlock-card', async (req, res) => {

    const { cardId, userId } = req.body;

    try {
        // Check if the card is already unlocked
        const existingCard = await prisma.userCard.findUnique({
            where: { userId_cardId: { userId, cardId } },
        });

        if (existingCard) {
            return res.status(400).json({ message: 'Card already unlocked' });
        }

        // Unlock the card with an initial level of 1
        const unlockedCard = await prisma.userCard.create({
            data: {
                userId,
                cardId,
                upgradeLevel: 1,
            },
        });

        res.status(201).json(unlockedCard);
    } catch (error) {
        console.error('Error unlocking card:', error);
        res.status(500).json({ error: 'Failed to unlock card' });
    }
});

// Upgrade a user's card
app.post('/user/:userId/upgrade-card', async (req, res) => {
    const { userId } = req.params;
    const { cardId, cost } = req.body;

    try {
        // Check if the card is unlocked
        const userCard = await prisma.userCard.findUnique({
            where: { userId_cardId: { userId, cardId } },
        });

        if (!userCard) {
            return res.status(400).json({ message: 'Card not unlocked' });
        }

        // Ensure user has enough points (assuming `user.points` exists)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true },
        });

        if (!user || user.points < cost) {
            return res.status(400).json({ message: 'Insufficient points' });
        }

        // Deduct points and upgrade card level
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                points: { decrement: cost },
            },
        });

        const upgradedCard = await prisma.userCard.update({
            where: { userId_cardId: { userId, cardId } },
            data: {
                upgradeLevel: { increment: 1 },
            },
        });

        res.status(201).json({ updatedUser, upgradedCard });
    } catch (error) {
        console.error('Error upgrading card:', error);
        res.status(500).json({ error: 'Failed to upgrade card' });
    }
});

// Listen to server start on port
api.listen(PORT, () => console.log(`express is up on port ${PORT}`))



export function launchApi() {


    return api
}



// Endpoint to create a new user


