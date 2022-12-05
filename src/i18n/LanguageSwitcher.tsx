import { Center, Text } from '@chakra-ui/react';
import { ArrowRight } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { OptionMenu } from '../components/ui/menus/OptionMenu';
import { supportedLanguages } from '.';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const changeLanguage = (lang: string) => i18n.changeLanguage(lang);

  let supported = Object.keys(supportedLanguages).map(function (languageCode) {
    return {
      optionKey: languageCode,
      onClick: () => changeLanguage(languageCode),
    };
  });

  // --- TODO remove test langs when we have translations ---
  if (process.env.NODE_ENV !== 'production') {
    supported = [
      {
        optionKey: 'en',
        onClick: () => changeLanguage('EN'),
      },
      {
        optionKey: 'es',
        onClick: () => changeLanguage('ES'),
      },
      {
        optionKey: 'zh-CN',
        onClick: () => changeLanguage('zh_CN'),
      },
    ];
  }
  // --- END TODO ---

  if (supported.length < 2) {
    return null;
  }

  return (
    <OptionMenu
      trigger={
        <Center>
          <Text>{i18n.language}</Text>
          <ArrowRight />
        </Center>
      }
      options={supported}
      namespace="languages"
      showDividers={true}
    />
  );
}
