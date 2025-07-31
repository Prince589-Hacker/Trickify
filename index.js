const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const fs = require('fs');

// 🔐 Initialize Firebase Admin
const serviceAccount = require('trickify-bot-firebase-adminsdk-fbsvc-156f464d11.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://trickify-bot-default-rtdb.firebaseio.com"
});

const db = admin.database();

const token = '8022160372:AAFVGi76CKEDWuWPd21E6cJvBspxSlSXbVQ';
const bot = new TelegramBot(token, { polling: true });

// /start command to register user
bot.onText(/\/start/, async (msg) => {
  const id = msg.from.id;
  const name = msg.from.first_name;

  const userRef = db.ref("Users/" + id);
  const snapshot = await userRef.once("value");

  if (!snapshot.exists()) {
    await userRef.set({
      Balance: 0
    });
  }

  bot.sendMessage(msg.chat.id, `👋 Hi, ${name}! How are you?\n\nPlease choose below to continue.`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💰 Your Balance', callback_data: 'check_balance' }],
        [{ text: '🔋 Recharge', callback_data: 'recharge' }],
        [{ text: '💳 Buy CCs', callback_data: 'buy_cc' }]
      ]
    }
  });
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const id = query.from.id;
  const data = query.data;

  const userRef = db.ref("Users/" + id);
  const snapshot = await userRef.once("value");

  bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
    chat_id: chatId,
    message_id: query.message.message_id
  }).catch(() => { });

  if (!snapshot.exists()) {
    bot.sendMessage(chatId, `❌ User not found. Please use /start`);
    return bot.answerCallbackQuery(query.id);
  }

  const balance = snapshot.val().Balance;

  if (data === 'check_balance') {
    bot.sendMessage(chatId, `💰 Your balance is ₹${balance}`, {

      reply_markup: {
        inline_keyboard: [
          [{ text: '🔋 Recharge', callback_data: 'recharge' }],
          [{ text: '💳 Buy CCs', callback_data: 'buy_cc' }]
        ]
      }
    });

  } else if (data === 'recharge') {
    bot.sendPhoto(chatId, 'phonpe_qr.jpg', {
      caption: '📷 Scan this Paytm QR to make payment.\n\nIf completed check below 👇👇',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💵 Check Transaction', callback_data: 'check_transaction' }]
        ]
      }
    });

  } else if (data === 'buy_cc') {
    bot.sendMessage(chatId, `💳 Buy CCs!\n\n👉 Please choose below...`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💳 1 CC - ₹30', callback_data: 'cc1' }],
          [{ text: '💳 3 CCs - ₹70', callback_data: 'cc3' }],
          [{ text: '💳 5 CCs - ₹100', callback_data: 'cc5' }],
          [{ text: '💳 10 CCs - ₹200', callback_data: 'cc10' }]
        ]
      }
    });
  } else if (data === 'cc1') {

    if (balance >= 30) {
      const newBalance = balance - 30;
      await db.ref(`Users/${chatId}`).update({ Balance: newBalance });
      bot.sendMessage(chatId, '💰 CC : 2673\nCVV : 243 ');
    } else {
      bot.sendMessage(chatId, `❌ Not Enough Balance!\n\nRequired ₹30 | Balance ₹${balance}`, {

        reply_markup: {
          inline_keyboard: [
            [{ text: '🔋 Recharge', callback_data: 'recharge' }]
          ]
        }
      });
    }
  } else if (data === 'cc3') {

    if (balance >= 70) {
      const newBalance = balance - 70;
      await db.ref(`Users/${chatId}`).update({ Balance: newBalance });
      bot.sendMessage(chatId, '💰 CC : 2673\nCVV : 243 ');
    } else {
      bot.sendMessage(chatId, `❌ Not Enough Balance!\n\nRequired ₹70 | Balance ₹${balance}`, {

        reply_markup: {
          inline_keyboard: [
            [{ text: '🔋 Recharge', callback_data: 'recharge' }]
          ]
        }
      });
    }
  } else if (data === 'cc5') {

    if (balance >= 100) {
      const newBalance = balance - 100;
      await db.ref(`Users/${chatId}`).update({ Balance: newBalance });
      bot.sendMessage(chatId, '💰 CC : 2673\nCVV : 243 ');
    } else {
      bot.sendMessage(chatId, `❌ Not Enough Balance!\n\nRequired ₹100 | Balance ₹${balance}`, {

        reply_markup: {
          inline_keyboard: [
            [{ text: '🔋 Recharge', callback_data: 'recharge' }]
          ]
        }
      });
    }
  } else if (data === 'cc10') {

    if (balance >= 200) {
      const newBalance = balance - 200;
      await db.ref(`Users/${chatId}`).update({ Balance: newBalance });
      bot.sendMessage(chatId, '💰 CC : 2673\nCVV : 243 ');
    } else {
      bot.sendMessage(chatId, `❌ Not Enough Balance!\n\nRequired ₹200 | Balance ₹${balance}`, {

        reply_markup: {
          inline_keyboard: [
            [{ text: '🔋 Recharge', callback_data: 'recharge' }]
          ]
        }
      });
    }
  } else if (data == 'check_transaction') {

    bot.sendMessage(chatId, `❌ Transaction is not completed!\n\nPlease pay first then check again or try again later!`, {

      reply_markup: {
        inline_keyboard: [
          [{ text: '💵 Check Transaction', callback_data: 'check_transaction' }],
          [{ text: '🏚️ Main Menu', callback_data: 'main_menu' }]
        ]
      }
    });

  } else if (data == 'main_menu') {

    bot.sendMessage(chatId, `\nPlease choose below to continue.`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💰 Your Balance', callback_data: 'check_balance' }],
        [{ text: '🔋 Recharge', callback_data: 'recharge' }],
        [{ text: '💳 Buy CCs', callback_data: 'buy_cc' }]
      ]
    }
  });

  }

  bot.answerCallbackQuery(query.id);
});
