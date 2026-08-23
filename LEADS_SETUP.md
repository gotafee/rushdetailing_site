# Lead Delivery Setup

The site is static, so lead delivery must go through a small backend endpoint.
This project includes a Cloudflare Worker in `lead-worker/`.

## New lead pipeline

`Website form → Cloudflare Worker → Telegram bot + Google Sheets CRM`

The website is intentionally disconnected from the previous Worker while the
new credentials are being prepared. The old endpoint is not used by the local
preview or by a future build until a new Worker URL is entered in
`src/data/site.ts`.

### Google Sheets CRM

1. Create a Google Sheet for leads.
2. In it choose **Extensions → Apps Script** and replace `Code.gs` with
   `lead-worker/google-apps-script.js`.
3. Replace `PASTE_A_LONG_RANDOM_SECRET_HERE` with a long random value.
4. Deploy it as a **Web app**, execute as yourself, access: **Anyone**.
5. Copy the Web app URL.

### Telegram and Worker secrets

After logging into the desired Cloudflare account, run in `lead-worker/`:

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_IDS
wrangler secret put ENABLE_TELEGRAM_LEADS
wrangler secret put GOOGLE_SHEETS_WEBHOOK_URL
wrangler secret put GOOGLE_SHEETS_SECRET
wrangler deploy
```

Set `ENABLE_TELEGRAM_LEADS` to `true` when Telegram delivery is approved. Use
the exact same random value for `GOOGLE_SHEETS_SECRET` and
`SECRET_TOKEN`. After deploy, put the Worker URL in `forms.endpoint` and set
`forms.submitMode` to `endpoint`.

## What it sends

- Telegram message through Telegram Bot API.
- It can send one lead to several Telegram chats at once.

## Required secrets

- `TELEGRAM_BOT_TOKEN` - token from BotFather.
- `TELEGRAM_CHAT_IDS` - one or several chat ids separated by comma.

Example:

```text
123456789,987654321
```

This is useful when leads should go to both the client and the developer for the first checks.

## Deploy outline

1. Copy `lead-worker/wrangler.toml.example` to `lead-worker/wrangler.toml`.
2. Run `wrangler deploy` inside `lead-worker`.
3. Add the secrets with `wrangler secret put ...`.
4. Put the deployed Worker URL into `src/data/site.ts` as `forms.endpoint`.
5. Change `forms.submitMode` to `endpoint`.

Do not put tokens or API keys directly into the frontend code.
