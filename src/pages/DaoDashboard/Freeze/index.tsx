import { Box, Button, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Alert from '../../../components/ui/svg/Alert';
import { ActionCard } from '../Activities/ActionCard';

export function Freeze() {
  const { t } = useTranslation('dashboard');
  return (
    <Box>
      <Flex
        flexDirection="column"
        gap="1rem"
        my="1rem"
      >
        <ActionCard
          Badge={'Freeze Initiated'}
          LeftElement={<Alert bgColor="#0085FF" />}
          RightElement={
            <Button
              variant="text"
              size="lg"
              px="0px"
            >
              {'Freeze DAO'}
            </Button>
          }
          eventDate={'4 days remaining'}
          borderColor="#0085FF"
        />
      </Flex>
    </Box>
  );
}
