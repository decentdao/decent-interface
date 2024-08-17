import { Button, HStack, Text, Tooltip, Show, Divider } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useTreasuryLidoInteractions from '../hooks/useTreasuryLidoInteractions';

export default function LidoButtons() {
  const {
    showStakeButton,
    showUnstakeButton,
    showClaimETHButton,
    openStakingModal,
    handleUnstakeButtonClick,
    handleClickClaimButton,
    isLidoClaimable,
  } = useTreasuryLidoInteractions();
  const { t } = useTranslation('treasury');

  return (
    <>
      {' '}
      {(showStakeButton || showUnstakeButton || showClaimETHButton) && (
        <Show above="lg">
          <Divider
            variant="darker"
            my="1rem"
          />
          <Text
            textStyle="label-small"
            color="neutral-7"
            my="1rem"
            px={{ base: '1rem', lg: '1.5rem' }}
          >
            {t('subtitleStaking')}
          </Text>
          <HStack px={{ base: '1rem', lg: '1.5rem' }}>
            {showStakeButton && (
              <Button
                size="sm"
                onClick={openStakingModal}
              >
                {t('stake')}
              </Button>
            )}
            {showUnstakeButton && (
              <Button
                size="sm"
                onClick={handleUnstakeButtonClick}
              >
                {t('unstake')}
              </Button>
            )}
            {showClaimETHButton && (
              <Tooltip label={!isLidoClaimable ? t('nonClaimableYet') : ''}>
                <Button
                  size="sm"
                  isDisabled={!isLidoClaimable}
                  onClick={handleClickClaimButton}
                >
                  {t('claimUnstakedETH')}
                </Button>
              </Tooltip>
            )}
          </HStack>
        </Show>
      )}
    </>
  );
}
