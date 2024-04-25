import { Box, Hide, Text, Flex } from '@chakra-ui/react';
import { GlobeSimple } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { OptionMenu } from '../components/ui/menus/OptionMenu';
import { supportedLanguages } from '.';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('languages');

  const supported = Object.keys(supportedLanguages).map(function (languageCode) {
    return {
      optionKey: languageCode,
      onClick: () => i18n.changeLanguage(languageCode),
    };
  });
  return (
    <OptionMenu
      offset={[16, 8]}
      trigger={
        <Flex>
          <GlobeSimple size={24} />
          <Box ml={3}>{t('tooltipTitle')}</Box>
          <Hide above="md">
            <Text textStyle="text-md-mono-medium">{t(i18n.language.slice(0, 2))}</Text>
          </Hide>
        </Flex>
      }
      options={supported}
      namespace="languages"
    />
  );
}
