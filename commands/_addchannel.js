/*CMD
  command: /addchannel
  help: Step 1 - Add new force channel
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: ➕ Add Channel, Add Channel
  group: 
CMD*/

var adminId = Bot.getProperty("admin_id") || "8710308658";
if (String(user.telegramid) !== String(adminId)) {
  Bot.sendMessage("⛔ <b>Access Denied: Admin only!</b>", { parse_mode: "html" });
  return;
}

User.setProperty("admin_state", "waiting_chan_ref", "string");
User.setProperty("temp_chan_ref", null, "string");
User.setProperty("temp_chan_type", null, "string");
User.setProperty("temp_chan_title", null, "string");

var cancelKeyboard = [
  [
    { text: "❌ Cancel", style: "danger" }
  ]
];

var text = "➕ <b>ADD FORCE JOIN CHANNEL (Step 1 of 3)</b>\n\n" +
  "Please send the <b>Channel Reference</b>:\n\n" +
  "You can send any of the following:\n" +
  "• <b>Forward any message</b> directly from the channel\n" +
  "• Public username (e.g. <code>@MyChannel</code>)\n" +
  "• Numeric Chat ID (e.g. <code>-1002466551308</code>)\n\n" +
  "<i>Make sure your Bot is already added as an <b>ADMINISTRATOR</b> in that channel!</i>";

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
