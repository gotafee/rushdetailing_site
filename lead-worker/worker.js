const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const escapeHtml = (value) =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const formatLeadText = (lead) => {
  const service = lead.service || 'Не выбрана';
  const source = lead.source || 'Не указана';

  return [
    'Новая заявка с сайта Rush Detailing',
    '',
    `Имя: <b>${escapeHtml(lead.name)}</b>`,
    `Контакт: <b>${escapeHtml(lead.contact)}</b>`,
    `Услуга: <b>${escapeHtml(service)}</b>`,
    `Страница: <b>${escapeHtml(source)}</b>`,
  ].join('\n');
};

const getTelegramChatIds = (env) =>
  String(env.TELEGRAM_CHAT_IDS || env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((chatId) => chatId.trim())
    .filter(Boolean);

const sendTelegram = async (env, text) => {
  const chatIds = getTelegramChatIds(env);
  if (!env.TELEGRAM_BOT_TOKEN || chatIds.length === 0) return;

  await Promise.all(
    chatIds.map(async (chatId) => {
      const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram error for ${chatId}: ${response.status}`);
      }
    }),
  );
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    let lead;
    try {
      lead = await request.json();
    } catch {
      return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });
    }

    if (!lead.name || !lead.contact) {
      return Response.json({ ok: false, error: 'Name and contact are required' }, { status: 400, headers: corsHeaders });
    }

    const normalizedLead = {
      name: String(lead.name).trim().slice(0, 120),
      contact: String(lead.contact).trim().slice(0, 160),
      service: String(lead.service || '').trim().slice(0, 180),
      source: String(lead.source || '').trim().slice(0, 240),
    };

    const text = formatLeadText(normalizedLead);

    try {
      await sendTelegram(env, text);
    } catch (error) {
      console.error(error);
      return Response.json({ ok: false, error: 'Lead delivery failed' }, { status: 502, headers: corsHeaders });
    }

    return Response.json({ ok: true }, { headers: corsHeaders });
  },
};
