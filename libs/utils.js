var ADMINS = ["8710308658", "6783114912"];

function getAdminIds() {
  var prop = Bot.getProperty("admin_ids");
  if (prop && Array.isArray(prop)) return prop;
  return ADMINS;
}

function isAdmin(tgId) {
  var idStr = String(tgId);
  var list = getAdminIds();
  for (var i = 0; i < list.length; i++) {
    if (String(list[i]) === idStr) return true;
  }
  return false;
}

publish({
  getAdminIds: getAdminIds,
  isAdmin: isAdmin
});
