/*CMD
  command: *
  help: Central Catch-All router for Tag Remover & Admin FSM
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var isUserAdmin = (String(user.telegramid) === "8710308658" || String(user.telegramid) === "6783114912");

// Extract incoming text and raw message robustly from all possible Telegram / BB update formats
var rawMsg = (typeof request !== "undefined" && request && request.message) ? request.message : 
             (typeof message === "object" && message) ? message : null;

var text = "";
if (rawMsg && typeof rawMsg.text === "string") {
  text = rawMsg.text.trim();
} else if (typeof message === "string" && message) {
  text = message.trim();
} else if (typeof request !== "undefined" && request && typeof request.text === "string") {
  text = request.text.trim();
}

// 0. TOP-LEVEL FORWARDED TEXT HANDLER
// If this is a forwarded text message or normal text post:
var docCheck = (rawMsg && rawMsg.document) || (typeof request !== "undefined" && request && request.document);
var vidCheck = (rawMsg && rawMsg.video) || (typeof request !== "undefined" && request && request.video);
var phoCheck = (rawMsg && rawMsg.photo) || (typeof request !== "undefined" && request && request.photo);
var audCheck = (rawMsg && rawMsg.audio) || (typeof request !== "undefined" && request && request.audio);
var voiCheck = (rawMsg && rawMsg.voice) || (typeof request !== "undefined" && request && request.voice);
var aniCheck = (rawMsg && rawMsg.animation) || (typeof request !== "undefined" && request && request.animation);
var isAnyMediaNow = Boolean(docCheck || vidCheck || phoCheck || audCheck || voiCheck || aniCheck);

var userStateNow = User.getProperty("user_state");
var adminStateNow = User.getProperty("admin_state");

var isMenuCommand = (
  text === "/start" || text === "🔙 Back to Main" || text === "Back to Main" ||
  text === "ℹ️ Help" || text === "Help" || text === "/help" ||
  text === "📊 Bot Stats" || text === "Bot Stats" || text === "/stats" ||
  text === "👑 Admin Panel" || text === "Admin Panel" || text === "/admin" || text === "/panel" ||
  text === "📢 Force Channels" || text === "Force Channels" || text === "/forcechannels" || text === "/fsubchannels" ||
  text === "➕ Add Channel" || text === "🗑 Remove Channel" || text === "📋 List Channels" ||
  text === "🔁 Enable/Disable Channel" || text === "📢 Broadcast" || text === "📥 Export Users CSV" ||
  text === "⚙️ Set Log Channel" || text === "🧹 Clean Duplicates" || text === "/cleanduplicates" ||
  text === "❌ Cancel" || text === "Cancel" || text === "/cancel" || text === "🔙 Back" || text === "Back" ||
  text === "🔙 Back to Admin" || text === "Back to Admin" || text.indexOf("Channel #") === 0 ||
  text === "🟢 Confirm Remove" || text === "🔴 Cancel"
);

if (!isAnyMediaNow && text && text.length > 0 && !isMenuCommand && !userStateNow && !adminStateNow) {
  var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
  var userChatId = chat.chatid || (rawMsg && rawMsg.chat && rawMsg.chat.id) || user.telegramid;
  var targetMsgId = (rawMsg && rawMsg.message_id) || (typeof request !== "undefined" && request && request.message_id);

  var textDelivered = false;

  // 1. Try native Api.copyMessage first (exact Anonymous Forwarder Bot method)
  if (targetMsgId && userChatId) {
    try {
      Api.copyMessage({
        chat_id: userChatId,
        from_chat_id: userChatId,
        message_id: targetMsgId
      });
      textDelivered = true;
    } catch (eCopy) {
      textDelivered = false;
    }
  }

  // 2. Direct Api.sendMessage with entities
  if (!textDelivered) {
    var rawEntities = (rawMsg && rawMsg.entities) || (typeof request !== "undefined" && request && request.entities) || null;
    try {
      var sParams = {
        chat_id: userChatId,
        text: text,
        disable_web_page_preview: false
      };
      if (rawEntities && rawEntities.length > 0) {
        sParams.entities = rawEntities;
      }
      Api.sendMessage(sParams);
      textDelivered = true;
    } catch (eEntities) {
      try {
        Api.sendMessage({
          chat_id: userChatId,
          text: text,
          disable_web_page_preview: false
        });
        textDelivered = true;
      } catch (ePlain) {
        Bot.sendMessage(text);
        textDelivered = true;
      }
    }
  }

  // 3. Log to Log Channel
  if (logChannel) {
    try {
      if (targetMsgId && userChatId) {
        Api.copyMessage({
          chat_id: logChannel,
          from_chat_id: userChatId,
          message_id: targetMsgId
        });
      } else {
        Api.sendMessage({
          chat_id: logChannel,
          text: text,
          disable_web_page_preview: true
        });
      }
      Api.sendMessage({
        chat_id: logChannel,
        text: "📋 <b>Message Logged:</b>\n" +
          "• User: " + (user.first_name || "") + " (@" + (user.username || "None") + ")\n" +
          "• ID: <code>" + user.telegramid + "</code>\n" +
          "• Action: Clean Forward (Instant Text)",
        parse_mode: "html"
      });
    } catch (eLog) {}
  }

  var curTotal = Bot.getProperty("total_processed") || 0;
  Bot.setProperty("total_processed", curTotal + 1, "integer");
  return;
}

// 1. Universal Cancel Handler
if (text === "❌ Cancel" || text === "Cancel" || text === "/cancel") {
  User.setProperty("admin_state", null, "string");
  User.setProperty("user_state", null, "string");
  User.setProperty("temp_chan_ref", null, "string");
  User.setProperty("temp_chan_type", null, "string");
  User.setProperty("temp_chan_title", null, "string");
  User.setProperty("active_fwd", null, "json");

  Bot.sendMessage("❌ Cancelled.");
  if (isUserAdmin) {
    Bot.runCommand("/admin");
  } else {
    Bot.runCommand("/start");
  }
  return;
}

// 2. Navigation Shortcuts
if (text === "🔙 Back" || text === "Back") {
  User.setProperty("admin_state", null, "string");
  if (isUserAdmin) {
    Bot.runCommand("/forcechannels");
  } else {
    Bot.runCommand("/start");
  }
  return;
}

if (text === "🔙 Back to Admin" || text === "Back to Admin") {
  User.setProperty("admin_state", null, "string");
  if (isUserAdmin) {
    Bot.runCommand("/admin");
  } else {
    Bot.runCommand("/start");
  }
  return;
}

if (text === "🔙 Back to Main" || text === "Back to Main") {
  User.setProperty("admin_state", null, "string");
  User.setProperty("user_state", null, "string");
  Bot.runCommand("/start");
  return;
}

if (text === "ℹ️ Help" || text === "Help" || text === "/help") {
  Bot.runCommand("/help");
  return;
}

if (text === "📊 Bot Stats" || text === "Bot Stats" || text === "/stats") {
  Bot.runCommand("/stats");
  return;
}

if (text === "👑 Admin Panel" || text === "Admin Panel" || text === "/admin" || text === "/panel") {
  Bot.runCommand("/admin");
  return;
}

if (text === "📢 Force Channels" || text === "Force Channels" || text === "/forcechannels" || text === "/fsubchannels") {
  Bot.runCommand("/forcechannels");
  return;
}

if (text === "🧹 Clean Duplicates" || text === "Clean Duplicates" || text === "/cleanduplicates") {
  if (isUserAdmin) {
    Bot.runCommand("/delchannel duplicates");
  }
  return;
}

// 3. Admin State Machine
var adminState = User.getProperty("admin_state");

if (isUserAdmin && adminState) {
  // --- ADD CHANNEL: Step 1 -> Reference received ---
  if (adminState === "waiting_chan_ref") {
    var refId = "";
    var refTitle = "";

    var fwdFrom = null;
    if (typeof request !== "undefined" && request && request.message && request.message.forward_from_chat) {
      fwdFrom = request.message.forward_from_chat;
    } else if (typeof message === "object" && message && message.forward_from_chat) {
      fwdFrom = message.forward_from_chat;
    }

    if (fwdFrom) {
      refId = String(fwdFrom.id);
      refTitle = fwdFrom.title || fwdFrom.username || "Channel";
    } else if (text) {
      refId = text;
      refTitle = text;
    }

    if (!refId) {
      Bot.sendMessage("⚠️ Invalid input. Forward message, send @username or numeric ID (e.g. -100xxx).");
      return;
    }

    // Immediate duplicate check on Step 1
    var existingChans = Bot.getProperty("fsub_channels") || [];
    var cleanRef = refId.replace("@", "").trim().toLowerCase();
    for (var ex = 0; ex < existingChans.length; ex++) {
      var existCh = existingChans[ex];
      var existId = String(existCh.id || "").replace("@", "").trim().toLowerCase();
      var existTitle = String(existCh.title || "").replace("@", "").trim().toLowerCase();
      if (cleanRef === existId || (cleanRef.length > 2 && cleanRef === existTitle)) {
        User.setProperty("admin_state", null, "string");
        User.setProperty("temp_chan_ref", null, "string");
        User.setProperty("temp_chan_title", null, "string");
        User.setProperty("temp_chan_type", null, "string");
        Bot.sendMessage("⚠️ <b>Ye channel already Force Channels me added hai!</b>\n\nChannel ID: <code>" + existCh.id + "</code> (" + (existCh.title || "Channel") + ")\n\n<i>Duplicate channel add nahi ho sakta.</i>", { parse_mode: "html" });
        Bot.runCommand("/forcechannels");
        return;
      }
    }

    User.setProperty("temp_chan_ref", refId, "string");
    User.setProperty("temp_chan_title", refTitle, "string");
    User.setProperty("admin_state", "waiting_chan_type", "string");

    var typeKeyboard = [
      [
        { text: "⚪ Public", style: "primary" },
        { text: "⚪ Private", style: "primary" }
      ],
      [
        { text: "⚪ Join Request", style: "primary" },
        { text: "❌ Cancel", style: "danger" }
      ]
    ];

    Api.sendMessage({
      chat_id: chat.chatid,
      text: "➕ <b>ADD FORCE JOIN CHANNEL (Step 2 of 3)</b>\n\n" +
        "• <b>Channel Reference:</b> <code>" + refId + "</code>\n\n" +
        "Select the <b>Channel Type</b> below:",
      parse_mode: "html",
      reply_markup: {
        keyboard: typeKeyboard,
        resize_keyboard: true,
        is_persistent: true
      }
    });
    return;
  }

  // --- ADD CHANNEL: Step 2 -> Channel Type received ---
  if (adminState === "waiting_chan_type") {
    var selectedType = "";
    if (text.indexOf("Public") !== -1) selectedType = "public";
    else if (text.indexOf("Private") !== -1) selectedType = "private";
    else if (text.indexOf("Join Request") !== -1 || text.indexOf("Request") !== -1) selectedType = "request";

    if (!selectedType) {
      Bot.sendMessage("⚠️ Please choose a valid type: Public, Private, or Join Request.");
      return;
    }

    User.setProperty("temp_chan_type", selectedType, "string");
    User.setProperty("admin_state", "waiting_chan_url", "string");

    var cancelKb = [
      [
        { text: "❌ Cancel", style: "danger" }
      ]
    ];

    var typeDisplay = selectedType.toUpperCase();
    Api.sendMessage({
      chat_id: chat.chatid,
      text: "➕ <b>ADD FORCE JOIN CHANNEL (Step 3 of 3)</b>\n\n" +
        "• <b>Type Selected:</b> " + typeDisplay + "\n\n" +
        "Please send the <b>Join URL / Invite Link</b>:\n" +
        "<i>Example:</i> <code>https://t.me/example</code> or <code>https://t.me/+AbCdEfGh</code>",
      parse_mode: "html",
      reply_markup: {
        keyboard: cancelKb,
        resize_keyboard: true,
        is_persistent: true
      }
    });
    return;
  }

  // --- ADD CHANNEL: Step 3 -> Join URL received & Save ---
  if (adminState === "waiting_chan_url") {
    var joinUrl = text;
    if (joinUrl.indexOf("http") !== 0 && joinUrl.indexOf("t.me") !== 0) {
      Bot.sendMessage("⚠️ Please provide a valid link starting with https://t.me/...");
      return;
    }

    var chanId = User.getProperty("temp_chan_ref");
    var chanTitle = User.getProperty("temp_chan_title") || "Channel";
    var chanType = User.getProperty("temp_chan_type") || "public";
    var addedTime = new Date().toISOString();

    var channels = Bot.getProperty("fsub_channels") || [];

    // Duplicate Check: Check if channel with same ID or link already exists
    for (var d = 0; d < channels.length; d++) {
      if (String(channels[d].id) === String(chanId) || (channels[d].link && channels[d].link === joinUrl)) {
        User.setProperty("admin_state", null, "string");
        User.setProperty("temp_chan_ref", null, "string");
        User.setProperty("temp_chan_title", null, "string");
        User.setProperty("temp_chan_type", null, "string");

        Bot.sendMessage("⚠️ <b>Ye channel already added hai!</b> Duplicate channel add nahi hoga.", { parse_mode: "html" });
        Bot.runCommand("/forcechannels");
        return;
      }
    }

    channels.push({
      id: chanId,
      title: chanTitle,
      type: chanType,
      link: joinUrl,
      enabled: true,
      added_time: addedTime
    });
    Bot.setProperty("fsub_channels", channels, "json");

    User.setProperty("admin_state", null, "string");
    User.setProperty("temp_chan_ref", null, "string");
    User.setProperty("temp_chan_title", null, "string");
    User.setProperty("temp_chan_type", null, "string");

    var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
    if (logChannel) {
      try {
        Api.sendMessage({
          chat_id: logChannel,
          text: "📢 <b>FORCE CHANNEL LOG: ADD</b>\n\n" +
            "• <b>Admin ID:</b> <code>" + user.telegramid + "</code>\n" +
            "• <b>Channel ID:</b> <code>" + chanId + "</code>\n" +
            "• <b>Channel Name:</b> " + chanTitle + "\n" +
            "• <b>Channel Type:</b> " + chanType + "\n" +
            "• <b>Action:</b> ADD_CHANNEL\n" +
            "• <b>Timestamp:</b> " + addedTime,
          parse_mode: "html"
        });
      } catch (err) {}
    }

    Bot.sendMessage("✅ <b>Force Join channel added successfully.</b>", { parse_mode: "html" });
    Bot.runCommand("/forcechannels");
    return;
  }

  // --- REMOVE CHANNEL: Selection ---
  if (adminState === "waiting_remove_select") {
    if (text.indexOf("Clean Duplicates") !== -1 || text.indexOf("Clean All Duplicates") !== -1) {
      User.setProperty("admin_state", null, "string");
      Bot.runCommand("/delchannel duplicates");
      return;
    }

    var channels = Bot.getProperty("fsub_channels") || [];
    var removeIndex = -1;

    // Check for "Channel #X" button text
    var matchBtn = text.match(/Channel\s*#?(\d+)/i);
    if (matchBtn) {
      var num = parseInt(matchBtn[1], 10);
      if (num >= 1 && num <= channels.length) {
        removeIndex = num - 1;
      }
    }

    if (removeIndex === -1) {
      // Check numeric input or ID match
      var cleanInput = text.replace("🗑", "").replace("❌", "").replace("Remove", "").trim();
      for (var r = 0; r < channels.length; r++) {
        var candidate = channels[r];
        if (cleanInput === String(r + 1) || 
            cleanInput === String(candidate.id) || 
            (candidate.title && cleanInput.toLowerCase() === String(candidate.title).toLowerCase()) ||
            (candidate.link && cleanInput === String(candidate.link))) {
          removeIndex = r;
          break;
        }
      }
    }

    if (removeIndex === -1) {
      Bot.sendMessage("⚠️ Channel not found. Please tap one of the channel buttons below, or send '🧹 Clean Duplicates'.");
      return;
    }

    var targetChan = channels[removeIndex];
    User.setProperty("remove_target_index", removeIndex, "integer");
    User.setProperty("admin_state", "waiting_remove_confirm", "string");

    var confirmKeyboard = [
      [
        { text: "🟢 Confirm Remove", style: "success" },
        { text: "🔴 Cancel", style: "danger" }
      ]
    ];

    Api.sendMessage({
      chat_id: chat.chatid,
      text: "⚠️ <b>Are you sure you want to remove this channel?</b>\n\n" +
        "• <b>Channel:</b> " + (targetChan.title || "Channel") + "\n" +
        "• <b>ID:</b> <code>" + targetChan.id + "</code>\n" +
        "• <b>Type:</b> " + targetChan.type,
      parse_mode: "html",
      reply_markup: {
        keyboard: confirmKeyboard,
        resize_keyboard: true,
        is_persistent: true
      }
    });
    return;
  }

  // --- REMOVE CHANNEL: Confirm ---
  if (adminState === "waiting_remove_confirm") {
    if (text.indexOf("Confirm Remove") !== -1) {
      var rIdx = User.getProperty("remove_target_index");
      var channels = Bot.getProperty("fsub_channels") || [];

      if (rIdx !== null && rIdx >= 0 && rIdx < channels.length) {
        var removedChan = channels.splice(rIdx, 1)[0];
        Bot.setProperty("fsub_channels", channels, "json");

        var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
        if (logChannel) {
          try {
            Api.sendMessage({
              chat_id: logChannel,
              text: "📢 <b>FORCE CHANNEL LOG: REMOVE</b>\n\n" +
                "• <b>Admin ID:</b> <code>" + user.telegramid + "</code>\n" +
                "• <b>Channel ID:</b> <code>" + removedChan.id + "</code>\n" +
                "• <b>Channel Name:</b> " + (removedChan.title || "Channel") + "\n" +
                "• <b>Channel Type:</b> " + removedChan.type + "\n" +
                "• <b>Action:</b> REMOVE_CHANNEL\n" +
                "• <b>Timestamp:</b> " + new Date().toISOString(),
              parse_mode: "html"
            });
          } catch (e) {}
        }
      }

      User.setProperty("admin_state", null, "string");
      User.setProperty("remove_target_index", null, "integer");

      Bot.sendMessage("✅ <b>Force Join channel removed successfully.</b>", { parse_mode: "html" });
      Bot.runCommand("/forcechannels");
      return;
    } else {
      User.setProperty("admin_state", null, "string");
      User.setProperty("remove_target_index", null, "integer");
      Bot.sendMessage("❌ Removal cancelled.");
      Bot.runCommand("/forcechannels");
      return;
    }
  }

  // --- TOGGLE CHANNEL: Selection ---
  if (adminState === "waiting_toggle_select") {
    var channels = Bot.getProperty("fsub_channels") || [];
    var toggleIndex = -1;

    for (var t = 0; t < channels.length; t++) {
      var chObj = channels[t];
      if (text.indexOf(String(t + 1)) !== -1 || text.indexOf(String(chObj.id)) !== -1) {
        toggleIndex = t;
        break;
      }
    }

    if (toggleIndex === -1) {
      Bot.sendMessage("⚠️ Invalid selection. Please tap one of the channel buttons.");
      return;
    }

    var chToToggle = channels[toggleIndex];
    var newStatus = (chToToggle.enabled === false) ? true : false;
    chToToggle.enabled = newStatus;
    channels[toggleIndex] = chToToggle;
    Bot.setProperty("fsub_channels", channels, "json");

    var statusMsg = newStatus ? "✅ Enabled" : "🚫 Disabled";

    var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
    if (logChannel) {
      try {
        Api.sendMessage({
          chat_id: logChannel,
          text: "📢 <b>FORCE CHANNEL LOG: TOGGLE</b>\n\n" +
            "• <b>Admin ID:</b> <code>" + user.telegramid + "</code>\n" +
            "• <b>Channel ID:</b> <code>" + chToToggle.id + "</code>\n" +
            "• <b>Channel Name:</b> " + (chToToggle.title || "Channel") + "\n" +
            "• <b>New Status:</b> " + statusMsg + "\n" +
            "• <b>Action:</b> TOGGLE_ENABLE_DISABLE\n" +
            "• <b>Timestamp:</b> " + new Date().toISOString(),
          parse_mode: "html"
        });
      } catch (e) {}
    }

    User.setProperty("admin_state", null, "string");
    Bot.sendMessage("Channel status updated: " + statusMsg);
    Bot.runCommand("/togglechannel");
    return;
  }

  // --- SET LOG CHANNEL ---
  if (adminState === "waiting_log_channel") {
    var newLog = text;
    Bot.setProperty("log_channel", newLog, "string");
    User.setProperty("admin_state", null, "string");
    Bot.sendMessage("✅ <b>Log Channel updated to:</b> <code>" + newLog + "</code>", { parse_mode: "html" });
    Bot.runCommand("/admin");
    return;
  }

  // --- BROADCAST MESSAGE ---
  if (adminState === "waiting_broadcast_msg") {
    User.setProperty("admin_state", null, "string");

    var userList = Bot.getProperty("user_list") || [];
    if (!userList || userList.length === 0) {
      Bot.sendMessage("⚠️ <b>No users found in database to broadcast to.</b>", { parse_mode: "html" });
      Bot.runCommand("/admin");
      return;
    }

    // Media detection
    var bDoc = (typeof request !== "undefined" && request && request.document) || 
               (typeof request !== "undefined" && request && request.message && request.message.document) || 
               (typeof message === "object" && message && message.document);

    var bVideo = (typeof request !== "undefined" && request && request.video) || 
                 (typeof request !== "undefined" && request && request.message && request.message.video) || 
                 (typeof message === "object" && message && message.video);

    var bPhoto = (typeof request !== "undefined" && request && request.photo) || 
                 (typeof request !== "undefined" && request && request.message && request.message.photo) || 
                 (typeof message === "object" && message && message.photo);

    var bAudio = (typeof request !== "undefined" && request && request.audio) || 
                 (typeof request !== "undefined" && request && request.message && request.message.audio) || 
                 (typeof message === "object" && message && message.audio);

    var bCaption = (typeof request !== "undefined" && request && request.caption) || 
                   (typeof request !== "undefined" && request && request.message && request.message.caption) || "";

    var bEntities = (typeof request !== "undefined" && request && request.caption_entities) || 
                    (typeof request !== "undefined" && request && request.message && request.message.caption_entities) ||
                    (typeof request !== "undefined" && request && request.entities) ||
                    (typeof request !== "undefined" && request && request.message && request.message.entities) || null;

    var sentCount = 0;
    var failCount = 0;

    for (var u = 0; u < userList.length; u++) {
      var targetItem = userList[u];
      var targetChatId = (typeof targetItem === "object" && targetItem) ? targetItem.id : targetItem;

      if (!targetChatId) {
        failCount++;
        continue;
      }

      try {
        if (bPhoto) {
          var pArr = Array.isArray(bPhoto) ? bPhoto : [bPhoto];
          var pId = pArr[pArr.length - 1].file_id;
          var pParams = { chat_id: targetChatId, photo: pId, caption: bCaption, on_error: "/onBroadcastError" };
          if (bEntities && bEntities.length > 0) pParams.caption_entities = bEntities;
          else pParams.parse_mode = "html";
          Api.sendPhoto(pParams);
          sentCount++;
        } else if (bVideo) {
          var vParams = { chat_id: targetChatId, video: bVideo.file_id, caption: bCaption, on_error: "/onBroadcastError" };
          if (bEntities && bEntities.length > 0) vParams.caption_entities = bEntities;
          else vParams.parse_mode = "html";
          Api.sendVideo(vParams);
          sentCount++;
        } else if (bDoc) {
          var dParams = { chat_id: targetChatId, document: bDoc.file_id, caption: bCaption, on_error: "/onBroadcastError" };
          if (bEntities && bEntities.length > 0) dParams.caption_entities = bEntities;
          else dParams.parse_mode = "html";
          Api.sendDocument(dParams);
          sentCount++;
        } else if (bAudio) {
          var aParams = { chat_id: targetChatId, audio: bAudio.file_id, caption: bCaption, on_error: "/onBroadcastError" };
          if (bEntities && bEntities.length > 0) aParams.caption_entities = bEntities;
          else aParams.parse_mode = "html";
          Api.sendAudio(aParams);
          sentCount++;
        } else if (text) {
          var tParams = { chat_id: targetChatId, text: text, on_error: "/onBroadcastError" };
          if (bEntities && bEntities.length > 0) tParams.entities = bEntities;
          else tParams.parse_mode = "html";
          Api.sendMessage(tParams);
          sentCount++;
        } else {
          failCount++;
        }
      } catch (e) {
        failCount++;
      }
    }

    var successRate = userList.length > 0 ? ((sentCount / userList.length) * 100).toFixed(1) : "100.0";

    var adminReplyKeyboard = [
      [
        { text: "📢 Force Channels", style: "primary" },
        { text: "📢 Broadcast", style: "primary" }
      ],
      [
        { text: "📥 Export Users CSV", style: "primary" },
        { text: "⚙️ Set Log Channel", style: "primary" }
      ],
      [
        { text: "🔙 Back to Main", style: "danger" }
      ]
    ];

    var reportMsg = "📢 <b>BROADCAST DISPATCH REPORT</b>\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "👥 <b>Total Users in Database:</b> <code>" + userList.length + "</code>\n" +
      "✅ <b>Successfully Dispatched:</b> <code>" + sentCount + "</code>\n" +
      "❌ <b>Failed / Invalid:</b> <code>" + failCount + "</code>\n" +
      "📊 <b>Delivery Rate:</b> <code>" + successRate + "%</code>\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "⚡ <b>Status:</b> Completed Successfully ✅";

    Api.sendMessage({
      chat_id: chat.chatid,
      text: reportMsg,
      parse_mode: "html",
      reply_markup: {
        keyboard: adminReplyKeyboard,
        resize_keyboard: true,
        is_persistent: true
      }
    });
    return;
  }
}

// 4. User Edit Caption State
var userState = User.getProperty("user_state");
if (userState === "waiting_new_caption") {
  var newCaption = text;
  var active = User.getProperty("active_fwd");

  if (!active) {
    Bot.sendMessage("⚠️ Message expired. Please forward again.");
    User.setProperty("user_state", null, "string");
    return;
  }

  var logChannel = Bot.getProperty("log_channel") || "-1002466551308";

  function sendCleanWithCaption(targetChatId) {
    if (active.file_type === "document") {
      Api.sendDocument({ chat_id: targetChatId, document: active.file_id, caption: newCaption, parse_mode: "html" });
    } else if (active.file_type === "video") {
      Api.sendVideo({ chat_id: targetChatId, video: active.file_id, caption: newCaption, parse_mode: "html" });
    } else if (active.file_type === "photo") {
      Api.sendPhoto({ chat_id: targetChatId, photo: active.file_id, caption: newCaption, parse_mode: "html" });
    } else if (active.file_type === "audio") {
      Api.sendAudio({ chat_id: targetChatId, audio: active.file_id, caption: newCaption, parse_mode: "html" });
    } else if (active.file_type === "voice") {
      Api.sendVoice({ chat_id: targetChatId, voice: active.file_id, caption: newCaption, parse_mode: "html" });
    } else if (active.file_type === "animation") {
      Api.sendAnimation({ chat_id: targetChatId, animation: active.file_id, caption: newCaption, parse_mode: "html" });
    } else {
      Api.sendMessage({ chat_id: targetChatId, text: newCaption, parse_mode: "html" });
    }
  }

  // 1. Send to user
  sendCleanWithCaption(chat.chatid);

  // 2. Log to private log channel
  if (logChannel) {
    try {
      sendCleanWithCaption(logChannel);
      Api.sendMessage({
        chat_id: logChannel,
        text: "📋 <b>Message Logged:</b>\n" +
          "• User: " + (user.first_name || "") + " (@" + (user.username || "None") + ")\n" +
          "• ID: <code>" + user.telegramid + "</code>\n" +
          "• Action: Edited Caption\n" +
          "• File Type: " + (active.file_type || "text"),
        parse_mode: "html"
      });
    } catch (e) {}
  }

  var cCount = Bot.getProperty("total_processed") || 0;
  Bot.setProperty("total_processed", cCount + 1, "integer");

  User.setProperty("user_state", null, "string");
  User.setProperty("active_fwd", null, "json");

  Bot.sendMessage("✅ <b>Naye caption ke saath clean message bhej diya gaya hai!</b>", { parse_mode: "html" });
  return;
}

// 5. Comprehensive Media & Forward Detection
var doc = (typeof request !== "undefined" && request && request.document) || 
          (typeof request !== "undefined" && request && request.message && request.message.document) || 
          (typeof options !== "undefined" && options && options.document) || 
          (typeof message === "object" && message && message.document);

var video = (typeof request !== "undefined" && request && request.video) || 
            (typeof request !== "undefined" && request && request.message && request.message.video) || 
            (typeof options !== "undefined" && options && options.video) || 
            (typeof message === "object" && message && message.video);

var photo = (typeof request !== "undefined" && request && request.photo) || 
            (typeof request !== "undefined" && request && request.message && request.message.photo) || 
            (typeof options !== "undefined" && options && options.photo) || 
            (typeof message === "object" && message && message.photo);

var audio = (typeof request !== "undefined" && request && request.audio) || 
            (typeof request !== "undefined" && request && request.message && request.message.audio) || 
            (typeof options !== "undefined" && options && options.audio) || 
            (typeof message === "object" && message && message.audio);

var voice = (typeof request !== "undefined" && request && request.voice) || 
            (typeof request !== "undefined" && request && request.message && request.message.voice) || 
            (typeof options !== "undefined" && options && options.voice) || 
            (typeof message === "object" && message && message.voice);

var animation = (typeof request !== "undefined" && request && request.animation) || 
                (typeof request !== "undefined" && request && request.message && request.message.animation) || 
                (typeof options !== "undefined" && options && options.animation);

var caption = (typeof request !== "undefined" && request && request.caption) || 
              (typeof request !== "undefined" && request && request.message && request.message.caption) || "";

var hasMedia = Boolean(doc || video || photo || audio || voice || animation);

// Check if message is forwarded or standard text
var msgId = (typeof request !== "undefined" && request && request.message_id) ||
            (typeof request !== "undefined" && request && request.message && request.message.message_id) || 
            (typeof message === "object" && message && message.message_id) || null;

if (hasMedia || (text && text.length > 0)) {
  // Check if normal user has satisfied Force Channels
  if (!isUserAdmin) {
    var isVerified = User.getProperty("is_channel_verified");
    var fsubChans = Bot.getProperty("fsub_channels") || [];
    var hasActiveCh = false;
    for (var f = 0; f < fsubChans.length; f++) {
      if (fsubChans[f].enabled !== false) {
        hasActiveCh = true;
        break;
      }
    }
    if (hasActiveCh && !isVerified) {
      User.setProperty("fsub_checking_index", 0, "integer");
      Bot.runCommand("/checkJoin");
      return;
    }
  }

  var fileType = "text";
  var fileId = null;
  var fileName = "";

  if (doc) {
    fileType = "document";
    fileId = doc.file_id;
    fileName = doc.file_name || "Document";
  } else if (video) {
    fileType = "video";
    fileId = video.file_id;
    fileName = video.file_name || "Video.mp4";
  } else if (animation) {
    fileType = "animation";
    fileId = animation.file_id;
    fileName = animation.file_name || "Animation.gif";
  } else if (photo) {
    fileType = "photo";
    var photoArr = Array.isArray(photo) ? photo : [photo];
    var bestPhoto = photoArr[photoArr.length - 1];
    fileId = bestPhoto.file_id;
    fileName = "Photo.jpg";
  } else if (audio) {
    fileType = "audio";
    fileId = audio.file_id;
    fileName = audio.title || audio.file_name || "Audio.mp3";
  } else if (voice) {
    fileType = "voice";
    fileId = voice.file_id;
    fileName = "Voice message";
  }

  var activeCaption = caption || (fileType === "text" ? text : "");

  var captionEntities = (typeof request !== "undefined" && request && request.caption_entities) || 
                        (typeof request !== "undefined" && request && request.message && request.message.caption_entities) ||
                        (typeof request !== "undefined" && request && request.entities) ||
                        (typeof request !== "undefined" && request && request.message && request.message.entities) || null;

  // --- SPECIAL HANDLING FOR PURE TEXT MESSAGES ---
  // If user forwarded or sent pure text:
  // Instantly remove forward tag and deliver clean text directly (no buttons needed, exact clean delivery)!
  if (!hasMedia && fileType === "text" && activeCaption) {
    var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
    var userChatId = chat.chatid || (rawMsg && rawMsg.chat && rawMsg.chat.id) || user.telegramid;
    var targetMsgId = msgId || (rawMsg && rawMsg.message_id);

    // 1. Deliver clean text directly to user:
    // Try Api.copyMessage first (exact technique used by Anonymous Forwarder Bot)
    var success = false;
    if (targetMsgId && userChatId) {
      try {
        Api.copyMessage({
          chat_id: userChatId,
          from_chat_id: userChatId,
          message_id: targetMsgId
        });
        success = true;
      } catch (errCopy) {
        success = false;
      }
    }

    // If copyMessage fails (e.g. content restricted channel), send cleanly without parse_mode to avoid 400 Bad Request
    if (!success) {
      try {
        var plainParams = {
          chat_id: userChatId,
          text: activeCaption,
          disable_web_page_preview: false
        };
        if (captionEntities && captionEntities.length > 0) {
          plainParams.entities = captionEntities;
        }
        Api.sendMessage(plainParams);
        success = true;
      } catch (errSend) {
        try {
          // Direct raw string output without any parser
          Api.sendMessage({
            chat_id: userChatId,
            text: activeCaption,
            disable_web_page_preview: false
          });
          success = true;
        } catch (eFinal) {
          Bot.sendMessage(activeCaption);
        }
      }
    }

    // 2. Deliver to log channel
    if (logChannel) {
      try {
        if (targetMsgId && userChatId) {
          Api.copyMessage({
            chat_id: logChannel,
            from_chat_id: userChatId,
            message_id: targetMsgId
          });
        } else {
          Api.sendMessage({
            chat_id: logChannel,
            text: activeCaption,
            disable_web_page_preview: true
          });
        }
        Api.sendMessage({
          chat_id: logChannel,
          text: "📋 <b>Message Logged:</b>\n" +
            "• User: " + (user.first_name || "") + " (@" + (user.username || "None") + ")\n" +
            "• ID: <code>" + user.telegramid + "</code>\n" +
            "• Action: Clean Forward (Instant Text)",
          parse_mode: "html"
        });
      } catch (e2) {}
    }

    var tCount = Bot.getProperty("total_processed") || 0;
    Bot.setProperty("total_processed", tCount + 1, "integer");
    return;
  }

  // Check if this is part of an album / bulk forward (media_group_id or rapid bulk stream)
  var mediaGroupId = (rawMsg && rawMsg.media_group_id) || 
                     (typeof request !== "undefined" && request && request.media_group_id) || null;

  var nowTs = Date.now ? Date.now() : new Date().getTime();
  var lastFwdTime = User.getProperty("last_fwd_time") || 0;
  var isBulkStream = (mediaGroupId !== null) || (nowTs - lastFwdTime < 2500);
  User.setProperty("last_fwd_time", nowTs, "integer");

  // Helper function to deliver media cleanly without ANY forward tag
  function deliverCleanMediaNow(targetChatId) {
    var pParams = { chat_id: targetChatId, caption: activeCaption };
    if (captionEntities && captionEntities.length > 0) pParams.caption_entities = captionEntities;

    try {
      if (fileType === "document") {
        pParams.document = fileId;
        Api.sendDocument(pParams);
      } else if (fileType === "video") {
        pParams.video = fileId;
        Api.sendVideo(pParams);
      } else if (fileType === "photo") {
        pParams.photo = fileId;
        Api.sendPhoto(pParams);
      } else if (fileType === "audio") {
        pParams.audio = fileId;
        Api.sendAudio(pParams);
      } else if (fileType === "voice") {
        pParams.voice = fileId;
        Api.sendVoice(pParams);
      } else if (fileType === "animation") {
        pParams.animation = fileId;
        Api.sendAnimation(pParams);
      } else {
        if (msgId) {
          Api.copyMessage({ chat_id: targetChatId, from_chat_id: chat.chatid, message_id: msgId });
        } else if (activeCaption) {
          Api.sendMessage({ chat_id: targetChatId, text: activeCaption });
        }
      }
    } catch (err) {
      if (msgId) {
        try {
          Api.copyMessage({ chat_id: targetChatId, from_chat_id: chat.chatid, message_id: msgId });
        } catch (e2) {}
      }
    }
  }

  // --- CASE A: BULK / ALBUM FORWARDING ---
  // If bulk media forwarded: automatically remove tags and send clean files directly!
  if (isBulkStream) {
    deliverCleanMediaNow(chat.chatid);

    var logChan = Bot.getProperty("log_channel") || "-1002466551308";
    if (logChan) {
      try {
        deliverCleanMediaNow(logChan);
        Api.sendMessage({
          chat_id: logChan,
          text: "📋 <b>Message Logged:</b>\n" +
            "• User: " + (user.first_name || "") + " (@" + (user.username || "None") + ")\n" +
            "• ID: <code>" + user.telegramid + "</code>\n" +
            "• Action: Bulk Clean Forward (Auto)\n" +
            "• File Type: " + fileType,
          parse_mode: "html"
        });
      } catch (e3) {}
    }

    var bCount = Bot.getProperty("total_processed") || 0;
    Bot.setProperty("total_processed", bCount + 1, "integer");
    return;
  }

  // --- CASE B: SINGLE MEDIA FORWARDING ---
  // Allow user to Edit Caption or click Done / Send
  User.setProperty("active_fwd", {
    chat_id: chat.chatid,
    source_message_id: msgId,
    file_type: fileType,
    file_id: fileId,
    file_name: fileName,
    caption: activeCaption,
    caption_entities: captionEntities
  }, "json");

  var preview = activeCaption;
  if (!preview) {
    preview = fileName || "No caption";
  }
  if (preview.length > 60) {
    preview = preview.substring(0, 57) + "...";
  }

  var inlineButtons = [
    [
      { text: "✏️ Edit Caption", callback_data: "/onEdit" },
      { text: "✅ Done / Send", callback_data: "/onDone" }
    ],
    [
      { text: "❌ Cancel", callback_data: "/onCancel" }
    ]
  ];

  var displayType = fileType.toUpperCase();
  if (fileType === "document" && fileName) {
    displayType = "FILE (" + fileName + ")";
  }

  Api.sendMessage({
    chat_id: chat.chatid,
    text: "📥 <b>Message Receive Hua!</b>\n\n" +
      "• <b>Type:</b> <code>" + displayType + "</code>\n" +
      "• <b>Caption / Text:</b> <code>" + preview + "</code>\n\n" +
      "Aap kya karna chahte hain?",
    parse_mode: "html",
    reply_markup: {
      inline_keyboard: inlineButtons
    }
  });
  return;
}

// Fallback message
Bot.sendMessage("👋 Koi bhi photo, video ya post yahan forward karein.");
