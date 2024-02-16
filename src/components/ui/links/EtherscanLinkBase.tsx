import { Box, LinkProps } from '@chakra-ui/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ModalTooltip from '../modals/ModalTooltip';
import ExternalLink from './ExternalLink';

/**
 * The default link function for Etherscan links.
 *
 * Handles displaying the tooltip.
 */
export default function EtherscanBase({ children, ...rest }: LinkProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <Box ref={containerRef}>
      <ExternalLink {...rest}>
        <ModalTooltip
          label={t('etherscanTip')}
          placement="bottom"
          containerRef={containerRef}
        >
          {/* Box here allows multiple children to be wrapped by a single tooltip */}
          <Box>{children}</Box>
        </ModalTooltip>
      </ExternalLink>
    </Box>
  );
}
