# Lead Delivery Setup

The site is static, so lead delivery must go through a small backend endpoint.
This project includes a Cloudflare Worker in `lead-worker/`.

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
