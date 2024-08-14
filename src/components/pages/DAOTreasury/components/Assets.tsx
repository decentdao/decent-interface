import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Hide,
  HStack,
  Show,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { getWithdrawalQueueContract } from '@lido-sdk/contracts';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLidoStaking from '../../../../hooks/stake/lido/useLidoStaking';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import useSignerOrProvider from '../../../../hooks/utils/useSignerOrProvider';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { formatUSD } from '../../../../utils/numberFormats';
import { ModalType } from '../../../ui/modals/ModalProvider';
import { useDecentModal } from '../../../ui/modals/useDecentModal';
import Divider from '../../../ui/utils/Divider';
import { CoinHeader, CoinRow } from './AssetCoin';
import { NFTHeader, NFTRow } from './AssetNFT';

export function Assets() {
  const {
    node: { daoAddress },
    treasury: { assetsFungible, assetsNonFungible, totalUsdValue },
  } = useFractal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { staking } = useNetworkConfig();
  const { t } = useTranslation('treasury');
  const ethAsset = assetsFungible.find(asset => !asset.tokenAddress);
  const { handleUnstake, handleClaimUnstakedETH } = useLidoStaking();
  const [expandedIndecies, setExpandedIndecies] = useState<number[]>([]);

  // --- Lido Stake button setup ---
  const showStakeButton =
    canUserCreateProposal &&
    Object.keys(staking).length > 0 &&
    ethAsset &&
    BigInt(ethAsset.balance) > 0n;
  const openStakingModal = useDecentModal(ModalType.STAKE);

  // --- Lido Unstake button setup ---
  const stETHAsset = assetsFungible.find(
    asset => asset.tokenAddress === staking?.lido?.stETHContractAddress,
  );
  const showUnstakeButton = canUserCreateProposal && staking.lido && stETHAsset;
  const handleUnstakeButtonClick = () => {
    if (stETHAsset) {
      handleUnstake(stETHAsset.balance);
    }
  };

  // --- Lido Claim ETH button setup ---
  const signerOrProvider = useSignerOrProvider();
  const [isLidoClaimable, setIsLidoClaimable] = useState(false);
  const lidoWithdrawelNFT = assetsNonFungible.find(
    asset => asset.tokenAddress === staking.lido?.withdrawalQueueContractAddress,
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
        await withdrawalQueueContract.getWithdrawalStatus([lidoWithdrawelNFT!.tokenId])
      )[0]; // Since we're checking for the single NFT - we can grab first array element
      if (claimableStatus.isFinalized !== isLidoClaimable) {
        setIsLidoClaimable(claimableStatus.isFinalized);
      }
    };

    getLidoClaimableStatus();
  }, [staking, isLidoClaimable, signerOrProvider, lidoWithdrawelNFT]);
  const handleClickClaimButton = () => {
    handleClaimUnstakedETH(BigInt(lidoWithdrawelNFT!.tokenId));
  };

  const hasAssets = assetsFungible.length > 0 || assetsNonFungible.length > 0;
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
    <Box mt={{ base: '1rem', lg: 0 }}>
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
        {formatUSD(totalUsdValue)}
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
      {hasAssets && daoAddress && (
        <>
          <Show below="lg">
            <Accordion
              allowMultiple
              index={expandedIndecies}
            >
              {assetsFungible.length > 0 && (
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
                        overflowX="auto"
                        className="scroll-dark"
                      >
                        <CoinHeader />
                        {assetsFungible.map((coin, index) => {
                          return (
                            <CoinRow
                              key={index}
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
                        onClick={() => toggleAccordionItem(assetsFungible.length > 0 ? 1 : 0)}
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
                        overflowX="auto"
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
          </Show>
          <Show above="lg">
            {assetsFungible.length > 0 && <CoinHeader />}
            {assetsFungible.map((coin, index) => {
              return (
                <CoinRow
                  key={index}
                  asset={coin}
                />
              );
            })}
            {assetsNonFungible.length > 0 && <NFTHeader />}
            {assetsNonFungible.map((asset, index) => (
              <NFTRow
                key={index}
                asset={asset}
                isLast={index === assetsNonFungible.length - 1}
              />
            ))}
          </Show>
        </>
      )}
    </Box>
  );
}
