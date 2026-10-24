/*CMD
  command: /onDone
  help: Deliver clean media without forward tag
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: btn_done
  group: 
CMD*/

if (request && request.id) {
  try {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: "✅ Forward tag removed successfully!"
    });
  } catch (e) {}
}

var active = User.getProperty("active_fwd");
if (!active) {
  Bot.sendMessage("⚠️ Message expired. Please forward again.");
  return;
}

var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
var sendCaption = active.caption || "";

function sendClean(targetChatId) {
  if (active.file_type === "document") {
    Api.sendDocument({
      chat_id: targetChatId,
      document: active.file_id,
      caption: sendCaption
    });
  } else if (active.file_type === "video") {
    Api.sendVideo({
      chat_id: targetChatId,
      video: active.file_id,
      caption: sendCaption
    });
  } else if (active.file_type === "photo") {
    Api.sendPhoto({
      chat_id: targetChatId,
      photo: active.file_id,
      caption: sendCaption
    });
  } else if (active.file_type === "audio") {
    Api.sendAudio({
      chat_id: targetChatId,
      audio: active.file_id,
      caption: sendCaption
    });
  } else if (active.file_type === "voice") {
    Api.sendVoice({
      chat_id: targetChatId,
      voice: active.file_id,
      caption: sendCaption
    });
  } else if (active.file_type === "animation") {
    Api.sendAnimation({
      chat_id: targetChatId,
      animation: active.file_id,
      caption: sendCaption
    });
  } else {
    if (active.source_message_id) {
      Api.copyMessage({
        chat_id: targetChatId,
        from_chat_id: active.chat_id,
        message_id: active.source_message_id
      });
    } else if (sendCaption) {
      Api.sendMessage({ chat_id: targetChatId, text: sendCaption });
    }
  }
}

// 1. Deliver Clean File to User
sendClean(chat.chatid);

// 2. Deliver to Log Channel
if (logChannel) {
  try {
    sendClean(logChannel);
    Api.sendMessage({
      chat_id: logChannel,
      text: "📋 <b>Message Logged:</b>\n" +
        "• User: " + (user.first_name || "") + " (@" + (user.username || "None") + ")\n" +
        "• ID: <code>" + user.telegramid + "</code>\n" +
        "• Action: Clean Forward (Done)\n" +
        "• File: " + (active.file_name || active.file_type),
      parse_mode: "html"
    });
  } catch (err) {}
}

// Increment total processed counter
var count = Bot.getProperty("total_processed") || 0;
Bot.setProperty("total_processed", count + 1, "integer");

// Clear active state
User.setProperty("active_fwd", null, "json");
User.setProperty("user_state", null, "string");

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({
      chat_id: chat.chatid,
      message_id: request.message.message_id
    });
  } catch (e) {}
}
