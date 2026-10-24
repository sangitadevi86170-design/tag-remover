/*CMD
  command: /listchannels
  help: Show all configured Force Channels
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 📋 List Channels, List Channels
  group: 
CMD*/

var isUserAdmin = (String(user.telegramid) === "8710308658" || String(user.telegramid) === "6783114912");
if (!isUserAdmin) {
  Bot.sendMessage("⛔ <b>Access Denied: Admin only!</b>", { parse_mode: "html" });
  return;
}

var channels = Bot.getProperty("fsub_channels") || [];

var text = "📋 <b>FORCE CHANNELS</b>\n\n";

if (channels.length === 0) {
  text += "<i>No channels configured yet. Users can use the bot directly without force join.</i>\n\n";
} else {
  for (var i = 0; i < channels.length; i++) {
    var ch = channels[i];
    var statusIcon = (ch.enabled !== false) ? "✅" : "🚫";
    var typeLabel = "Public";
    if (ch.type === "private") typeLabel = "Private";
    if (ch.type === "request") typeLabel = "Join Request";

    text += statusIcon + " <b>" + (ch.title || "Channel") + "</b>\n" +
      "Type: " + typeLabel + "\n" +
      "ID: <code>" + ch.id + "</code>\n" +
      "Link: " + ch.link + "\n\n";
  }
}

text += "<i>Tap [ 🔙 Back ] to return to Force Channels menu.</i>";

var listKeyboard = [
  [
    { text: "➕ Add Channel", style: "success" },
    { text: "🔁 Enable/Disable Channel", style: "primary" }
  ],
  [
    { text: "🗑 Remove Channel", style: "danger" },
    { text: "🔙 Back", style: "primary" }
  ]
];

Api.sendMessage({
  chat_id: chat.chatid,
  text: text,
  parse_mode: "html",
  reply_markup: {
    keyboard: listKeyboard,
    resize_keyboard: true,
    is_persistent: true
  }
});
