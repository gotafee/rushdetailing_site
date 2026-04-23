# Compact Context

## Проект

Многостраничный сайт для студии автодетейлинга Rush Detailing в Москве.

Папка проекта:

```powershell
C:\codex 1st\rushdetailing-site
```

Стек: Astro, статический сайт.

Команды:

```powershell
npm run dev
npm run build
npm run preview
```

Локальный адрес разработки по умолчанию:

```text
http://localhost:4321/
```

## Основная цель

Сделать строгий премиальный сайт без визуального мусора, с упором на заявки:

- понятная структура услуг;
- быстрые CTA на каждой важной странице;
- короткая форма: имя, телефон/Telegram, услуга;
- быстрые контакты через телефон, Telegram и WhatsApp;
- sticky header и мобильная CTA-панель;
- SEO-готовность: title, description, canonical, sitemap, robots, schema.org;
- готовность к Яндекс Метрике, Google Search Console и рекламе.

## Структура страниц

Уже заведены страницы:

- `/` - главная;
- `/uslugi` - каталог услуг;
- `/uslugi/[slug]` - SEO-страницы услуг;
- `/kejsy` - кейсы;
- `/ceny` - цены;
- `/o-studii` - о студии;
- `/faq` - FAQ;
- `/kontakty` - контакты;
- `/politika-konfidencialnosti` - политика;
- `/spasibo` - страница после заявки;
- `/robots.txt`;
- `/sitemap.xml`.

## Ключевые файлы

- `src/data/site.ts` - бренд, контакты, адрес, аналитика, отзывы, FAQ, навигация, настройки формы.
- `src/data/services.ts` - услуги и контент страниц услуг.
- `src/data/prices.ts` - блоки цен.
- `src/data/cases.ts` - кейсы и изображения работ.
- `src/layouts/Layout.astro` - общий layout, SEO, schema.org, header/footer/mobile CTA.
- `src/components/Header.astro` - шапка и мобильное меню.
- `src/components/Footer.astro` - футер.
- `src/components/HeroSection.astro` - hero-блоки.
- `src/components/LeadForm.astro` - форма заявки.
- `src/components/MobileCTA.astro` - нижняя CTA-панель на мобильных.
- `src/components/CasesGrid.astro` - сетка и фильтры кейсов.
- `src/components/FAQAccordion.astro` - FAQ.
- `src/components/ContactSection.astro` - контакты и карта.
- `src/styles/global.css` - вся основная визуальная система.
- `public/scripts/site.js` - мобильное меню, reveal-анимации, фильтры кейсов, галереи, форма, FAQ, Яндекс Карта.
- `lead-worker/worker.js` - Cloudflare Worker для отправки заявок в Telegram.
- `LEADS_SETUP.md` - инструкция по подключению заявок.

## Что уже сделано

- Собрана многостраничная структура Astro.
- Настроены SEO-метаданные, canonical, Open Graph, Twitter Card.
- Добавлены schema.org: AutoDetailing, BreadcrumbList, FAQPage и дополнительные схемы на страницах.
- Есть sticky header, мобильное меню и мобильная CTA-панель.
- Есть форма заявки на всех ключевых страницах.
- Форма сейчас работает в `placeholder`-режиме: после отправки ведет на `/spasibo`.
- Для реальной отправки заявок добавлен Cloudflare Worker в `lead-worker/`.
- Worker отправляет лиды в один или несколько Telegram-чатов через `TELEGRAM_CHAT_IDS`.
- Есть инструкция `LEADS_SETUP.md`.
- Добавлены реальные контакты:
  - телефон: `+7 (925) 470-67-12`;
  - Telegram: `https://t.me/rushdetailing`;
  - WhatsApp: `https://wa.me/79254706712`;
  - адрес: Москва, ул. Маршала Катукова, 24А, стр. 1, этаж -1.
- Подключена Яндекс Карта через API-ключ в `siteConfig.location.mapApiKey`.
- Добавлены реальные отзывы из Яндекс Карт.
- Добавлены кейсы, услуги, цены, FAQ, контакты, политика, страница спасибо.
- В `dist/` уже есть свежая сборка.

## Текущие настройки формы

В `src/data/site.ts`:

```ts
forms: {
  endpoint: '',
  submitMode: 'placeholder',
  thankYouPath: '/spasibo',
}
```

Чтобы включить реальную отправку:

1. Развернуть Worker из `lead-worker/`.
2. Добавить secrets:
   - `TELEGRAM_BOT_TOKEN`;
   - `TELEGRAM_CHAT_IDS`.
3. Вставить URL Worker в `forms.endpoint`.
4. Поменять `forms.submitMode` на `'endpoint'`.

## Что было последним по состоянию на 23.04.2026

Свежие изменения касались:

- визуала и адаптива;
- header/footer;
- hero-блоков;
- кейсов и галерей;
- мобильной CTA;
- layout и SEO;
- Cloudflare Worker для лидов;
- финальной сборки в `dist`.

Git в текущем окружении не найден, поэтому состояние проверяется по файлам и датам изменения, а не через `git status`.

## Что осталось логичным следующим шагом

1. Открыть сайт локально и визуально пройти главную, услуги, кейсы, цены, контакты.
2. Проверить адаптив на мобильной ширине.
3. Найти и поправить возможные проблемы:
   - наложения текста;
   - слишком большие отступы;
   - слабые CTA;
   - неудачные фото;
   - ошибки в русских текстах;
   - некорректную карту или контакты.
4. Прогнать `npm run build`.
5. Подключить реальные заявки через Worker, когда будут Telegram bot token и chat id.

## Быстрый старт

```powershell
cd "C:\codex 1st\rushdetailing-site"
npm run dev
```

Если порт 4321 занят, Astro поднимет следующий свободный порт или можно указать вручную:

```powershell
npm run dev -- --host 127.0.0.1 --port 4322
```
