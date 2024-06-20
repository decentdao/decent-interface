import {
  Box,
  Flex,
  Button,
  HStack,
  Text,
  Tooltip,
  Show,
  Hide,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react';
import { getWithdrawalQueueContract } from '@lido-sdk/contracts';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useLidoStaking from '../../../../hooks/stake/lido/useLidoStaking';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import useSignerOrProvider from '../../../../hooks/utils/useSignerOrProvider';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { formatUSD } from '../../../../utils/numberFormats';
import { ModalType } from '../../../ui/modals/ModalProvider';
import { useFractalModal } from '../../../ui/modals/useFractalModal';
import Divider from '../../../ui/utils/Divider';
import { useFormatCoins } from '../hooks/useFormatCoins';
import { CoinHeader, CoinRow } from './AssetCoin';
import { NFTHeader, NFTRow } from './AssetNFT';

export function Assets() {
  const {
    node: { daoAddress },
    treasury: { assetsFungible, assetsNonFungible },
  } = useFractal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { staking } = useNetworkConfig();
  const { t } = useTranslation('treasury');
  const coinDisplay = useFormatCoins(assetsFungible);
  const ethAsset = assetsFungible.find(asset => !asset.tokenAddress);
  const { handleUnstake, handleClaimUnstakedETH } = useLidoStaking();
  const [expandedIndecies, setExpandedIndecies] = useState<number[]>([]);

  // --- Lido Stake button setup ---
  const showStakeButton =
    canUserCreateProposal &&
    Object.keys(staking).length > 0 &&
    ethAsset &&
    BigInt(ethAsset.balance) > 0n;
  const openStakingModal = useFractalModal(ModalType.STAKE);

  // --- Lido Unstake button setup ---
  const stETHAsset = coinDisplay.displayData.find(
    asset => asset.address === staking?.lido?.stETHContractAddress,
  );
  const showUnstakeButton = canUserCreateProposal && staking.lido && stETHAsset;
  const handleUnstakeButtonClick = () => {
    handleUnstake(stETHAsset!.rawValue);
  };

  // --- Lido Claim ETH button setup ---
  const signerOrProvider = useSignerOrProvider();
  const [isLidoClaimable, setIsLidoClaimable] = useState(false);
  const lidoWithdrawelNFT = assetsNonFungible.find(
    asset => asset.address === staking.lido?.withdrawalQueueContractAddress,
  );
  const showClaimETHButton = canUserCreateProposal && staking.lido && lidoWithdrawelNFT;
  useEffect(() => {
    const getLidoClaimableStatus = async () => {
      if (
        !staking.lido?.withdrawalQueueContractAddress ||
        !lidoWithdrawelNFT ||
        !signerOrProvider
      ) {
        return;
      }
      const withdrawalQueueContract = getWithdrawalQueueContract(
        staking.lido.withdrawalQueueContractAddress,
        signerOrProvider,
      );
      const claimableStatus = (
        await withdrawalQueueContract.getWithdrawalStatus([lidoWithdrawelNFT!.id])
      )[0]; // Since we're checking for the single NFT - we can grab first array element
      if (claimableStatus.isFinalized !== isLidoClaimable) {
        setIsLidoClaimable(claimableStatus.isFinalized);
      }
    };

    getLidoClaimableStatus();
  }, [staking, isLidoClaimable, signerOrProvider, lidoWithdrawelNFT]);
  const handleClickClaimButton = () => {
    handleClaimUnstakedETH(BigInt(lidoWithdrawelNFT!.id));
  };

  const hasAssets = coinDisplay.displayData.length > 0 || assetsNonFungible.length > 0;
  const toggleAccordionItem = (index: number) => {
    setExpandedIndecies(indexArray => {
      if (indexArray.includes(index)) {
        const newArr = [...indexArray];
        newArr.splice(newArr.indexOf(index), 1);
        return newArr;
      } else {
        return [...indexArray, index];
      }
    });
  };

  return (
    <Box
      mt={{ base: '1rem', lg: 0 }}
      w="full"
    >
      <Text
        textStyle="label-small"
        color="neutral-7"
        px={{ base: '1rem', lg: '1.5rem' }}
      >
        {t('subtitleCoinBalance')}
      </Text>
      <Text
        data-testid="text-usd-total"
        px={{ base: '1rem', lg: '1.5rem' }}
      >
        {formatUSD(coinDisplay.totalFiatValue)}
      </Text>
      <Hide above="lg">
        <Divider
          variant="darker"
          my="1rem"
        />
      </Hide>
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
      {hasAssets && (
        <>
          <Hide above="lg">
            <Accordion
              allowMultiple
              index={expandedIndecies}
            >
              {coinDisplay.displayData.length > 0 && (
                <AccordionItem
                  borderTop="none"
                  borderBottom="none"
                >
                  {({ isExpanded }) => (
                    <Box>
                      <AccordionButton
                        onClick={() => toggleAccordionItem(0)}
                        p="0.25rem"
                        textStyle="body-base"
                        color="white-0"
                        ml="0.75rem"
                      >
                        <Flex
                          alignItems="center"
                          gap={2}
                        >
                          {isExpanded ? <CaretDown /> : <CaretRight />}
                          {t('columnCoins')}
                        </Flex>
                      </AccordionButton>
                      <Divider
                        variant="darker"
                        my="1rem"
                      />
                      <AccordionPanel
                        p={0}
                        overflowX={{ base: 'auto', md: undefined }}
                        className="scroll-dark"
                      >
                        <CoinHeader />
                        {coinDisplay.displayData.map((coin, index) => {
                          return (
                            <CoinRow
                              key={index}
                              safe={daoAddress!}
                              totalFiat={coinDisplay.totalFiatValue}
                              asset={coin}
                            />
                          );
                        })}
                      </AccordionPanel>
                      {isExpanded && (
                        <Divider
                          variant="darker"
                          my="1rem"
                        />
                      )}
                    </Box>
                  )}
                </AccordionItem>
              )}
              {assetsNonFungible.length > 0 && (
                <AccordionItem
                  borderTop="none"
                  borderBottom="none"
                >
                  {({ isExpanded }) => (
                    <Box>
                      <AccordionButton
                        onClick={() =>
                          toggleAccordionItem(coinDisplay.displayData.length > 0 ? 1 : 0)
                        }
                        p="0.25rem"
                        textStyle="body-base"
                        color="white-0"
                        ml="0.75rem"
                      >
                        <Flex
                          alignItems="center"
                          gap={2}
                        >
                          {isExpanded ? <CaretDown /> : <CaretRight />}
                          {t('columnNFTs')}
                        </Flex>
                      </AccordionButton>
                      <AccordionPanel
                        p={0}
                        overflowX={{ base: 'auto', md: undefined }}
                        className="scroll-dark"
                      >
                        <NFTHeader />
                        {assetsNonFungible.map((asset, index) => (
                          <NFTRow
                            key={index}
                            asset={asset}
                            isLast={assetsNonFungible[assetsNonFungible.length - 1] === asset}
                          />
                        ))}
                      </AccordionPanel>
                    </Box>
                  )}
                </AccordionItem>
              )}
            </Accordion>
          </Hide>
          <Show above="lg">
            {coinDisplay.displayData.length > 0 && <CoinHeader />}
            {coinDisplay.displayData.map((coin, index) => {
              return (
                <CoinRow
                  key={index}
                  safe={daoAddress!}
                  totalFiat={coinDisplay.totalFiatValue}
                  asset={coin}
                />
              );
            })}
            {assetsNonFungible.length > 0 && <NFTHeader />}
            {assetsNonFungible.map((asset, index) => (
              <NFTRow
                key={index}
                asset={asset}
                isLast={assetsNonFungible[assetsNonFungible.length - 1] === asset}
              />
            ))}
          </Show>
        </>
      )}
    </Box>
  );
}
