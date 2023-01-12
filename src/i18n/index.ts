import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import COMMON_EN from './locales/en/common.json';
import DAOCREATE_EN from './locales/en/daoCreate.json';
import DASHBOARD_EN from './locales/en/dashboard.json';
import LANGUAGES_EN from './locales/en/languages.json';
import MENU_EN from './locales/en/menu.json';
import MODALS_EN from './locales/en/modals.json';
import PROPOSAL_EN from './locales/en/proposal.json';
import PROPOSAL_METADATA_EN from './locales/en/proposalMetadata.json';
import SIDEBAR_EN from './locales/en/sidebar.json';
import TRANSACTION_EN from './locales/en/transaction.json';
import TREASURY_EN from './locales/en/treasury.json';
import COMMON_UK from './locales/uk/common.json';
import DAOCREATE_UK from './locales/uk/daoCreate.json';
import DASHBOARD_UK from './locales/uk/dashboard.json';
import LANGUAGES_UK from './locales/uk/languages.json';
import MENU_UK from './locales/uk/menu.json';
import MODALS_UK from './locales/uk/modals.json';
import PROPOSAL_UK from './locales/uk/proposal.json';
import SIDEBAR_UK from './locales/uk/sidebar.json';
import TRANSACTION_UK from './locales/uk/transaction.json';
import TREASURY_UK from './locales/uk/treasury.json';
/**
 * Contains initialization for the react-i18next library, which handles displaying strings based on the browser's current
 * language setting. This library is based on the popular i18next JavaScript library, tailored specificaly to React.
 *
 * Each supported language requires a set of corresponding .json files in the `.locales/{country code}/`
 * directory, e.g. `.locales/es/common.json`.
 *
 * Splitting strings into separate files creates distinct "namespaces" in i18next, which allows the loading of only
 * the strings needed for a given user path, rather that all strings at once, which as the project grows larger can
 * impact load times.
 *
 * Rendering translated strings can be done a number of different ways, including via the `useTranslation` hook,
 * `withTranslation` higher-order component, or `Translation` render prop:
 * https://react.i18next.com/latest/usetranslation-hook
 * https://react.i18next.com/latest/withtranslation-hoc
 * https://react.i18next.com/latest/translation-render-prop
 *
 * Documentation related to plurals and string interpolation can be found at:
 * https://www.i18next.com/translation-function/plurals
 * https://www.i18next.com/translation-function/interpolation
 */

export const supportedLanguages = {
  en: {
    common: COMMON_EN,
    daoCreate: DAOCREATE_EN,
    menu: MENU_EN,
    dashboard: DASHBOARD_EN,
    proposal: PROPOSAL_EN,
    proposalMetadata: PROPOSAL_METADATA_EN,
    transaction: TRANSACTION_EN,
    treasury: TREASURY_EN,
    sidebar: SIDEBAR_EN,
    modals: MODALS_EN,
    languages: LANGUAGES_EN,
  },
  uk: {
    common: COMMON_UK,
    daoCreate: DAOCREATE_UK,
    menu: MENU_UK,
    dashboard: DASHBOARD_UK,
    proposal: PROPOSAL_UK,
    transaction: TRANSACTION_UK,
    treasury: TREASURY_UK,
    sidebar: SIDEBAR_UK,
    modals: MODALS_UK,
    languages: LANGUAGES_UK,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: supportedLanguages,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
