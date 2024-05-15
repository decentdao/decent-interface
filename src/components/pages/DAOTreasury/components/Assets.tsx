import {
  Box,
  Flex,
  Button,
  HStack,
  Image,
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
import { SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import useLidoStaking from '../../../../hooks/stake/lido/useLidoStaking';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import useSignerOrProvider from '../../../../hooks/utils/useSignerOrProvider';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { formatPercentage, formatUSD } from '../../../../utils/numberFormats';
import EtherscanLink from '../../../ui/links/EtherscanLink';
import { ModalType } from '../../../ui/modals/ModalProvider';
import { useFractalModal } from '../../../ui/modals/useFractalModal';
import Divider from '../../../ui/utils/Divider';
import { TokenDisplayData, useFormatCoins } from '../hooks/useFormatCoins';

function CoinHeader() {
  const { t } = useTranslation('treasury');
  return (
    <Box mb="1rem" minW="595px">
      <Show above="lg">
        <Divider
          my="1rem"
          variant="darker"
        />
      </Show>
      <HStack px={{ base: '1rem', lg: '1.5rem' }}>
        <Text
          w="35%"
          textStyle="label-small"
          color="neutral-7"
        >
          {t('columnCoins')}
        </Text>
        <Text
          w="35%"
          textStyle="label-small"
          color="neutral-7"
        >
          {t('columnValue')}
        </Text>
        <Text
          w="30%"
          textStyle="label-small"
          color="neutral-7"
        >
          {t('columnAllocation')}
        </Text>
      </HStack>
    </Box>
  );
}

function CoinRow({
  safe,
  totalFiat,
  asset,
}: {
  safe: string;
  totalFiat: number;
  asset: TokenDisplayData;
}) {
  return (
    <Flex
      my="0.5rem"
      justifyContent="space-between"
      px={{ base: '1rem', lg: '1.5rem' }}
      minW="595px"
    >
      <Flex
        w="35%"
        alignItems="flex-start"
      >
        <HStack>
          <Image
            src={asset.iconUri}
            fallbackSrc="/images/coin-icon-default.svg"
            alt={asset.symbol}
            w="1rem"
            h="1rem"
          />
          <Text
            height="auto"
            display="inline-flex"
            data-testid="link-token-symbol"
            noOfLines={2}
            width="100%"
            maxWidth="4.7rem"
            isTruncated
          >
            <EtherscanLink
              color="white-0"
              _hover={{ bg: 'transparent' }}
              textStyle="body-base"
              padding={0}
              borderWidth={0}
              value={asset.address === zeroAddress ? safe : asset.address}
              type="token"
            >
              {asset.symbol}
            </EtherscanLink>
          </Text>
        </HStack>
      </Flex>
      <Flex
        w="35%"
        alignItems="flex-start"
        flexWrap="wrap"
      >
        <Text
          maxWidth="23.8rem"
          width="100%"
          isTruncated
        >
          <Tooltip
            label={asset.fullCoinTotal}
            placement="top-start"
          >
            {asset.truncatedCoinTotal}
          </Tooltip>
        </Text>
        <Text
          textStyle="label-small"
          color="neutral-7"
          width="100%"
        >
          <Tooltip
            label={asset.fiatConversion}
            placement="top-start"
          >
            {formatUSD(asset.fiatValue)}
          </Tooltip>
        </Text>
      </Flex>
      <Flex
        w="30%"
        alignItems="flex-start"
      >
        <Text>{totalFiat > 0 && formatPercentage(asset.fiatValue, totalFiat)}</Text>
      </Flex>
    </Flex>
  );
}

function NFTHeader() {
  const { t } = useTranslation('treasury');
  return (
    <Box marginBottom="1rem" minW="595px">
      <Divider
        variant="darker"
        marginTop="0.75rem"
        marginBottom="1.5rem"
      />
      <Text
        w="25%"
        textStyle="label-small"
        color="neutral-7"
        px={{ base: '1rem', lg: '1.5rem' }}
      >
        {t('columnNFTs')}
      </Text>
    </Box>
  );
}

function NFTRow({ asset, isLast }: { asset: SafeCollectibleResponse; isLast: boolean }) {
  const image = asset.imageUri ? asset.imageUri : asset.logoUri;
  const name = asset.name ? asset.name : asset.tokenName;
  const id = asset.id.toString();

  return (
    <HStack
      marginBottom={isLast ? '0rem' : '1.5rem'}
      px={{ base: '1rem', lg: '1.5rem' }}
      minW="595px"
    >
      <Flex width="15%">
        <EtherscanLink
          type="token"
          value={asset.address}
          secondaryValue={id}
          data-testid="link-nft-image"
          padding={0}
          _hover={{ bg: 'transparent' }}
        >
          <Image
            src={image}
            fallbackSrc="/images/nft-image-default.svg"
            alt={name}
            w="3rem"
            h="3rem"
            marginRight="0.75rem"
          />
        </EtherscanLink>
      </Flex>
      <Flex width="65%">
        <EtherscanLink
          type="address"
          value={asset.address}
          _hover={{ bg: 'transparent' }}
          color="white-0"
          textStyle="body-base"
        >
          {name}
        </EtherscanLink>
      </Flex>
      <Flex width="25%">
        <EtherscanLink
          type="token"
          value={asset.address}
          secondaryValue={id}
          color="white-0"
          textStyle="body-base"
          _hover={{ bg: 'transparent' }}
          maxW="100%"
        >
          <Text as="span">{`#${id}`}</Text>
        </EtherscanLink>
      </Flex>
    </HStack>
  );
}

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
    <Box mt={{ base: '1rem', lg: 0 }} w="full">
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
        <>
          <Divider my="1rem" />
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
        </>
      )}
      {hasAssets && (
        <>
          <Hide above="lg">
            <Accordion
              allowMultiple
              index={expandedIndecies}
            >
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
                    <AccordionPanel p={0}>
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
                  </Box>
                )}
              </AccordionItem>
              <AccordionItem
                borderTop="none"
                borderBottom="none"
              >
                {({ isExpanded }) => (
                  <Box>
                    <AccordionButton
                      onClick={() => toggleAccordionItem(1)}
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
                    <AccordionPanel p={0}>
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
