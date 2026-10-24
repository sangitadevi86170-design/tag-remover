/*CMD
  command: /checkJoin
  help: Force Channel verification engine
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 🔵 Check Membership, Check Membership, /verify
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
  var pendingAction = User.getProperty("pending_action");
  User.setProperty("pending_action", null, "string");
  if (pendingAction === "start") {
    Bot.runCommand("/start");
  } else {
    Bot.sendMessage("🟢 <b>✅ Verified</b>\n\nAap ab bot use kar sakte hain!", { parse_mode: "html" });
  }
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
    // User requested or clicked join request link - satisfied!
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
  var pendingAction = User.getProperty("pending_action");
  User.setProperty("pending_action", null, "string");

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

// User has not satisfied all channels - show force join lock screen
User.setProperty("fsub_checking_index", 0, "integer");

var lockText = "🔒 <b>ACCESS REQUIRED</b>\n\n" +
  "Bot use karne ke liye kripya hamare official channels join karein:\n\n";

for (var k = 0; k < activeChannels.length; k++) {
  var cItem = activeChannels[k];
  var tLabel = "Public";
  if (cItem.type === "private") tLabel = "Private";
  if (cItem.type === "request") tLabel = "Join Request";

  lockText += (k + 1) + ". 📢 <a href=\"" + cItem.link + "\"><b>" + (cItem.title || "Join Channel") + "</b></a> (" + tLabel + ")\n" +
    "   🔗 " + cItem.link + "\n\n";
}

lockText += "<i>Saare channels join karne ke baad neeche <b>🔵 Check Membership</b> dabayein:</i>";

var verifyReplyKeyboard = [
  [
    { text: "🔵 Check Membership", style: "primary" }
  ]
];

Api.sendMessage({
  chat_id: chat.chatid,
  text: lockText,
  parse_mode: "html",
  disable_web_page_preview: true,
  reply_markup: {
    keyboard: verifyReplyKeyboard,
    resize_keyboard: true,
    is_persistent: true
  }
});
