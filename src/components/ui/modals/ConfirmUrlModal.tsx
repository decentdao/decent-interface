import { Box, Button, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export function ConfirmUrlModal({ url, close }: { url: string; close: () => void }) {
  const { t } = useTranslation('modals');
  return (
    <Box>
      <Text
        paddingBottom="1rem"
        color="chocolate.200"
      >
        {url}
      </Text>
      <Text>{t('confirmUrlSubtitle')}</Text>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        <Button
          marginTop="2rem"
          width="100%"
          onClick={close}
        >
          {t('confirmUrlSubmit')}
        </Button>
      </a>
    </Box>
  );
}
