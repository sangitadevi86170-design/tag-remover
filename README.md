# Forward Tag Remover Bot (Bots.Business)

Telegram Forward Tag Remover Bot built natively for **Bots.Business** with Git Sync.

## Support & Admin
- **Telegram Support / Admin Contact**: [https://t.me/botadminshere](https://t.me/botadminshere)

## Features
- **Forward Tag Remover**: Cleans channel tags and forwarded headers from Photos, Videos, Documents, Audios, and Text.
- **Edit Caption & Done**: Interactive Inline Buttons to edit captions or instantly copy cleanly.
- **Clickable Hyperlink & Formatting Preservation**: Preserves all text hyperlinks, bold, italic, and inline entities intact.
- **Private Log Channel with Source Tracking**: Immediately forwards incoming messages natively via `Api.forwardMessage` preserving the full original channel source header ("Forwarded from [Channel]"), post link, channel ID, and user identity intact, while delivering clean tagless media to the user.
- **📢 Force Channels Engine (Admin Only)**:
  - Add Channel (Forward message, @username, or Numeric Chat ID)
  - Channel Types: Public, Private, and Join Request
  - Native Reply Keyboard button styling: `primary`, `success`, `danger` in 2x2 grid layout
  - List Channels with status indicators (`✅` Enabled / `🚫` Disabled)
  - Remove Channel with confirmation (`🟢 Confirm Remove` / `🔴 Cancel`)
  - Enable / Disable Channels on the fly
  - Join Request bypass logic (recorded join request or membership verifies access)
- **Broadcast Engine**: Admin broadcast with multi-target dispatch and detailed delivery metrics report.
- **Export Users CSV**: Full CSV user list export for admins.
- **Dual Admin Security**: Configured for Admin IDs `8710308658` and `6783114912`.
