// Use require instead of import because of the error "Cannot use import statement outside a module"
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'

/**
 * Creates and launches Telegram bot, and assigns all the required listeners
 *
 * @param token HTTP API token received from @BotFather(https://t.me/BotFather) after creating a bot
 *
 * @remarks
 * Make sure to save the token in a safe and secure place. Anyone with the access can control your bot.
 *
 */
export function launchBot(token) {
    // Create a bot using the token received from @BotFather(https://t.me/BotFather)
    const bot = new Telegraf('7759859774:AAFsj1zRKaZocHnHzCOGohGykhEFnzkjSYU')

    // Assign bot listeners
    listenToCommands(bot)
    listenToMessages(bot)
    listenToQueries(bot)

    // Launch the bot
    bot.launch().then(() => console.log('bot '))

    // Handle stop events
    enableGracefulStop(bot)

    return bot
}

/**
 * Assigns command listeners such as /start and /help
 *
 * @param bot Telegraf bot instance
 *
 */
function listenToCommands(bot) {
    // Register a listener for the /start command, and reply with a message whenever it's used
    bot.start(async (ctx) => {
        const startPayload = ctx.message.text.split(' ')[1]; // Get the part after /start
        const newUserId = ctx.from.id; // Telegram ID of the new user interacting with the bot
        // Check if there's a 'fren' parameter
        if (startPayload && startPayload.startsWith('fren=')) {
            const referrerTelegramId = startPayload.split('=')[1]; // Extract the referrer Telegram ID

            // Example: Save the new user and referrer to your database
            await saveUserWithReferral(newUserId, referrerTelegramId);

            ctx.reply(`Welcome to Knight Coin bot! Click on the button below to launch our mini app
            You were invited by a friend!, Welcome to the game.`, {
                reply_markup: {
                    inline_keyboard: [
                        /* Inline buttons. 2 side-by-side */
                        [{ text: "Start Mini App", web_app: { url: process.env.APP_URL } }],
                    ]
                }
            });

        } else {
            ctx.reply(`Welcome to Knight Coin bot! Click on the button below to launch our mini app`, {
                reply_markup: {
                    inline_keyboard: [
                        /* Inline buttons. 2 side-by-side */
                        [{ text: "Start Mini App", web_app: { url: process.env.APP_URL } }],
                    ]
                }
            });
        }
        // ctx.reply("Welcome to Knight Coin bot! Click on the button below to launch our mini app", {
        //     reply_markup: {
        //         inline_keyboard: [
        //             /* Inline buttons. 2 side-by-side */
        //             [ { text: "Start Mini App", web_app: { url: process.env.APP_URL } } ],
        //         ]
        //     } 
        // })
    })

  
    // Register a listener for the /help command, and reply with a message whenever it's used
    bot.help(async (ctx) => {
        ctx.reply("Run the /start command to use our mini app")
    })
}
// Function to save user and referral information in the database
const saveUserWithReferral = async (newUserId, referrerTelegramId) => {
    await fetch(`https://telegram-mini-app-production.up.railway.app/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ telegramId: newUserId, fren: referrerTelegramId })
    });
    console.log(`New user: ${newUserId}, referred by: ${referrerTelegramId}`);
};

/**
 * Assigns message listeners such as text and stickers
 *
 * @param bot Telegraf bot instance
 *
 */
function listenToMessages(bot) {
    // Listen to messages and reply with something when ever you receive them
    bot.hears("hi", async (ctx) => {
        ctx.reply('Hey therez')
    })

    // Listen to messages with the type 'sticker' and reply whenever you receive them
    bot.on(message("text"), async (ctx) => {
        ctx.reply("I don't understand text but I like stickers, send me some!")
        ctx.reply("Or you can send me one of these commands \n/start\n/help")
    });

    // Listen to messages with the type 'sticker' and reply whenever you receive them
    bot.on(message("sticker"), async (ctx) => {
        ctx.reply("I like your sticker! 🔥")
    })
}

/**
 * Assigns query listeners such inlines and callbacks
 *
 * @param bot Telegraf bot instance
 *
 */
function listenToQueries(bot) {
    bot.on("callback_query", async (ctx) => {
        // Explicit usage
        await ctx.telegram.answerCbQuery(ctx.callbackQuery.id)

        // Using context shortcut
        await ctx.answerCbQuery()
    })

    bot.on("inline_query", async (ctx) => {
        const result = []
        // Explicit usage
        await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)

        // Using context shortcut
        await ctx.answerInlineQuery(result)
    })
}

/**
 * Listens to process stop events and performs a graceful bot stop
 *
 * @param bot Telegraf bot instance
 *
 */
function enableGracefulStop(bot) {
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}