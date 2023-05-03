import i18next from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export async function initI18n()
{
  const translate = await i18next
      .use(LanguageDetector)
      .use(Backend)
      .init({
        backend: {
          loadPath: './src/locales/{{lng}}/{{ns}}.json'
        }
  });
  return translate;
}

export const translate = await initI18n();
export default translate;