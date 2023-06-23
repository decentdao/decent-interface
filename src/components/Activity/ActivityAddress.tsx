import { useTranslation } from 'react-i18next';
import useDisplayName from '../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from '../ui/links/EtherscanLinkAddress';

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
    <EtherscanLinkAddress address={address}>
      {displayName}
      {isMe && t('isMeSuffix')}
      {addComma && ', '}
    </EtherscanLinkAddress>
  );
}
