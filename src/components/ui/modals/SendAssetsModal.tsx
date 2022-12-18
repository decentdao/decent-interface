import { Box, Divider, Flex, Select, Spacer, Switch, Text, Button, Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { constants, BigNumber } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAddress from '../../../hooks/utils/useAddress';
import useSendAssets from '../../../pages/Treasury/hooks/useSendAssets';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import {
  formatCoinFromAsset,
  formatCoinUnitsFromAsset,
  formatUSD,
} from '../../../utils/numberFormats';
import { BigNumberInput, BigNumberValuePair } from '../BigNumberInput/BigNumberInput';

export function SendAssetsModal({ close }: { close: () => void }) {
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation(['modals', 'common']);

  const [selectedAsset, setSelectedAsset] = useState<SafeBalanceUsdResponse>(assetsFungible[0]);
  const [usdSelected, setUSDSelected] = useState<boolean>(false);
  const [inputAmount, setInputAmount] = useState<BigNumberValuePair>();
  const [destination, setDestination] = useState<string>('');

  const hasFiatBalance = Number(selectedAsset.fiatBalance) > 0;

  const calculateCoins = (fiatConversion: string, input: string, symbol?: string) => {
    const amount = Number(input) / Number(fiatConversion);
    return amount + ' ' + (symbol ? symbol : 'ETH');
  };

  const convertedTotal = usdSelected
    ? calculateCoins(
        selectedAsset.fiatConversion,
        inputAmount?.value || '0',
        selectedAsset?.token?.symbol
      )
    : formatUSD(Number(inputAmount?.value || 0) * Number(selectedAsset.fiatConversion));

  const sendAssets = useSendAssets({
    transferAmount: inputAmount?.bigNumberValue || BigNumber.from('0'),
    asset: selectedAsset,
    destinationAddress: destination,
  });

  const handleCoinChange = (value: string) => {
    setSelectedAsset(assetsFungible[Number(value)]);
    if (hasFiatBalance) {
      setUSDSelected(false);
    }
  };

  const { isValidAddress } = useAddress(destination.toLowerCase());
  const destinationError =
    destination && !isValidAddress ? t('errorInvalidAddress', { ns: 'common' }) : undefined;

  const overDraft = usdSelected
    ? Number(inputAmount?.value || '0') > Number(selectedAsset.fiatBalance)
    : Number(inputAmount?.value || '0') > formatCoinUnitsFromAsset(selectedAsset);

  const isSubmitDisabled = !isValidAddress || inputAmount?.bigNumberValue.isZero() || overDraft;

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
            {assetsFungible.map(asset => (
              <option
                key={asset.token ? asset.token.symbol : 'eth'}
                value={assetsFungible.indexOf(asset)}
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
            <Spacer />
            <Text
              marginEnd="0.5rem"
              color={!hasFiatBalance ? 'grayscale.800' : 'grayscale.500'}
            >
              USD
            </Text>
            <Switch
              bg="input.background"
              borderRadius="28px"
              color="white"
              colorScheme="drab"
              isDisabled //TODO: enable USD switch to change inputAmount from token to USD. currently disabled.
              size="md"
              isChecked={usdSelected}
              onChange={e => setUSDSelected(e.target.checked)}
            />
          </Flex>

          <BigNumberInput
            value={inputAmount}
            onChange={e => setInputAmount(e)}
            decimalPlaces={selectedAsset?.token?.decimals}
            placeholder="0"
          />
        </Box>
      </Flex>
      <Flex
        textStyle="text-sm-sans-regular"
        color="grayscale.500"
        marginTop="0.75rem"
      >
        <Text color={overDraft ? 'alert-red.normal' : 'grayscale.500'}>
          {t('selectSublabel', {
            balance: formatCoinFromAsset(selectedAsset, false),
          })}
        </Text>
        <Spacer />
        {hasFiatBalance && <Text>{convertedTotal}</Text>}
      </Flex>
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
          placeholder={constants.AddressZero}
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
