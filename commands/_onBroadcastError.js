/*CMD
  command: /onBroadcastError
  help: Track broadcast failure per chat
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

// Increment failed broadcast counter
var failed = Bot.getProperty("broadcast_failed_count") || 0;
Bot.setProperty("broadcast_failed_count", failed + 1, "integer");
