import i18next from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export async function initI18n()
{
  const translate = await i18next
      .use(LanguageDetector)
      .use(Backend)
      .init({
        fallbackLng: ["en"],
        backend: {
          loadPath: './src/locales/{{lng}}/{{ns}}.json'
        }
  });
  return translate;
}

export let translate = await initI18n();
export {i18next};

const listeners = [];

export function registerLanguageChangedListener(listener)
{
  listeners.push(listener);
}

export function unregisterLanguageChangedListener(listener)
{
  const index = listeners.indexOf(listener);
  if (index > -1)
  {
    listeners.splice(index, 1);
  }
}

export async function changeLanguage(lang)
{
  translate = await i18next.changeLanguage(lang);
  listeners.forEach(listener => listener());
}