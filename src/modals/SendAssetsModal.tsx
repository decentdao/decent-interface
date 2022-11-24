import { Box, Divider, Flex, Select, Spacer, Switch, Text } from '@chakra-ui/react';
import { Button, Input, LabelWrapper, RestrictCharTypes } from '@decent-org/fractal-ui';
import { constants } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAddress from '../hooks/utlities/useAddress';
import useSendAssets from '../pages/Treasury/hooks/useSendAssets';
import { useFractal } from '../providers/fractal/hooks/useFractal';
import { formatCoinFromAsset, formatCoinUnitsFromAsset, formatUSD } from '../utils/numberFormats';

export function SendAssetsModal({ close }: { close: () => void }) {
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation(['modals', 'common']);

  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number>(0);
  const [usdSelected, setUSDSelected] = useState<boolean>(false);
  const [amountInput, setAmountInput] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const selectedAsset = assetsFungible[selectedAssetIndex];
  const sendAssets = useSendAssets({
    normalizedBalance: amountInput,
    asset: selectedAsset,
    destinationAddress: destination,
  });

  const handleCoinChange = (value: string) => {
    const index = Number(value);
    if (Number(assetsFungible[index].fiatBalance) === 0) {
      setUSDSelected(false);
    }
    setSelectedAssetIndex(index);
  };

  const calculateCoins = (fiatConversion: string, input: string, symbol?: string) => {
    if (!input) input = '0';
    const amount = Number(input) / Number(fiatConversion);
    return amount + ' ' + (symbol ? symbol : 'ETH');
  };

  const convertedTotal = usdSelected
    ? calculateCoins(selectedAsset.fiatConversion, amountInput, selectedAsset?.token?.symbol)
    : formatUSD(Number(amountInput) * Number(selectedAsset.fiatConversion));

  const [, validAddress] = useAddress(destination);
  const destinationError =
    validAddress === false ? t('errorInvalidAddress', { ns: 'common' }) : undefined;

  const overDraft = usdSelected
    ? Number(amountInput) > Number(selectedAsset.fiatBalance)
    : Number(amountInput) > formatCoinUnitsFromAsset(selectedAsset);

  const submitDisabled: boolean =
    !destination || validAddress === false || !amountInput || overDraft;

  const onSubmit = () => {
    sendAssets();
    close();
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
              color={Number(selectedAsset.fiatBalance) === 0 ? 'grayscale.800' : 'grayscale.500'}
            >
              USD
            </Text>
            <Switch
              bg="input.background"
              borderRadius="28px"
              color="white"
              colorScheme="drab"
              isDisabled={Number(selectedAsset.fiatBalance) === 0}
              size="md"
              isChecked={usdSelected}
              onChange={e => setUSDSelected(e.target.checked)}
            />
          </Flex>
          <Input
            size="base"
            width="full"
            placeholder="0"
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            value={amountInput}
            onChange={e => setAmountInput(e.target.value)}
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
        {Number(selectedAsset.fiatBalance) > 0 && <Text>{convertedTotal}</Text>}
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
          size="base"
          width="full"
          placeholder={constants.AddressZero}
          value={destination}
          onChange={e => setDestination(e.target.value)}
        />
      </LabelWrapper>
      <Button
        marginTop="2rem"
        width="100%"
        disabled={submitDisabled}
        onClick={onSubmit}
      >
        {t('sendAssetsSubmit')}
      </Button>
    </Box>
  );
}
