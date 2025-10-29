const TelegramBot = require("node-telegram-bot-api");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get, child } = require("firebase/database"); // Added get & child

const token = "8226829755:AAGQB5lm9dJlytBNj2joTxfQ6NJ9-mEDyeo"; // 🔒 Replace this
const bot = new TelegramBot(token, { polling: true });

// Required channels to join
const requiredChannels = ["mavysupport"]; // 🟢 Edit with your real channel usernames

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAOpKDNkXdh94Ofa3T0NKDOGc3xvsHxvKo",
  authDomain: "trickify-bot.firebaseapp.com",
  databaseURL: "https://trickify-bot-default-rtdb.firebaseio.com",
  projectId: "trickify-bot",
  storageBucket: "trickify-bot.firebasestorage.app",
  messagingSenderId: "437928454855",
  appId: "1:437928454855:web:81ac0d2d40b8baab32ece2",
  measurementId: "G-WQTEPSY9LM"
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🟢 /start command (with optional referral)
bot.onText(/\/start(?:=id=(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const name = msg.from.first_name || "friend";
  const referralId = match[1];

  // Check whether the user joined all required channels
  const notJoined = [];

  for (const channel of requiredChannels) {
    try {
      const member = await bot.getChatMember(`@${channel}`, userId);
      if (
        member.status !== "member" &&
        member.status !== "administrator" &&
        member.status !== "creator"
      ) {
        notJoined.push(channel);
      }
    } catch (err) {
      console.error(`Error checking ${channel}:`, err.message);
      notJoined.push(channel);
    }
  }

  // ✅ If joined all
  if (notJoined.length === 0) {

    if (referralId){

    await bot.sendMessage(
          chatId,
          `Please wait while processing your request!`
        );

    const dbRef = ref(db); // use initialized db
    try {
      const snapshot = await get(child(dbRef, `${referralId}`));
      if (snapshot.exists()) {
        const link = snapshot.val();
        const txt = `
👋 Enjoy ${name}! Here is your link :

🔗 ${link}
        `;
        await bot.sendMessage(chatId, txt);
      } else {
        await bot.sendMessage(
          chatId,
          `⚠️ No data found for ID ${referralId}. Looks like Invalid ID or Removed!`
        );
      }
    } catch (err) {
      console.error(err);
      await bot.sendMessage(chatId, "⚠️ Error accessing the database.");
    }

  } else {

    const welcomeText = `
    👋 Welcome ${name}!
You are verified user! You can access features of this bot!

Choose an option below 👇
      `;

      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📢 Join Channel", url: "https://t.me/mavysupport" }],
            [
              { text: "ℹ️ About", callback_data: "about" },
              { text: "❓ Help", callback_data: "help" },
            ],
            [{ text: "📞 Contact Us", callback_data: "contact" }],
          ],
        },
        parse_mode: "Markdown",
      };

      await bot.sendMessage(chatId, welcomeText, options);
    }

  } else {
    // ❌ If not joined all
    const joinButtons = notJoined.map((ch) => [
      { text: `Join ${ch}`, url: `https://t.me/${ch}` },
    ]);

    // Add a refresh button to recheck without typing /start again
    joinButtons.push([{ text: "✅ I Joined All", callback_data: "recheck" }]);

    await bot.sendMessage(
      chatId,
      `⚠️ You must join *all required channels* before continuing.\n\nPlease join the channels below and then tap *"✅ I Joined All"* to verify.`,
      {
        reply_markup: { inline_keyboard: joinButtons },
        parse_mode: "Markdown",
      }
    );
  }
});

// 🔹 Handle button clicks
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  switch (query.data) {
    case "help":
      bot.sendMessage(
        chatId,
        `
🛠 Help Menu  
Use this bot to stay connected with our updates and get quick info.

Commands:
* /start — Restart the bot  
* /help — Show this help message
        `,
        { parse_mode: "Markdown" }
      );
      break;

    case "about":
      bot.sendMessage(
        chatId,
        `
ℹ️ About Us  
We share the latest tech updates, tutorials, and useful tools.  
Join our community and never miss any update!
        `,
        { parse_mode: "Markdown" }
      );
      break;

    case "contact":
      bot.sendMessage(
        chatId,
        `
📞 Contact Us  
If you have any questions, feel free to message our admin:  
👉 [@yourusername](https://t.me/yourusername)
        `,
        { parse_mode: "Markdown" }
      );
      break;

    case "recheck":
      // 🔁 Recheck channel memberships
      const notJoined = [];

      for (const channel of requiredChannels) {
        try {
          const member = await bot.getChatMember(`@${channel}`, userId);
          if (
            member.status !== "member" &&
            member.status !== "administrator" &&
            member.status !== "creator"
          ) {
            notJoined.push(channel);
          }
        } catch {
          notJoined.push(channel);
        }
      }

      if (notJoined.length === 0) {
        const welcomeText = `
🎉 Great! You’ve joined all channels successfully.
Choose an option below 👇
`;

        const options = {
          reply_markup: {
            inline_keyboard: [
              [{ text: "📢 Join Channel", url: "https://t.me/mavysupport" }],
              [
                { text: "ℹ️ About", callback_data: "about" },
                { text: "❓ Help", callback_data: "help" },
              ],
              [{ text: "📞 Contact Us", callback_data: "contact" }],
            ],
          },
          parse_mode: "Markdown",
        };

        await bot.sendMessage(chatId, welcomeText, options);
      } else {
        const joinButtons = notJoined.map((ch) => [
          { text: `Join ${ch}`, url: `https://t.me/${ch}` },
        ]);
        joinButtons.push([{ text: "✅ I Joined All", callback_data: "recheck" }]);

        await bot.sendMessage(
          chatId,
          `❌ Still missing some channels to join. Please join all of them and tap *"✅ I Joined All"* again.`,
          {
            reply_markup: { inline_keyboard: joinButtons },
            parse_mode: "Markdown",
          }
        );
      }

      break;
  }

  bot.answerCallbackQuery(query.id);
});

console.log("🤖 Bot is running...");
