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
  Api.answerCallbackQuery({
    callback_query_id: request.id,
    text: "Cancelled."
  });
  Api.deleteMessage({
    chat_id: chat.chatid,
    message_id: request.message.message_id
  });
  Bot.sendMessage("❌ Action cancelled. Aap naya message forward kar sakte hain.");
  return;
}

if (data === "btn_done") {
  var active = User.getProperty("active_fwd");
  if (!active || !active.chat_id || !active.message_id) {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: "Message expired. Please forward again.",
      show_alert: true
    });
    return;
  }

  // Copy message to user without forward header
  Api.copyMessage({
    chat_id: chat.chatid,
    from_chat_id: active.chat_id,
    message_id: active.message_id
  });

  // Log to private log channel
  var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
  if (logChannel) {
    try {
      Api.copyMessage({
        chat_id: logChannel,
        from_chat_id: active.chat_id,
        message_id: active.message_id
      });
      Api.sendMessage({
        chat_id: logChannel,
        text: "📋 <b>Message Logged:</b>\n" +
          "• User: " + (user.first_name || "") + " (@" + (user.username || "None") + ")\n" +
          "• ID: <code>" + user.telegramid + "</code>\n" +
          "• Action: Clean Forward (Done)",
        parse_mode: "html"
      });
    } catch (e) {}
  }

  // Update total processed count
  var count = Bot.getProperty("total_processed") || 0;
  Bot.setProperty("total_processed", count + 1, "integer");

  // Clean state
  User.setProperty("active_fwd", null, "json");
  User.setProperty("user_state", null, "string");

  Api.answerCallbackQuery({
    callback_query_id: request.id,
    text: "✅ Forward tag removed successfully!"
  });

  Api.deleteMessage({
    chat_id: chat.chatid,
    message_id: request.message.message_id
  });
  return;
}

if (data === "btn_edit") {
  var active = User.getProperty("active_fwd");
  if (!active || !active.chat_id || !active.message_id) {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: "Message expired. Please forward again.",
      show_alert: true
    });
    return;
  }

  User.setProperty("user_state", "waiting_new_caption", "string");
  Api.answerCallbackQuery({
    callback_query_id: request.id
  });

  var cancelKb = [
    [
      { text: "❌ Cancel", style: "danger" }
    ]
  ];

  Api.sendMessage({
    chat_id: chat.chatid,
    text: "✍️ <b>Apna naya caption ya text message bhejein:</b>\n\n<i>Cancel karne ke liye neeche [ ❌ Cancel ] dabayein.</i>",
    parse_mode: "html",
    reply_markup: {
      keyboard: cancelKb,
      resize_keyboard: true,
      is_persistent: true
    }
  });
  return;
}
