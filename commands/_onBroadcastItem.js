/*CMD
  command: /onBroadcastItem
  help: Internal execution of broadcast per user
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!options) return;

var targetChatId = chat.chatid;
var fromChatId = options.from_chat_id;
var msgId = options.message_id;

if (fromChatId && msgId) {
  Api.copyMessage({
    chat_id: targetChatId,
    from_chat_id: fromChatId,
    message_id: msgId
  });
}
