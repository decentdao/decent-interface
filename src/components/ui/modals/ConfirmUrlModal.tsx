import { Box, Button, Divider, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export function ConfirmUrlModal({ url, close }: { url: string; close: () => void }) {
  const { t } = useTranslation('modals');
  return (
    <Box>
      <Text
        marginBottom="1rem"
        color="chocolate.200"
      >
        {url}
      </Text>
      <Divider
        color="chocolate.700"
        marginBottom="1rem"
      />
      <Text marginBottom="1rem">{t('confirmUrlSubtitle')}</Text>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        <Button
          width="100%"
          onClick={close}
        >
          {t('modalContinue')}
        </Button>
      </a>
      <Button
        marginTop="0.5rem"
        width="100%"
        variant="tertiary"
        onClick={close}
      >
        {t('modalCancel')}
      </Button>
    </Box>
  );
}
