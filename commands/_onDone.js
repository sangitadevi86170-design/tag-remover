/*CMD
  command: /onDone
  help: Deliver clean media without forward tag (preserves clickable links and formatting)
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

function deliverCleanCopy(targetChatId) {
  // Telegram copyMessage copies the message 100% exactly as-is:
  // - Preserves all clickable hyperlinks, mentions, bold, italic, code
  // - Preserves files, folders, zip, documents, videos, photos
  // - COMPLETELY REMOVES the "Forwarded from..." header!
  if (active.source_message_id) {
    try {
      Api.copyMessage({
        chat_id: targetChatId,
        from_chat_id: active.chat_id,
        message_id: active.source_message_id
      });
      return;
    } catch (err) {}
  }

  // Smart fallback with caption_entities preservation
  var sendCaption = active.caption || "";
  var entities = active.caption_entities;

  var mediaParams = {
    chat_id: targetChatId,
    caption: sendCaption
  };
  if (entities && entities.length > 0) {
    mediaParams.caption_entities = entities;
  } else {
    mediaParams.parse_mode = "html";
  }

  if (active.file_type === "document") {
    mediaParams.document = active.file_id;
    Api.sendDocument(mediaParams);
  } else if (active.file_type === "video") {
    mediaParams.video = active.file_id;
    Api.sendVideo(mediaParams);
  } else if (active.file_type === "photo") {
    mediaParams.photo = active.file_id;
    Api.sendPhoto(mediaParams);
  } else if (active.file_type === "audio") {
    mediaParams.audio = active.file_id;
    Api.sendAudio(mediaParams);
  } else if (active.file_type === "voice") {
    mediaParams.voice = active.file_id;
    Api.sendVoice(mediaParams);
  } else if (active.file_type === "animation") {
    mediaParams.animation = active.file_id;
    Api.sendAnimation(mediaParams);
  } else if (sendCaption) {
    var textParams = { chat_id: targetChatId, text: sendCaption };
    if (entities && entities.length > 0) textParams.entities = entities;
    else textParams.parse_mode = "html";
    Api.sendMessage(textParams);
  }
}

// 1. Deliver to User
deliverCleanCopy(chat.chatid);

// 2. Deliver to Log Channel
if (logChannel) {
  try {
    deliverCleanCopy(logChannel);
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
