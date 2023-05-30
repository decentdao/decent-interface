import { LinkProps, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ExternalLink from './ExternalLink';

/**
 * The default link function for Etherscan links.
 *
 * Handles displaying the tooltip.
 */
export default function EtherscanBase({ children, ...rest }: LinkProps) {
  const { t } = useTranslation();
  return (
    <ExternalLink {...rest}>
      <Tooltip
        label={t('etherscanTip')}
        placement="bottom"
      >
        {children}
      </Tooltip>
    </ExternalLink>
  );
}
