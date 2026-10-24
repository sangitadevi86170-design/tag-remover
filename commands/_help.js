/*CMD
  command: /help
  help: How to use the bot
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: ℹ️ Help, Help
  group: 
CMD*/

var helpText = "📖 <b>HOW TO USE TAG REMOVER BOT:</b>\n\n" +
  "1️⃣ <b>Forward Message:</b>\n" +
  "Kisi bhi public ya private channel se koi bhi post (photo, video, file, text) yahan forward karein.\n\n" +
  "2️⃣ <b>Choose Action:</b>\n" +
  "• <b>✏️ Edit Caption:</b> Naya caption likhne ke liye button dabayein aur apna naya text bhejein.\n" +
  "• <b>✅ Done / Send:</b> Message original caption ke sath bina forward tag ke mil jayega.\n\n" +
  "3️⃣ <b>Forward Tag Removed:</b>\n" +
  "Aapko clean message mil jayega jise aap aage share ya apne channel me dal sakte hain!";

Api.sendMessage({
  chat_id: chat.chatid,
  text: helpText,
  parse_mode: "html"
});
