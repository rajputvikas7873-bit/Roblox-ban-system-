const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// ------------------------------
// TELEGRAM SETTINGS (YOUR DETAILS)
// ------------------------------
const BOT_TOKEN = "8516360209:AAHixZSpWCsl8HMyTayVHvinBa7pNS1dR68";
const CHAT_ID = "7704430523";

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
const TELEGRAM_CB_API = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;

// Ban list stored in memory
let banList = {};

// --------------------------------
// Roblox → Render (Player joined)
// --------------------------------
app.post("/notify", async (req, res) => {
    const player = req.body.user;

    try {
        await axios.post(TELEGRAM_API, {
            chat_id: CHAT_ID,
            text: `👤 Player Joined: ${player}`,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🚫 Ban", callback_data: `ban_${player}` },
                        { text: "✔️ Unban", callback_data: `unban_${player}` }
                    ]
                ]
            }
        });

        res.json({ ok: true });
    } catch (err) {
        res.json({ ok: false, error: err.message });
    }
});

// --------------------------------
// Telegram → Ban / Unban buttons
// --------------------------------
app.post("/callback", async (req, res) => {
    const data = req.body;

    if (!data.callback_query) return res.sendStatus(200);

    const cb = data.callback_query;
    const action = cb.data; // e.g. "ban_Player"

    const split = action.split("_");
    const mode = split[0];      // ban / unban
    const username = split[1];  // Player name

    if (mode === "ban") {
        banList[username] = true;
    } 
    else if (mode === "unban") {
        delete banList[username];
    }

    await axios.post(TELEGRAM_CB_API, {
        callback_query_id: cb.id,
        text: `✔️ ${username} ${mode}ned successfully`
    });

    res.sendStatus(200);
});

// --------------------------------
// Roblox fetches ban list
// --------------------------------
app.get("/banlist", (req, res) => {
    res.json(banList);
});

// Server home
app.get("/", (req, res) => {
    res.send("Roblox Ban System Running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started on port " + PORT));