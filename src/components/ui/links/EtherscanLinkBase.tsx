import { Link, LinkProps, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

/**
 * The default link function for Etherscan links.
 *
 * Handles displaying the tooltip.
 */
export default function EtherscanBase({ children, ...rest }: LinkProps) {
  const { t } = useTranslation();
  return (
    <Link
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: 'none' }}
      {...rest}
    >
      <Tooltip
        label={t('etherscanTip')}
        placement="bottom"
      >
        {children}
      </Tooltip>
    </Link>
  );
}
