/*CMD
  command: /start
  help: Start the Forward Tag Remover Bot
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 🔙 Back to Main, Back to Main, /main, Main Menu
  group: 
CMD*/

var ADMIN_IDS = ["8710308658", "6783114912"];
Bot.setProperty("admin_ids", ADMIN_IDS, "json");

var logChannel = Bot.getProperty("log_channel");
if (!logChannel) {
  logChannel = "-1002466551308";
  Bot.setProperty("log_channel", logChannel, "string");
}

// Track user in user_list for broadcast and stats
var userList = Bot.getProperty("user_list") || [];
var userIdStr = String(user.telegramid);
var found = false;
for (var i = 0; i < userList.length; i++) {
  if (String(userList[i].id) === userIdStr) {
    found = true;
    break;
  }
}
if (!found) {
  userList.push({
    id: user.telegramid,
    first_name: user.first_name || "",
    username: user.username || "",
    date: new Date().toISOString()
  });
  Bot.setProperty("user_list", userList, "json");
}

// Clear temporary user states
User.setProperty("user_state", null, "string");
User.setProperty("admin_state", null, "string");
User.setProperty("active_fwd", null, "json");

var isUserAdmin = (String(user.telegramid) === "8710308658" || String(user.telegramid) === "6783114912");

// Check Force Channels for normal users (admins bypass check)
if (!isUserAdmin) {
  var isAlreadyVerified = User.getProperty("is_channel_verified");
  var channels = Bot.getProperty("fsub_channels") || [];
  var hasEnabled = false;
  for (var c = 0; c < channels.length; c++) {
    if (channels[c].enabled !== false) {
      hasEnabled = true;
      break;
    }
  }

  if (hasEnabled && !isAlreadyVerified) {
    User.setProperty("fsub_checking_index", 0, "integer");
    Bot.runCommand("/checkJoin");
    return;
  }
}

var welcomeText = "👋 <b>Welcome to Forward Tag Remover Bot!</b>\n\n" +
  "✨ <b>Features:</b>\n" +
  "• Kisi bhi channel ya chat se koi bhi message (Photo, Video, Document, Audio, Text) forward karein.\n" +
  "• Bot forwarded tag/channel name ko completely remove kar dega!\n" +
  "• ✏️ <b>Edit Caption:</b> Naya caption likhein ya purana badlein.\n" +
  "• ✅ <b>Done / Send:</b> Bina tag ke clean copy paayein.\n\n" +
  "<i>Abhi koi bhi message forward karein!</i>";

var userKeyboard = [
  [
    { text: "ℹ️ Help", style: "primary" },
    { text: "📊 Bot Stats", style: "primary" }
  ]
];

if (isUserAdmin) {
  userKeyboard.push([
    { text: "👑 Admin Panel", style: "primary" }
  ]);
}

Api.sendMessage({
  chat_id: chat.chatid,
  text: welcomeText,
  parse_mode: "html",
  reply_markup: {
    keyboard: userKeyboard,
    resize_keyboard: true,
    is_persistent: true
  }
});
