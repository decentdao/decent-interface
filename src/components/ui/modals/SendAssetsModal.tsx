import {
  Box,
  Divider,
  Flex,
  Select,
  Spacer,
  Switch,
  Text,
  Button,
  Input,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { constants, BigNumber, utils } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAddress from '../../../hooks/utils/useAddress';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import useSendAssets from '../../../pages/Treasury/hooks/useSendAssets';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import {
  formatCoinFromAsset,
  formatCoinUnitsFromAsset,
  formatUSD,
} from '../../../utils/numberFormats';

export function SendAssetsModal({ close }: { close: () => void }) {
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation(['modals', 'common']);

  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number>(0);
  const [usdSelected, setUSDSelected] = useState<boolean>(false);
  const [amountInput, setAmountInput] = useState<string>();
  const [destination, setDestination] = useState<string>('');
  const selectedAsset = assetsFungible[selectedAssetIndex];

  const isEth = (asset: SafeBalanceUsdResponse) => {
    return asset && !asset.token;
  };

  const calculateCoins = (fiatConversion: string, input: string, symbol?: string) => {
    if (!input) input = '0';
    const amount = Number(input) / Number(fiatConversion);
    return amount + ' ' + (symbol ? symbol : 'ETH');
  };

  const convertedTotal = usdSelected
    ? calculateCoins(selectedAsset.fiatConversion, amountInput || '0', selectedAsset?.token?.symbol)
    : formatUSD(Number(amountInput) * Number(selectedAsset.fiatConversion));

  const transferAmount = () => {
    //the input is not validating the amountInput so this try catch is here for now to prevent a UI error
    // TODO remove once we have proper validation on the input
    try {
      return utils.parseUnits(
        usdSelected
          ? (Number(amountInput || '0') / Number(selectedAsset.fiatConversion)).toString()
          : amountInput || '0',
        isEth(selectedAsset) ? 18 : selectedAsset.token.decimals
      );
    } catch {
      return BigNumber.from('0');
    }
  };

  const sendAssets = useSendAssets({
    transferAmount: transferAmount(),
    asset: selectedAsset,
    destinationAddress: destination,
  });

  const { limitDecimalsOnKeyDown } = useFormHelpers();

  const handleCoinChange = (value: string) => {
    const index = Number(value);
    if (Number(assetsFungible[index].fiatBalance) === 0) {
      setUSDSelected(false);
    }
    setSelectedAssetIndex(index);
  };

  const { isValidAddress } = useAddress(destination);
  const destinationError =
    destination && !isValidAddress ? t('errorInvalidAddress', { ns: 'common' }) : undefined;

  const overDraft = usdSelected
    ? Number(amountInput) > Number(selectedAsset.fiatBalance)
    : Number(amountInput) > formatCoinUnitsFromAsset(selectedAsset);

  const isSubmitDisabled =
    isEth(selectedAsset) || // remove this check once we are able to send ETH
    !isValidAddress ||
    !amountInput ||
    overDraft;

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

          <NumberInput
            placeholder="0"
            precision={isEth(selectedAsset) ? 18 : selectedAsset.token.decimals}
            value={amountInput}
            onChange={setAmountInput}
            onKeyDown={e =>
              limitDecimalsOnKeyDown(
                e,
                amountInput || '0',
                isEth(selectedAsset) ? 18 : selectedAsset.token.decimals
              )
            }
          >
            <NumberInputField />
          </NumberInput>
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
