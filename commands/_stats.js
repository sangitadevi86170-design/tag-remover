/*CMD
  command: /stats
  help: View live bot statistics
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 📊 Bot Stats, Bot Stats
  group: 
CMD*/

var userList = Bot.getProperty("user_list") || [];
var channels = Bot.getProperty("fsub_channels") || [];
var totalProcessed = Bot.getProperty("total_processed") || 0;

var statsText = "📊 <b>BOT LIVE STATISTICS</b>\n\n" +
  "👥 <b>Total Users:</b> " + userList.length + "\n" +
  "🔄 <b>Messages Cleaned:</b> " + totalProcessed + "\n" +
  "📢 <b>Force Channels:</b> " + channels.length + "\n\n" +
  "⚡ <i>Server Status: 100% Online & Fast</i>";

Api.sendMessage({
  chat_id: chat.chatid,
  text: statsText,
  parse_mode: "html"
});
