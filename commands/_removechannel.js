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

var removeKeyboard = [];
for (var i = 0; i < channels.length; i++) {
  var ch = channels[i];
  text += "<b>" + (i + 1) + ".</b> " + (ch.title || "Channel") + "\n" +
    "   • ID: <code>" + ch.id + "</code>\n" +
    "   • Type: " + (ch.type || "public") + "\n\n";

  removeKeyboard.push([
    { text: "Channel #" + (i + 1), style: "danger" }
  ]);
}

removeKeyboard.push([
  { text: "❌ Cancel", style: "danger" }
]);

Api.sendMessage({
  chat_id: chat.chatid,
  text: text,
  parse_mode: "html",
  reply_markup: {
    keyboard: removeKeyboard,
    resize_keyboard: true,
    is_persistent: true
  }
});
