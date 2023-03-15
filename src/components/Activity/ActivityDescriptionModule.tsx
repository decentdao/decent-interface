import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { TxProposal } from '../../types';
import { ActivityAddress } from './ActivityAddress';

export function ActivityDescriptionModule({ activity }: { activity: TxProposal }) {
  const { t } = useTranslation(['treasury', 'dashboard']);
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="2"
      flexWrap="wrap"
    >
      <Text>{t('moduleDescription', { ns: 'dashboard', count: activity.targets.length })}</Text>
      {activity.targets.length > 2 ? (
        <Text>
          {t('addresses', {
            ns: 'treasury',
            numOfAddresses: activity.targets.length,
          })}
        </Text>
      ) : (
        activity.targets.map((address, i, arr) => (
          <ActivityAddress
            key={address + i}
            address={address}
            addComma={i !== arr.length - 1}
          />
        ))
      )}
    </Flex>
  );
}
