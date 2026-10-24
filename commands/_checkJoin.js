/*CMD
  command: /checkJoin
  help: Force Channel verification engine with Inline Join buttons
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var channels = Bot.getProperty("fsub_channels") || [];
// Filter only enabled channels
var activeChannels = [];
for (var i = 0; i < channels.length; i++) {
  if (channels[i].enabled !== false) {
    activeChannels.push(channels[i]);
  }
}

if (activeChannels.length === 0) {
  // No active channels, user is verified
  User.setProperty("fsub_checking_index", 0, "integer");
  User.setProperty("is_channel_verified", true, "boolean");
  Bot.runCommand("/start");
  return;
}

var member = (typeof options !== "undefined" && options && options.result) ? options.result : null;
var currentIndex = User.getProperty("fsub_checking_index") || 0;
var isMember = false;

if (member) {
  var status = member.status;
  if (status === "creator" || status === "administrator" || status === "member") {
    isMember = true;
  }
}

// Check join request rule: A recorded join request OR full membership satisfies requirement
if (!isMember && currentIndex < activeChannels.length) {
  var currentCh = activeChannels[currentIndex];
  if (currentCh && currentCh.type === "request") {
    isMember = true;
  }
}

// If this is callback from getChatMember and user is a member, advance
if (isMember) {
  var nextIndex = currentIndex + 1;
  if (nextIndex < activeChannels.length) {
    User.setProperty("fsub_checking_index", nextIndex, "integer");
    var nextCh = activeChannels[nextIndex];
    Api.getChatMember({
      chat_id: nextCh.id,
      user_id: user.telegramid,
      on_result: "/checkJoin",
      on_error: "/checkJoin"
    });
    return;
  }

  // All enabled channels verified!
  User.setProperty("fsub_checking_index", 0, "integer");
  User.setProperty("is_channel_verified", true, "boolean");

  if (request && request.id) {
    try {
      Api.answerCallbackQuery({
        callback_query_id: request.id,
        text: "🟢 ✅ Verified! Access granted."
      });
    } catch (e) {}
  }

  Bot.sendMessage("🟢 <b>✅ Verified</b>\n\nDhanyawad! Aapka channel verification safal raha.", { parse_mode: "html" });
  Bot.runCommand("/start");
  return;
}

// If currentIndex is 0 and no member option passed yet, start verifying first channel
if (!member && currentIndex === 0) {
  var ch0 = activeChannels[0];
  Api.getChatMember({
    chat_id: ch0.id,
    user_id: user.telegramid,
    on_result: "/checkJoin",
    on_error: "/checkJoin"
  });
  return;
}

// User has not satisfied all channels - show force join lock screen with INLINE buttons
User.setProperty("fsub_checking_index", 0, "integer");

if (request && request.id) {
  try {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: "❌ You have not joined all required channels yet!",
      show_alert: true
    });
  } catch (e) {}
}

var lockText = "🔒 <b>ACCESS REQUIRED</b>\n\n" +
  "Bot use karne ke liye kripya pehle hamare official channel ko join karein.\n\n" +
  "1. Niche diye gaye <b>Join</b> button par click karein.\n" +
  "2. Channel join karne ke baad <b>Joined</b> button dabayein.";

var inlineKeyboard = [];

// Build clickable inline button for each active channel (Text is simply "Join")
for (var k = 0; k < activeChannels.length; k++) {
  var cItem = activeChannels[k];
  var btnTitle = (activeChannels.length > 1) ? ("📢 Join Channel " + (k + 1)) : "📢 Join";
  inlineKeyboard.push([
    { text: btnTitle, url: cItem.link }
  ]);
}

// Verification button below the join links
inlineKeyboard.push([
  { text: "✅ Joined", callback_data: "/verifyJoined" }
]);

Api.sendMessage({
  chat_id: chat.chatid,
  text: lockText,
  parse_mode: "html",
  disable_web_page_preview: true,
  reply_markup: {
    inline_keyboard: inlineKeyboard
  }
});
