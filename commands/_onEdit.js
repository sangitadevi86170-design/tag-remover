/*CMD
  command: /onEdit
  help: Prompt user for new caption
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: btn_edit
  group: 
CMD*/

if (request && request.id) {
  try {
    Api.answerCallbackQuery({
      callback_query_id: request.id
    });
  } catch (e) {}
}

var active = User.getProperty("active_fwd");
if (!active) {
  Bot.sendMessage("⚠️ Message expired. Please forward again.");
  return;
}

User.setProperty("user_state", "waiting_new_caption", "string");

var cancelKb = [
  [
    { text: "❌ Cancel", style: "danger" }
  ]
];

var currText = active.caption || "No caption";
if (currText.length > 80) currText = currText.substring(0, 77) + "...";

Api.sendMessage({
  chat_id: chat.chatid,
  text: "✍️ <b>EDIT CAPTION</b>\n\n" +
    "• <b>Original Caption:</b> <code>" + currText + "</code>\n\n" +
    "Ab apna <b>Naya Caption</b> likh kar bhejein:\n" +
    "<i>File wahi rahegi, sirf text naya ho jayega bina kisi forward tag ke!</i>\n\n" +
    "<i>Cancel karne ke liye neeche [ ❌ Cancel ] dabayein.</i>",
  parse_mode: "html",
  reply_markup: {
    keyboard: cancelKb,
    resize_keyboard: true,
    is_persistent: true
  }
});
