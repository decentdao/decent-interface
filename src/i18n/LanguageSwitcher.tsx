import { Center, Text } from '@chakra-ui/react';
import { ArrowRight } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { OptionMenu } from '../components/ui/menus/OptionMenu';
import { supportedLanguages } from '.';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  let supported = Object.keys(supportedLanguages).map(function (languageCode) {
    return {
      optionKey: languageCode,
      onClick: () => i18n.changeLanguage(languageCode),
    };
  });

  // --- TODO remove test langs when we have translations ---
  if (process.env.NODE_ENV !== 'production') {
    supported = [
      {
        optionKey: 'en',
        onClick: () => i18n.changeLanguage('en'),
      },
      {
        optionKey: 'es',
        onClick: () => i18n.changeLanguage('es'),
      },
      {
        optionKey: 'zh',
        onClick: () => i18n.changeLanguage('zh'),
      },
    ];
  }
  // --- END TODO ---

  return (
    <OptionMenu
      trigger={
        <Center>
          <Text>{i18n.language.toUpperCase()}</Text>
          <ArrowRight />
        </Center>
      }
      options={supported}
      namespace="languages"
      showDividers={true}
    />
  );
}
