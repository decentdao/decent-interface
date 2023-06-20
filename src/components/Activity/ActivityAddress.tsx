import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useDisplayName from '../../hooks/utils/useDisplayName';

export function ActivityAddress({
  address,
  isMe = false,
  addComma,
}: {
  address: string;
  isMe?: boolean;
  addComma?: boolean;
}) {
  const { displayName } = useDisplayName(address);
  const { t } = useTranslation();
  return (
    <Text>
      {displayName}
      {isMe && t('isMeSuffix')}
      {addComma && ', '}
    </Text>
  );
}
