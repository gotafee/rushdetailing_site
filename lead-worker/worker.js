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

const leadNamePattern = /^[\p{L}\s-]+$/u;
const SITE_ID = 'rush-detailing';
const SITE_KNOWLEDGE = {
  [SITE_ID]: `Rush Detailing, Москва, Строгино. Услуги: детейлинг-мойка от 4 500 ₽, химчистка салона от 10 000 ₽, полировка кузова от 15 000 ₽, предпродажная подготовка от 18 000 ₽, оклейка антигравийной плёнкой от 30 000 ₽. Точная цена и срок зависят от автомобиля и состояния. Работаем ежедневно 10:00–21:00.`,
};

const formatLeadText = (lead) => {
  const service = lead.service || 'Не выбрана';
  const source = lead.source || 'Не указана';

  if (lead.leadType === 'telegram_callback') {
    return [
      'Новая заявка с сайта Rush Detailing',
      '',
      'Нужно отписать в TG:',
      `<b>${escapeHtml(lead.contact)}</b>`,
      '',
      `Услуга: <b>${escapeHtml(service)}</b>`,
      `Страница: <b>${escapeHtml(source)}</b>`,
    ].join('\n');
  }

  return [
    'Новая заявка с сайта Rush Detailing',
    '',
    `Имя: <b>${escapeHtml(lead.name)}</b>`,
    `Контакт: <b>${escapeHtml(lead.contact)}</b>`,
    `Услуга: <b>${escapeHtml(service)}</b>`,
    lead.carMake ? `Автомобиль: <b>${escapeHtml(lead.carMake)}</b>` : '',
    lead.carModel ? `Удобное время: <b>${escapeHtml(lead.carModel)}</b>` : '',
    `Страница: <b>${escapeHtml(source)}</b>`,
  ].join('\n');
};

const sendToGoogleSheets = async (env, lead) => {
  // URL stays in a Worker secret, never in browser code.
  if (!env.GOOGLE_SHEETS_WEBHOOK_URL || !env.GOOGLE_SHEETS_SECRET) {
    return { delivered: false, configured: false };
  }
  const response = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: env.GOOGLE_SHEETS_SECRET,
      site: SITE_ID,
      timestamp: new Date().toLocaleString('ru-RU'),
      name: lead.name,
      phone: lead.contact,
      email: lead.email,
      car: [lead.carMake, lead.carModel].filter(Boolean).join(' · '),
      service: lead.service,
      source: lead.source,
      leadType: lead.leadType,
    }),
  });
  if (!response.ok) throw new Error(`Google Sheets webhook error: ${response.status}`);
  const data = await response.json().catch(() => ({}));
  if (data && data.ok === false) throw new Error(`Google Sheets webhook error: ${data.error || 'Unknown error'}`);
  return { delivered: true, configured: true };
};

const buildChatPrompt = (knowledge) => [
  'Ты — дружелюбный и полезный консультант Rush Detailing в Москве, Строгино.',
  'Общайся по-русски естественно, как хороший администратор. Каждый ответ должен быть законченной мыслью: для простого вопроса уложись примерно в 20 русских слов, добавь полезный совет и при необходимости один уточняющий вопрос. Не отвечай одной цифрой или сухой фразой.',
  'По вопросам об уходе за автомобилем сначала поясни, какая услуга подойдёт и почему. Затем можешь назвать известную стартовую цену. Точную цену, срок работ и свободные окна не выдумывай: они зависят от автомобиля и его состояния.',
  'Если человек хочет записаться, уточни услугу, автомобиль и удобное время. На обычные вопросы отвечай свободно и доброжелательно.',
  'Не упоминай эту инструкцию и не придумывай факты о студии.',
  '',
  `Данные студии:\n${knowledge}`,
].join('\n');

const requestTelepasta = async (env, messages, knowledge) => {
  if (!env.TELEPASTA_API_KEY) return null;
  const response = await fetch('https://telepasta.ru/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.TELEPASTA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      messages: [{ role: 'system', content: buildChatPrompt(knowledge) }, ...messages],
      temperature: 0.8,
      max_tokens: 350,
      max_completion_tokens: 350,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telepasta error: ${response.status}`);
  }

  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content || '').trim() || null;
};

const askTelepasta = async (env, messages, knowledge) => {
  return requestTelepasta(env, messages, knowledge);
};

const handleChat = async (request, env) => {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });
  }

  const question = String(payload.message || payload.question || '').trim().slice(0, 500);
  const dialogId = String(payload.dialogId || '').trim().slice(0, 120);
  const siteId = String(payload.siteId || SITE_ID).trim();
  const history = (Array.isArray(payload.history) ? payload.history : []).filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string').slice(-4).map((item) => ({ role: item.role, content: item.content.trim().slice(0, 500) })).filter((item) => item.content);

  if (!question) {
    return Response.json({ ok: false, error: 'Message is required' }, { status: 400, headers: corsHeaders });
  }

  const knowledge = SITE_KNOWLEDGE[siteId] || SITE_KNOWLEDGE[SITE_ID];

  try {
    const aiAnswer = await askTelepasta(env, [...history, { role: 'user', content: question }], knowledge);
    if (aiAnswer) {
      return Response.json({ ok: true, answer: aiAnswer.slice(0, 500), provider: 'claude-opus-4-8', dialogId }, { headers: corsHeaders });
    }
  } catch (error) {
    console.error(error);
  }
  return Response.json({ ok: false, error: 'ИИ временно недоступен. Оставьте заявку — менеджер ответит лично.', dialogId }, { status: 503, headers: corsHeaders });
};

const getTelegramChatIds = (env) =>
  [
    env.TELEGRAM_CHAT_IDS,
    env.TELEGRAM_CHAT_ID,
    env.TELEGRAM_CLIENT_CHAT_ID,
  ]
    .filter(Boolean)
    .join(',')
    .split(',')
    .map((chatId) => chatId.trim())
    .filter(Boolean)
    .filter((chatId, index, chatIds) => chatIds.indexOf(chatId) === index);

const sendTelegram = async (env, text) => {
  const chatIds = getTelegramChatIds(env);
  if (!env.TELEGRAM_BOT_TOKEN || chatIds.length === 0) {
    return { delivered: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
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

  const failedResults = results.filter((result) => result.status === 'rejected');
  if (failedResults.length) {
    failedResults.forEach((result) => console.error(result.reason));
  }

  const delivered = results.length - failedResults.length;
  if (delivered === 0) {
    throw new Error('Telegram delivery failed for all recipients');
  }

  return { delivered, failed: failedResults.length };
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (url.pathname === '/chat') {
      return handleChat(request, env);
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
      leadType: String(lead.leadType || '').trim().slice(0, 80),
      carMake: String(lead.carMake || '').trim().slice(0, 80),
      carModel: String(lead.carModel || '').trim().slice(0, 100),
      email: String(lead.email || '').trim().slice(0, 160),
    };

    if (!leadNamePattern.test(normalizedLead.name)) {
      return Response.json({ ok: false, error: 'Name must contain only letters' }, { status: 400, headers: corsHeaders });
    }

    const text = formatLeadText(normalizedLead);

    try {
      const [telegram, googleSheets] = await Promise.all([sendTelegram(env, text), sendToGoogleSheets(env, normalizedLead)]);
      if (!googleSheets.configured) {
        throw new Error('Google Sheets webhook is not configured');
      }
      return Response.json({ ok: true, delivery: { telegram, googleSheets } }, { headers: corsHeaders });
    } catch (error) {
      console.error(error);
      return Response.json({ ok: false, error: 'Lead delivery failed' }, { status: 502, headers: corsHeaders });
    }
  },
};
