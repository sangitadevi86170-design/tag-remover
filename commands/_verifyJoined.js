/*CMD
  command: /verifyJoined
  help: Callback when user clicks Joined button
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (request && request.id) {
  try {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: "Checking membership status..."
    });
  } catch (e) {}
}

User.setProperty("fsub_checking_index", 0, "integer");
Bot.runCommand("/checkJoin");
