import { Box, Flex, LinkProps } from '@chakra-ui/react';
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
    <ExternalLink {...rest}>
      <Box ref={containerRef}>
        <ModalTooltip
          label={t('etherscanTip')}
          placement="bottom"
          containerRef={containerRef}
        >
          {/* Flex here allows multiple children to be wrapped by a single tooltip */}
          <Flex
            alignItems="center"
            maxW="calc(100% - 2px)"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {children}
          </Flex>
        </ModalTooltip>
      </Box>
    </ExternalLink>
  );
}
