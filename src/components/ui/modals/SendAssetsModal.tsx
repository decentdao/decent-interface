import { Box, Divider, Flex, Select, HStack, Text, Button } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { BigIntValuePair } from '../../../types';
import {
  formatCoinFromAsset,
  formatCoinUnitsFromAsset,
  formatUSD,
} from '../../../utils/numberFormats';
import useSendAssets from '../../pages/DAOTreasury/hooks/useSendAssets';
import { BigIntInput } from '../forms/BigIntInput';
import { CustomNonceInput } from '../forms/CustomNonceInput';
import { EthAddressInput } from '../forms/EthAddressInput';

// @todo add Yup and Formik to this modal
export function SendAssetsModal({ close }: { close: () => void }) {
  const {
    node: { safe },
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation(['modals', 'common']);

  const fungibleAssetsWithBalance = assetsFungible.filter(asset => parseFloat(asset.balance) > 0);

  const [selectedAsset, setSelectedAsset] = useState<SafeBalanceUsdResponse>(
    fungibleAssetsWithBalance[0],
  );
  const [inputAmount, setInputAmount] = useState<BigIntValuePair>();
  const [nonceInput, setNonceInput] = useState<number | undefined>(safe!.nonce);

  const [destination, setDestination] = useState<Address>();

  const hasFiatBalance = Number(selectedAsset.fiatBalance) > 0;

  const convertedTotal = formatUSD(
    Number(inputAmount?.value || '0') * Number(selectedAsset.fiatConversion),
  );

  const sendAssets = useSendAssets({
    transferAmount: inputAmount?.bigintValue || 0n,
    asset: selectedAsset,
    destinationAddress: destination!,
    nonce: nonceInput,
  });

  const handleCoinChange = (index: string) => {
    setInputAmount({ value: '0', bigintValue: 0n });
    setSelectedAsset(fungibleAssetsWithBalance[Number(index)]);
  };

  const onChangeAmount = (value: BigIntValuePair) => {
    setInputAmount(value);
  };

  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const destinationError =
    destination && !isValidAddress ? t('errorInvalidAddress', { ns: 'common' }) : undefined;

  const overDraft = Number(inputAmount?.value || '0') > formatCoinUnitsFromAsset(selectedAsset);

  // @dev next couple of lines are written like this, to keep typing equivalent during the conversion from BN to bigint
  const inputBigint = inputAmount?.bigintValue;
  const inputBigintIsZero = inputBigint ? inputBigint === 0n : undefined;
  const isSubmitDisabled = !isValidAddress || !inputAmount || inputBigintIsZero || overDraft;

  const onSubmit = async () => {
    await sendAssets();
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
          <BigIntInput
            value={inputAmount?.bigintValue}
            onChange={onChangeAmount}
            decimalPlaces={selectedAsset?.token?.decimals}
            placeholder="0"
            maxValue={BigInt(selectedAsset.balance)}
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
        <EthAddressInput
          onAddressChange={function (address: Address | undefined, isValid: boolean): void {
            setIsValidAddress(isValid);
            setDestination(address);
          }}
        />
      </LabelWrapper>
      <Divider
        color="chocolate.700"
        marginTop="0.75rem"
        marginBottom="0.75rem"
      />
      <CustomNonceInput
        nonce={nonceInput}
        onChange={nonce => setNonceInput(nonce ? nonce : undefined)}
      />

      <Button
        marginTop="2rem"
        width="100%"
        isDisabled={isSubmitDisabled}
        onClick={onSubmit}
      >
        {t('sendAssetsSubmit')}
      </Button>
    </Box>
  );
}
