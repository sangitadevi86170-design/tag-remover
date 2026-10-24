# Forward Tag Remover Bot (Bots.Business)

Telegram Forward Tag Remover Bot built natively for **Bots.Business** with Git Sync.

## Features
- **Forward Tag Remover**: Cleans channel tags and forwarded headers from Photos, Videos, Documents, Audios, and Text.
- **Edit Caption & Done**: Interactive Inline Buttons to edit captions or instantly copy cleanly.
- **Private Log Channel**: Automatically logs processed messages and admin actions to the configured log channel (`-1002466551308`).
- **📢 Force Channels Engine (Admin Only)**:
  - Add Channel (Forward message, @username, or Numeric Chat ID)
  - Channel Types: Public, Private, and Join Request
  - Native Reply Keyboard button styling: `primary`, `success`, `danger`
  - List Channels with status indicators (`✅` Enabled / `🚫` Disabled)
  - Remove Channel with confirmation (`🟢 Confirm Remove` / `🔴 Cancel`)
  - Enable / Disable Channels on the fly
  - Join Request bypass logic (recorded join request or membership verifies access)
- **Broadcast**: Admin broadcast to all registered bot users.
- **Export Users CSV**: Full CSV user list export for admins.
- **Admin Security**: Strict role verification on all admin operations.
