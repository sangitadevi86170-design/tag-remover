/*CMD
  command: /exportcsv
  help: Export bot users to CSV
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 📥 Export Users CSV, Export Users CSV, /export_users
  group: 
CMD*/

var isUserAdmin = (String(user.telegramid) === "8710308658" || String(user.telegramid) === "6783114912");
if (!isUserAdmin) {
  Bot.sendMessage("⛔ <b>Access Denied: Admin only!</b>", { parse_mode: "html" });
  return;
}

var userList = Bot.getProperty("user_list") || [];

if (userList.length === 0) {
  Bot.sendMessage("ℹ️ No users registered yet.", { parse_mode: "html" });
  return;
}

var csvContent = "Telegram ID,Username,First Name,Joined Date\n";
for (var i = 0; i < userList.length; i++) {
  var u = userList[i];
  var uId = u.id || "";
  var uName = (u.username || "").replace(/"/g, '""');
  var fName = (u.first_name || "").replace(/"/g, '""');
  var dDate = u.date || "";
  csvContent += '"' + uId + '","' + uName + '","' + fName + '","' + dDate + '"\n';
}

var text = "📥 <b>USERS CSV EXPORT</b>\n\n" +
  "Total Users: <b>" + userList.length + "</b>\n\n" +
  "```csv\n" +
  (csvContent.length > 3000 ? csvContent.substring(0, 3000) + "\n...[truncated]" : csvContent) +
  "\n```";

Api.sendMessage({
  chat_id: chat.chatid,
  text: text,
  parse_mode: "html"
});
