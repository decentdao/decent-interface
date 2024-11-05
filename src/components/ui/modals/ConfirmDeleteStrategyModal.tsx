import { Button, Flex, Text } from '@chakra-ui/react';
import { WarningCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

export function ConfirmDeleteStrategyModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('settings');
  return (
    <Flex
      flexDirection="column"
      gap={6}
    >
      <Flex
        flexDirection="column"
        gap={4}
        justifyContent="center"
        alignItems="center"
      >
        <WarningCircle size={4} />
        <Text textStyle="display-xl">{t('areYouSure')}</Text>
      </Flex>
      <Flex
        flexDirection="column"
        gap={2}
      >
        <Button
          variant="primary"
          onClick={onClose}
        >
          {t('nevermind')}
        </Button>
        <Button
          variant="secondary"
          color="red-1"
          borderColor="red-1"
          _hover={{ color: 'red-0', borderColor: 'red-0' }}
        >
          {t('deletePermission')}
        </Button>
      </Flex>
    </Flex>
  );
}
