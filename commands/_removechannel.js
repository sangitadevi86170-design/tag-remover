/*CMD
  command: /removechannel
  help: Remove a Force Join Channel
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 🗑 Remove Channel, Remove Channel
  group: 
CMD*/

var isUserAdmin = (String(user.telegramid) === "8710308658" || String(user.telegramid) === "6783114912");
if (!isUserAdmin) {
  Bot.sendMessage("⛔ <b>Access Denied: Admin only!</b>", { parse_mode: "html" });
  return;
}

var channels = Bot.getProperty("fsub_channels") || [];

if (channels.length === 0) {
  Bot.sendMessage("ℹ️ No channels configured to remove.", { parse_mode: "html" });
  Bot.runCommand("/forcechannels");
  return;
}

User.setProperty("admin_state", "waiting_remove_select", "string");

var text = "🗑 <b>REMOVE FORCE CHANNEL</b>\n\n" +
  "Select a channel button below to remove, or send its numeric Chat ID / number:\n\n";

var inlineButtons = [];

for (var i = 0; i < channels.length; i++) {
  var ch = channels[i];
  text += "<b>" + (i + 1) + ".</b> " + (ch.title || "Channel") + "\n" +
    "   • ID: <code>" + ch.id + "</code>\n" +
    "   • Type: " + (ch.type || "public") + "\n\n";

  inlineButtons.push([
    { text: "❌ Remove " + (i + 1) + ". " + (ch.title ? ch.title.substring(0, 15) : ch.id), callback_data: "/delchannel " + i }
  ]);
}

inlineButtons.push([
  { text: "🧹 Clean All Duplicates", callback_data: "/delchannel duplicates" }
]);

// Also provide keyboard buttons for mobile users
var removeKeyboard = [];
for (var k = 0; k < channels.length; k++) {
  removeKeyboard.push([
    { text: "Channel #" + (k + 1), style: "danger" }
  ]);
}
removeKeyboard.push([
  { text: "🧹 Clean Duplicates", style: "primary" },
  { text: "❌ Cancel", style: "danger" }
]);

// Send prompt with inline buttons directly for instant 1-tap removal
Api.sendMessage({
  chat_id: chat.chatid,
  text: text,
  parse_mode: "html",
  reply_markup: {
    inline_keyboard: inlineButtons
  }
});

// Also update reply keyboard with options
Api.sendMessage({
  chat_id: chat.chatid,
  text: "👇 <i>Or tap a button below to remove by number:</i>",
  parse_mode: "html",
  reply_markup: {
    keyboard: removeKeyboard,
    resize_keyboard: true,
    is_persistent: true
  }
});
