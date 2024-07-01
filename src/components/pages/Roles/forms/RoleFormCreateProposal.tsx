import { Box, Button, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export default function RoleFormCreateProposal({}) {
  const { t } = useTranslation(['modals', 'common']);
  return (
    <Box>
      <Box bg="neutral-2"></Box>
      <Flex gap="1rem">
        <Button variant="tertiary">{t('cancel', { ns: 'common' })}</Button>
        <Button type="submit">{t('sendAssetsSubmit')}</Button>
      </Flex>
    </Box>
  );
}
