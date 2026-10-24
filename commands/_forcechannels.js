/*CMD
  command: /forcechannels
  help: Admin Force Channels Management
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 📢 Force Channels, Force Channels, /fsubchannels, 🔙 Back, Back
  group: 
CMD*/

var adminId = Bot.getProperty("admin_id") || "8710308658";
if (String(user.telegramid) !== String(adminId)) {
  Bot.sendMessage("⛔ <b>Access Denied: Admin only!</b>", { parse_mode: "html" });
  return;
}

User.setProperty("admin_state", null, "string");
User.setProperty("temp_chan_ref", null, "string");
User.setProperty("temp_chan_type", null, "string");
User.setProperty("temp_chan_title", null, "string");

var channels = Bot.getProperty("fsub_channels") || [];
var enabledCount = 0;
for (var i = 0; i < channels.length; i++) {
  if (channels[i].enabled !== false) enabledCount++;
}

var text = "📢 <b>FORCE CHANNELS MANAGEMENT</b>\n\n" +
  "Total Configured Channels: <b>" + channels.length + "</b>\n" +
  "Active / Enabled Channels: <b>" + enabledCount + "</b>\n\n" +
  "👇 <i>Select an action using the buttons below:</i>";

// 2x2 Grid with Primary on one side and Danger on the other side
var fsubReplyKeyboard = [
  [
    { text: "➕ Add Channel", style: "primary" },
    { text: "🗑 Remove Channel", style: "danger" }
  ],
  [
    { text: "📋 List Channels", style: "primary" },
    { text: "🔁 Enable/Disable Channel", style: "danger" }
  ],
  [
    { text: "🔙 Back to Admin", style: "primary" }
  ]
];

Api.sendMessage({
  chat_id: chat.chatid,
  text: text,
  parse_mode: "html",
  reply_markup: {
    keyboard: fsubReplyKeyboard,
    resize_keyboard: true,
    is_persistent: true
  }
});
