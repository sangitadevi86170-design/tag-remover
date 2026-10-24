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

var adminId = Bot.getProperty("admin_id") || "8710308658";
if (String(user.telegramid) !== String(adminId)) {
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
  "Select a channel to remove or send its numeric Chat ID / Index:\n\n";

var removeKeyboard = [];
for (var i = 0; i < channels.length; i++) {
  var ch = channels[i];
  var label = (i + 1) + ". " + (ch.title || ch.id);
  text += "<b>" + (i + 1) + ".</b> " + (ch.title || "Channel") + " (<code>" + ch.id + "</code>)\n";
  removeKeyboard.push([
    { text: "🗑 " + label, style: "danger" }
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
