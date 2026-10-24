/*CMD
  command: /setlogchannel
  help: Configure admin log channel
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: ⚙️ Set Log Channel, Set Log Channel
  group: 
CMD*/

var adminId = Bot.getProperty("admin_id") || "8710308658";
if (String(user.telegramid) !== String(adminId)) {
  Bot.sendMessage("⛔ <b>Access Denied: Admin only!</b>", { parse_mode: "html" });
  return;
}

User.setProperty("admin_state", "waiting_log_channel", "string");

var currentLog = Bot.getProperty("log_channel") || "-1002466551308";

var cancelKeyboard = [
  [
    { text: "❌ Cancel", style: "danger" }
  ]
];

var text = "⚙️ <b>CONFIGURE LOG CHANNEL</b>\n\n" +
  "Current Log Channel: <code>" + currentLog + "</code>\n\n" +
  "Please send the new Channel Chat ID (e.g. <code>-1002466551308</code>):\n" +
  "<i>Make sure the bot is an <b>ADMINISTRATOR</b> in that channel so it can send logs!</i>";

Api.sendMessage({
  chat_id: chat.chatid,
  text: text,
  parse_mode: "html",
  reply_markup: {
    keyboard: cancelKeyboard,
    resize_keyboard: true,
    is_persistent: true
  }
});
