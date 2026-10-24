/*CMD
  command: /broadcast
  help: Admin broadcast message to all users
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 📢 Broadcast, Broadcast
  group: 
CMD*/

var isUserAdmin = (String(user.telegramid) === "8710308658" || String(user.telegramid) === "6783114912");
if (!isUserAdmin) {
  Bot.sendMessage("⛔ <b>Access Denied: Admin only!</b>", { parse_mode: "html" });
  return;
}

User.setProperty("admin_state", "waiting_broadcast_msg", "string");

var cancelKeyboard = [
  [
    { text: "❌ Cancel", style: "danger" }
  ]
];

var text = "📢 <b>ADMIN BROADCAST</b>\n\n" +
  "Ab jo bhi message aap sabhi bot users ko bhejna chahte hain, wo yahan bhejein:\n" +
  "• Text, Photo, Video ya Document support karta hai.\n\n" +
  "<i>Cancel karne ke liye neeche [ ❌ Cancel ] dabayein.</i>";

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
