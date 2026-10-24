function getAdminId() {
  return Bot.getProperty("admin_id") || "8710308658";
}

function isAdmin(tgId) {
  return String(tgId) === String(getAdminId());
}

publish({
  getAdminId: getAdminId,
  isAdmin: isAdmin
});
