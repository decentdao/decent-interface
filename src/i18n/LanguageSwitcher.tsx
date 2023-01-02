import { Center } from '@chakra-ui/react';
import { Globe } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { OptionMenu } from '../components/ui/menus/OptionMenu';
import { supportedLanguages } from '.';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const supported = Object.keys(supportedLanguages).map(function (languageCode) {
    return {
      optionKey: languageCode,
      onClick: () => i18n.changeLanguage(languageCode),
    };
  });

  return (
    <Center>
      <OptionMenu
        offset={[16, 8]}
        trigger={
          <Globe
            boxSize="1.5rem"
            minWidth="auto"
          />
        }
        options={supported}
        namespace="languages"
        tooltipKey="tooltipTitle"
        showDividers
      />
    </Center>
  );
}
