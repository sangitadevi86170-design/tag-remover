/*CMD
  command: /delchannel
  help: Direct Command / Callback to Delete a Force Channel or Remove Duplicates
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var isUserAdmin = (String(user.telegramid) === "8710308658" || String(user.telegramid) === "6783114912");
if (!isUserAdmin) {
  Bot.sendMessage("⛔ <b>Access Denied: Admin only!</b>", { parse_mode: "html" });
  return;
}

// Answer callback if triggered from inline button
if (typeof request !== "undefined" && request && request.id) {
  try {
    Api.answerCallbackQuery({ callback_query_id: request.id });
  } catch (e) {}
}

var channels = Bot.getProperty("fsub_channels") || [];

// Action: Remove Duplicates
if (params === "duplicates" || params === "clean_duplicates") {
  var seenIds = {};
  var seenLinks = {};
  var uniqueChannels = [];
  var removedDups = 0;

  for (var i = 0; i < channels.length; i++) {
    var c = channels[i];
    var cId = String(c.id).trim();
    var cLink = (c.link || "").trim().toLowerCase();

    if (seenIds[cId] || (cLink && seenLinks[cLink])) {
      removedDups++;
    } else {
      seenIds[cId] = true;
      if (cLink) seenLinks[cLink] = true;
      uniqueChannels.push(c);
    }
  }

  Bot.setProperty("fsub_channels", uniqueChannels, "json");

  var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
  if (logChannel && removedDups > 0) {
    try {
      Api.sendMessage({
        chat_id: logChannel,
        text: "📢 <b>FORCE CHANNEL LOG: CLEAN DUPLICATES</b>\n\n" +
          "• <b>Admin ID:</b> <code>" + user.telegramid + "</code>\n" +
          "• <b>Duplicates Removed:</b> " + removedDups + "\n" +
          "• <b>Total Channels Remaining:</b> " + uniqueChannels.length + "\n" +
          "• <b>Timestamp:</b> " + new Date().toISOString(),
        parse_mode: "html"
      });
    } catch (e) {}
  }

  Bot.sendMessage("🧹 <b>Duplicate Clean Complete!</b>\n\nTotal duplicates removed: <b>" + removedDups + "</b>\nRemaining unique channels: <b>" + uniqueChannels.length + "</b>", { parse_mode: "html" });
  Bot.runCommand("/forcechannels");
  return;
}

// Action: Delete all channels (if requested)
if (params === "all") {
  Bot.setProperty("fsub_channels", [], "json");
  Bot.sendMessage("🗑 <b>All force channels have been cleared.</b>", { parse_mode: "html" });
  Bot.runCommand("/forcechannels");
  return;
}

// Action: Delete single channel by Index or ID passed via params
if (typeof params !== "undefined" && params) {
  var p = params.trim();
  var targetIdx = -1;

  // If numeric index passed e.g. "0" or "1"
  if (/^\d+$/.test(p)) {
    var num = parseInt(p, 10);
    if (num >= 0 && num < channels.length) {
      targetIdx = num;
    }
  }

  // If not found by index, find by matching ID
  if (targetIdx === -1) {
    for (var j = 0; j < channels.length; j++) {
      if (String(channels[j].id).trim() === p || (channels[j].title && channels[j].title.trim() === p)) {
        targetIdx = j;
        break;
      }
    }
  }

  if (targetIdx !== -1) {
    var removed = channels.splice(targetIdx, 1)[0];
    Bot.setProperty("fsub_channels", channels, "json");

    var logChannel = Bot.getProperty("log_channel") || "-1002466551308";
    if (logChannel) {
      try {
        Api.sendMessage({
          chat_id: logChannel,
          text: "📢 <b>FORCE CHANNEL LOG: REMOVE</b>\n\n" +
            "• <b>Admin ID:</b> <code>" + user.telegramid + "</code>\n" +
            "• <b>Channel ID:</b> <code>" + removed.id + "</code>\n" +
            "• <b>Channel Name:</b> " + (removed.title || "Channel") + "\n" +
            "• <b>Action:</b> REMOVE_CHANNEL\n" +
            "• <b>Timestamp:</b> " + new Date().toISOString(),
          parse_mode: "html"
        });
      } catch (e) {}
    }

    Bot.sendMessage("✅ <b>Channel '" + (removed.title || removed.id) + "' removed successfully.</b>", { parse_mode: "html" });
    Bot.runCommand("/forcechannels");
    return;
  }
}

Bot.sendMessage("⚠️ <b>Channel not found or invalid parameter.</b>", { parse_mode: "html" });
Bot.runCommand("/forcechannels");
