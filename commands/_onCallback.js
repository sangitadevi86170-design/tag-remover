/*CMD
  command: /onCallback
  help: Handle Inline Keyboard Callbacks for Tag Remover
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var data = null;
if (typeof request !== "undefined" && request && request.data) {
  data = request.data;
} else if (typeof params !== "undefined" && params) {
  data = params;
}

if (!data) return;

if (data === "btn_cancel") {
  User.setProperty("user_state", null, "string");
  User.setProperty("active_fwd", null, "json");
  try {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: "Cancelled."
    });
    Api.deleteMessage({
      chat_id: chat.chatid,
      message_id: request.message.message_id
    });
  } catch (e) {}
  Bot.sendMessage("❌ Action cancelled. Aap naya message forward kar sakte hain.");
  return;
}

if (data === "btn_done") {
  var active = User.getProperty("active_fwd");
  if (!active) {
    try {
      Api.answerCallbackQuery({
        callback_query_id: request.id,
        text: "Message expired. Please forward again.",
        show_alert: true
      });
    } catch (e) {}
    return;
  }

  var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
  var sendCaption = active.caption || "";

  // Helper function to send media cleanly by file_id without ANY forward header
  function deliverCleanMedia(targetChatId) {
    if (active.file_type === "document") {
      Api.sendDocument({ chat_id: targetChatId, document: active.file_id, caption: sendCaption });
    } else if (active.file_type === "video") {
      Api.sendVideo({ chat_id: targetChatId, video: active.file_id, caption: sendCaption });
    } else if (active.file_type === "photo") {
      Api.sendPhoto({ chat_id: targetChatId, photo: active.file_id, caption: sendCaption });
    } else if (active.file_type === "audio") {
      Api.sendAudio({ chat_id: targetChatId, audio: active.file_id, caption: sendCaption });
    } else if (active.file_type === "voice") {
      Api.sendVoice({ chat_id: targetChatId, voice: active.file_id, caption: sendCaption });
    } else if (active.file_type === "animation") {
      Api.sendAnimation({ chat_id: targetChatId, animation: active.file_id, caption: sendCaption });
    } else {
      // Pure text or copyMessage fallback
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

  // 1. Deliver to User cleanly
  deliverCleanMedia(chat.chatid);

  // 2. Deliver to Log Channel
  if (logChannel) {
    try {
      deliverCleanMedia(logChannel);
      Api.sendMessage({
        chat_id: logChannel,
        text: "📋 <b>Message Logged:</b>\n" +
          "• User: " + (user.first_name || "") + " (@" + (user.username || "None") + ")\n" +
          "• ID: <code>" + user.telegramid + "</code>\n" +
          "• Action: Clean Forward (Done)\n" +
          "• File Type: " + (active.file_type || "text"),
        parse_mode: "html"
      });
    } catch (err) {}
  }

  // Update total processed count
  var count = Bot.getProperty("total_processed") || 0;
  Bot.setProperty("total_processed", count + 1, "integer");

  // Clean state
  User.setProperty("active_fwd", null, "json");
  User.setProperty("user_state", null, "string");

  try {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: "✅ Forward tag removed successfully!"
    });
    Api.deleteMessage({
      chat_id: chat.chatid,
      message_id: request.message.message_id
    });
  } catch (e) {}
  return;
}

if (data === "btn_edit") {
  var active = User.getProperty("active_fwd");
  if (!active) {
    try {
      Api.answerCallbackQuery({
        callback_query_id: request.id,
        text: "Message expired. Please forward again.",
        show_alert: true
      });
    } catch (e) {}
    return;
  }

  User.setProperty("user_state", "waiting_new_caption", "string");
  try {
    Api.answerCallbackQuery({ callback_query_id: request.id });
  } catch (e) {}

  var cancelKb = [
    [
      { text: "❌ Cancel", style: "danger" }
    ]
  ];

  Api.sendMessage({
    chat_id: chat.chatid,
    text: "✍️ <b>Apna naya caption ya text message bhejein:</b>\n\n" +
      "<i>(Aap jo bhi naya text likhenge, wo is file/media par lag kar bina kisi tag ke bhej diya jayega)</i>\n\n" +
      "<i>Cancel karne ke liye neeche [ ❌ Cancel ] dabayein.</i>",
    parse_mode: "html",
    reply_markup: {
      keyboard: cancelKb,
      resize_keyboard: true,
      is_persistent: true
    }
  });
  return;
}
