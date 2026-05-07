// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://rushdetailing.ru',
  trailingSlash: 'always',
  redirects: {
    '/uslugi/polirovka-kuzova-avto': '/uslugi/polirovka-i-vosstanovlenie/',
    '/uslugi/polirovka-far-avto': '/uslugi/polirovka-i-vosstanovlenie/',
    '/uslugi/okleyka-kuzova-antigraviynoy-plenkoy': '/uslugi/zashchitnye-pokrytiya-i-plenka/',
    '/uslugi/pokrytie-avtomobilya-keramikoy': '/uslugi/zashchitnye-pokrytiya-i-plenka/',
    '/uslugi/pokrytie-avto-zhidkim-steklom': '/uslugi/zashchitnye-pokrytiya-i-plenka/',
    '/uslugi/predprodazhnaya-podgotovka-avtomobilya': '/uslugi/predprodazhnaya-podgotovka-avto/',
    '/uslugi/deteyling-moyka-avto': '/uslugi/deteyling-moyka-i-lokalnyy-ukhod/',
    '/uslugi/moyka-dvigatelya-parom': '/uslugi/deteyling-moyka-i-lokalnyy-ukhod/',
    '/uslugi/khimchistka-salona': '/uslugi/khimchistka-i-ukhod-za-salonom/',
    '/uslugi/khimchistka-sideniy-avto': '/uslugi/khimchistka-i-ukhod-za-salonom/',
    '/uslugi/ozonirovanie-salona-avtomobilya': '/uslugi/khimchistka-i-ukhod-za-salonom/',
  },
});
