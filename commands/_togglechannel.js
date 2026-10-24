/*CMD
  command: /togglechannel
  help: Enable or Disable a Force Join Channel
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 🔁 Enable/Disable Channel, Enable/Disable Channel, /toggle_channel
  group: 
CMD*/

var isUserAdmin = (String(user.telegramid) === "8710308658" || String(user.telegramid) === "6783114912");
if (!isUserAdmin) {
  Bot.sendMessage("⛔ <b>Access Denied: Admin only!</b>", { parse_mode: "html" });
  return;
}

var channels = Bot.getProperty("fsub_channels") || [];

if (channels.length === 0) {
  Bot.sendMessage("ℹ️ No channels configured yet to enable or disable.", { parse_mode: "html" });
  Bot.runCommand("/forcechannels");
  return;
}

User.setProperty("admin_state", "waiting_toggle_select", "string");

var text = "🔁 <b>ENABLE / DISABLE FORCE CHANNEL</b>\n\n" +
  "Select a channel below to toggle its status:\n\n";

var toggleKeyboard = [];
for (var i = 0; i < channels.length; i++) {
  var ch = channels[i];
  var isEnabled = (ch.enabled !== false);
  var icon = isEnabled ? "✅" : "🚫";
  var statusText = isEnabled ? "Enabled" : "Disabled";
  text += "<b>" + (i + 1) + ".</b> " + icon + " " + (ch.title || "Channel") + " — <i>" + statusText + "</i>\n";

  toggleKeyboard.push([
    { text: "🔁 " + (i + 1) + ". " + icon + " " + (ch.title || ch.id), style: "primary" }
  ]);
}

toggleKeyboard.push([
  { text: "🔙 Back", style: "primary" }
]);

Api.sendMessage({
  chat_id: chat.chatid,
  text: text,
  parse_mode: "html",
  reply_markup: {
    keyboard: toggleKeyboard,
    resize_keyboard: true,
    is_persistent: true
  }
});
