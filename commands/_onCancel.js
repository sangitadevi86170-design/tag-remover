/*CMD
  command: /onCancel
  help: Cancel current action
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: btn_cancel
  group: 
CMD*/

if (request && request.id) {
  try {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: "Cancelled."
    });
  } catch (e) {}
}

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({
      chat_id: chat.chatid,
      message_id: request.message.message_id
    });
  } catch (e) {}
}

User.setProperty("user_state", null, "string");
User.setProperty("active_fwd", null, "json");

Bot.sendMessage("❌ Action cancelled. Aap naya message forward kar sakte hain.");
