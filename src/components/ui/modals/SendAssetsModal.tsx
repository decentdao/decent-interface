import { Box, Divider, Flex, Select, HStack, Text, Button, Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ETH_ADDRESS_PLACEHOLDER } from '../../../constants/common';
import useAddress from '../../../hooks/utils/useAddress';
import useSendAssets from '../../../pages/Treasury/hooks/useSendAssets';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import {
  formatCoinFromAsset,
  formatCoinUnitsFromAsset,
  formatUSD,
} from '../../../utils/numberFormats';
import { BigNumberInput, BigNumberValuePair } from '../BigNumberInput';

export function SendAssetsModal({ close }: { close: () => void }) {
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation(['modals', 'common']);

  const fungibleAssetsWithBalance = assetsFungible.filter(asset => parseFloat(asset.balance) > 0);

  const [selectedAsset, setSelectedAsset] = useState<SafeBalanceUsdResponse>(
    fungibleAssetsWithBalance[0]
  );
  const [inputAmount, setInputAmount] = useState<BigNumberValuePair>();
  const [destination, setDestination] = useState<string>('');

  const hasFiatBalance = Number(selectedAsset.fiatBalance) > 0;

  const convertedTotal = formatUSD(
    Number(inputAmount?.value || '0') * Number(selectedAsset.fiatConversion)
  );

  const sendAssets = useSendAssets({
    transferAmount: inputAmount?.bigNumberValue || BigNumber.from(0),
    asset: selectedAsset,
    destinationAddress: destination,
  });

  const handleCoinChange = (index: string) => {
    setSelectedAsset(fungibleAssetsWithBalance[Number(index)]);
  };

  const onChangeAmount = (value: BigNumberValuePair) => {
    setInputAmount(value);
  };

  const { isValidAddress } = useAddress(destination.toLowerCase());
  const destinationError =
    destination && !isValidAddress ? t('errorInvalidAddress', { ns: 'common' }) : undefined;

  const overDraft = Number(inputAmount?.value || '0') > formatCoinUnitsFromAsset(selectedAsset);

  const isSubmitDisabled = !isValidAddress || inputAmount?.bigNumberValue?.isZero() || overDraft;

  const onSubmit = () => {
    sendAssets();
    if (close) close();
  };

  return (
    <Box>
      <Flex>
        <Box
          width="40%"
          marginEnd="0.75rem"
        >
          <Text marginBottom="0.5rem">{t('selectLabel')}</Text>
          <Select
            variant="outline"
            bg="input.background"
            borderColor="black.200"
            borderWidth="1px"
            borderRadius="4px"
            color="white"
            onChange={e => handleCoinChange(e.target.value)}
            sx={{ '> option, > optgroup': { bg: 'input.background' } }} //TODO: This should be added to baseStyle of the theme?
          >
            {fungibleAssetsWithBalance.map((asset, index) => (
              <option
                key={index}
                value={index}
              >
                {asset.token ? asset.token.symbol : 'ETH'}
              </option>
            ))}
          </Select>
        </Box>
        <Box width="60%">
          <Flex
            alignItems="center"
            marginBottom="0.5rem"
          >
            <Text>{t('amountLabel')}</Text>
          </Flex>
          <BigNumberInput
            value={inputAmount?.bigNumberValue}
            onChange={onChangeAmount}
            decimalPlaces={selectedAsset?.token?.decimals}
            placeholder="0"
          />
        </Box>
      </Flex>
      <HStack
        justify="space-between"
        textStyle="text-sm-sans-regular"
        color="grayscale.500"
        marginTop="0.75rem"
      >
        <Text color={overDraft ? 'alert-red.normal' : 'grayscale.500'}>
          {t('selectSublabel', {
            balance: formatCoinFromAsset(selectedAsset, false),
          })}
        </Text>
        {hasFiatBalance && <Text>{convertedTotal}</Text>}
      </HStack>
      <Text
        textStyle="text-sm-sans-regular"
        color="grayscale.500"
      >
        {formatUSD(selectedAsset.fiatBalance)}
      </Text>
      <Divider
        color="chocolate.700"
        marginTop="0.75rem"
        marginBottom="0.75rem"
      />
      <LabelWrapper
        label={t('destinationLabel')}
        subLabel={t('destinationSublabel')}
        errorMessage={destinationError}
      >
        <Input
          type="text"
          placeholder={ETH_ADDRESS_PLACEHOLDER}
          value={destination}
          onChange={e => setDestination(e.target.value)}
        />
      </LabelWrapper>
      <Button
        marginTop="2rem"
        width="100%"
        disabled={isSubmitDisabled}
        onClick={onSubmit}
      >
        {t('sendAssetsSubmit')}
      </Button>
    </Box>
  );
}
