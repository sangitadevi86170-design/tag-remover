/*CMD
  command: /admin
  help: Open Admin Control Panel
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 👑 Admin Panel, Admin Panel, 🔙 Back to Admin, Back to Admin, /panel
  group: 
CMD*/

var isUserAdmin = (String(user.telegramid) === "8710308658" || String(user.telegramid) === "6783114912");

if (!isUserAdmin) {
  Bot.sendMessage(
    "⛔ <b>Access Denied:</b> This area is reserved for the bot administrator only.",
    { parse_mode: "html" }
  );
  return;
}

// Reset admin state
User.setProperty("admin_state", null, "string");

var userList = Bot.getProperty("user_list") || [];
var channels = Bot.getProperty("fsub_channels") || [];
var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
var totalProcessed = Bot.getProperty("total_processed") || 0;

var enabledChannelsCount = 0;
for (var i = 0; i < channels.length; i++) {
  if (channels[i].enabled !== false) enabledChannelsCount++;
}

var adminText = "👑 <b>ADMINISTRATOR CONTROL PANEL</b>\n\n" +
  "📊 <b>Bot Overview & Stats:</b>\n" +
  "• <b>Admin ID:</b> <code>" + adminId + "</code>\n" +
  "• <b>Total Users:</b> " + userList.length + "\n" +
  "• <b>Messages Processed:</b> " + totalProcessed + "\n" +
  "• <b>Force Channels:</b> " + channels.length + " (" + enabledChannelsCount + " Enabled)\n" +
  "• <b>Log Channel ID:</b> <code>" + logChannel + "</code>\n\n" +
  "👇 <i>Select an action from the admin menu below:</i>";

var adminReplyKeyboard = [
  [
    { text: "📢 Force Channels", style: "primary" },
    { text: "📢 Broadcast", style: "primary" }
  ],
  [
    { text: "📥 Export Users CSV", style: "primary" },
    { text: "⚙️ Set Log Channel", style: "primary" }
  ],
  [
    { text: "🔙 Back to Main", style: "danger" }
  ]
];

Api.sendMessage({
  chat_id: chat.chatid,
  text: adminText,
  parse_mode: "html",
  reply_markup: {
    keyboard: adminReplyKeyboard,
    resize_keyboard: true,
    is_persistent: true
  }
});
