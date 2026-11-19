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

if (!user || !user.telegramid || !chat || !chat.chatid) return;
if (String(chat.chatid).indexOf("-") === 0) return;

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
  function deliverCleanMedia(targetChatId, appendUserInfo) {
    var finalCaption = sendCaption;
    var parseMode = undefined;

    if (appendUserInfo) {
      var uNameStr = user.username ? "@" + user.username : (user.first_name || "User");
      var logTag = "\n\n👤 <b>Forwarded by:</b> " + uNameStr + " [<code>" + user.telegramid + "</code>]";
      if (finalCaption.length + logTag.length > 1024) {
        finalCaption = finalCaption.substring(0, 1024 - logTag.length);
      }
      finalCaption = finalCaption + logTag;
      parseMode = "html";
    }

    var mParams = { chat_id: targetChatId, caption: finalCaption };
    if (parseMode) mParams.parse_mode = parseMode;

    if (active.file_type === "document") {
      mParams.document = active.file_id;
      Api.sendDocument(mParams);
    } else if (active.file_type === "video") {
      mParams.video = active.file_id;
      Api.sendVideo(mParams);
    } else if (active.file_type === "photo") {
      mParams.photo = active.file_id;
      Api.sendPhoto(mParams);
    } else if (active.file_type === "audio") {
      mParams.audio = active.file_id;
      Api.sendAudio(mParams);
    } else if (active.file_type === "voice") {
      mParams.voice = active.file_id;
      Api.sendVoice(mParams);
    } else if (active.file_type === "animation") {
      mParams.animation = active.file_id;
      Api.sendAnimation(mParams);
    } else {
      // Pure text or copyMessage fallback
      if (active.source_message_id) {
        var copyOpts = {
          chat_id: targetChatId,
          from_chat_id: active.chat_id,
          message_id: active.source_message_id
        };
        if (appendUserInfo) {
          copyOpts.caption = finalCaption;
          copyOpts.parse_mode = "html";
        }
        Api.copyMessage(copyOpts);
      } else if (finalCaption) {
        var tOpts = { chat_id: targetChatId, text: finalCaption };
        if (parseMode) tOpts.parse_mode = parseMode;
        Api.sendMessage(tOpts);
      }
    }
  }

  // 1. Deliver to User cleanly (without user tag)
  deliverCleanMedia(chat.chatid, false);

  // 2. Deliver clean response to Log Channel with user's username & ID
  var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
  if (logChannel) {
    try {
      deliverCleanMedia(logChannel, true);
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
