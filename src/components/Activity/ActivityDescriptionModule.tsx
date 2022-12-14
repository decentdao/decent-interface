import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { TxProposal } from '../../providers/Fractal/types';
import { ActivityAddress } from './ActivityAddress';

export function ActivityDescriptionModule({ activity }: { activity: TxProposal }) {
  const { t } = useTranslation();
  const moduleDescription = `Module executed ${activity.targets.length} transactions on`;
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="2"
    >
      <Text>{moduleDescription}</Text>
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
