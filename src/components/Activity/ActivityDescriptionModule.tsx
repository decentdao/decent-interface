import { Box, Flex, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/App/AppProvider';
import { ActivityEventType, FractalProposal } from '../../types';
import { DEFAULT_DATE_FORMAT } from '../../utils';
import { ActivityAddress } from './ActivityAddress';

export function ActivityDescriptionModule({ activity }: { activity: FractalProposal }) {
  const { t } = useTranslation(['treasury', 'dashboard', 'common']);

  const {
    node: { daoAddress },
  } = useFractal();
  const eventDateLabel = t(
    activity.eventType === ActivityEventType.Treasury
      ? activity.transaction?.to === daoAddress
        ? 'received'
        : 'sent'
      : 'created',
  );
  return (
    <Box
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
    >
      <Flex
        flexWrap="wrap"
        gap={2}
      >
        <Box>{t('moduleDescription', { ns: 'dashboard', count: activity.targets.length })}</Box>
        <Box>
          {activity.targets.length > 2
            ? t('addresses', {
                ns: 'treasury',
                numOfAddresses: activity.targets.length,
              })
            : activity.targets.map((address, i, arr) => (
                <ActivityAddress
                  key={address + i}
                  address={address}
                  addComma={i !== arr.length - 1}
                />
              ))}
        </Box>
      </Flex>
      <Box>
        {activity.eventDate && (
          <Text
            mt={2}
            textStyle="text-base-sans-regular"
            color="#838383"
          >
            {eventDateLabel} {format(activity.eventDate, DEFAULT_DATE_FORMAT)}
          </Text>
        )}
      </Box>
    </Box>
  );
}
