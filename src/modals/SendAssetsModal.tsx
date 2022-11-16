import { Box, Button, Divider, Flex, Select, Spacer, Switch, Text } from '@chakra-ui/react';
import { Input, LabelWrapper } from '@decent-org/fractal-ui';
import { constants } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAddress from '../hooks/useAddress';
import { useFractal } from '../providers/fractal/hooks/useFractal';
import { formatCoinFromAsset, formatCoinUnitsFromAsset, formatUSD } from '../utils/numberFormats';

export function SendAssetsModal({ close }: { close: Function }) {
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation(['modals', 'common']);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [usdSelected, setUSDSelected] = useState<boolean>(false);
  const [amountInput, setAmountInput] = useState<string>('');
  const [destination, setDestination] = useState<string>('');

  const handleCoinChange = (value: string) => {
    const index = Number(value);
    if (Number(assetsFungible[index].fiatBalance) == 0) {
      setUSDSelected(false);
    }
    setSelectedIndex(index);
  };
  const handleAmountChange = (value: string) => {
    setAmountInput(value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'));
  };

  const [pending, setPending] = useState<boolean>(false);

  const selectedAsset = assetsFungible[selectedIndex];

  const calculateCoins = (fiatConversion: string, input: string, symbol?: string) => {
    if (!input) input = '0';
    const amount = Number(input) / Number(fiatConversion);
    return amount + ' ' + (symbol ? symbol : 'ETH');
  };
  const convertedTotal = usdSelected
    ? calculateCoins(selectedAsset.fiatConversion, amountInput, selectedAsset?.token?.symbol)
    : formatUSD(Number(amountInput) * Number(selectedAsset.fiatConversion));

  const normalizedAmount = formatCoinUnitsFromAsset(selectedAsset);
  console.log('blah -------');
  console.log('blah: ' + usdSelected);
  console.log('blah: ' + normalizedAmount);
  console.log('blah: ' + Number(amountInput));
  console.log('blah: ' + Number(selectedAsset.fiatBalance));

  const overDraft = usdSelected
    ? Number(amountInput) > Number(selectedAsset.fiatBalance)
    : Number(amountInput) > normalizedAmount;

  const [, validAddress] = useAddress(destination);
  const destinationError =
    validAddress === false ? t('errorInvalidAddress', { ns: 'common' }) : undefined;

  const submitDisabled: boolean =
    !destination || validAddress === false || !amountInput || overDraft;

  const onSubmit = () => {
    // TODO submit transaction
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
            <Text marginEnd="0.5rem">USD</Text>
            <Switch
              isDisabled={Number(selectedAsset.fiatBalance) == 0}
              size="md"
              isChecked={usdSelected}
              onChange={e => setUSDSelected(e.target.checked)}
            />
          </Flex>
          <Input
            size="base"
            width="full"
            placeholder="0.00"
            value={amountInput}
            onChange={e => handleAmountChange(e.target.value)}
          />
        </Box>
      </Flex>
      <Flex
        textStyle="text-sm-sans-regular"
        color="grayscale.500"
        marginTop="0.75rem"
      >
        <Text>
          {t('selectSublabel', {
            balance: formatCoinFromAsset(selectedAsset, false),
          })}
        </Text>
        <Spacer />
        <Text color={overDraft ? 'alert-red.normal' : 'grayscale.500'}>{convertedTotal}</Text>
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
