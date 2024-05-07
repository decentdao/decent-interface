import { Box, Flex, Select, HStack, Text, Button } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { CaretDown } from '@phosphor-icons/react';
import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import Divider from '../utils/Divider';

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

  const [destination, setDestination] = useState<string>();

  const hasFiatBalance = Number(selectedAsset.fiatBalance) > 0;

  const convertedTotal = formatUSD(
    Number(inputAmount?.value || '0') * Number(selectedAsset.fiatConversion),
  );

  const sendAssets = useSendAssets({
    transferAmount: inputAmount?.bigintValue || 0n,
    asset: selectedAsset,
    destinationAddress: destination,
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
            bgColor="neutral-1"
            borderColor="neutral-3"
            rounded="sm"
            cursor="pointer"
            iconSize="1.5rem"
            icon={<CaretDown />}
            onChange={e => handleCoinChange(e.target.value)}
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
            isInvalid={overDraft}
            errorBorderColor="red-0"
          />
        </Box>
      </Flex>
      <HStack
        justify="space-between"
        textStyle="neutral-7"
        color="white-0"
        marginTop="0.75rem"
      >
        <Text
          color={overDraft ? 'red-0' : 'neutral-7'}
          textStyle="helper-text-base"
          as="span"
        >
          {t('selectSublabel', {
            balance: formatCoinFromAsset(selectedAsset, false),
          })}
        </Text>
        {hasFiatBalance && (
          <Text
            textStyle="helper-text-base"
            as="span"
          >
            {convertedTotal}
          </Text>
        )}
        <Text
          textStyle="helper-text-base"
          as="span"
        >
          {formatUSD(selectedAsset.fiatBalance)}
        </Text>
      </HStack>
      <Divider my="1.5rem" />
      <LabelWrapper
        label={t('destinationLabel')}
        subLabel={t('destinationSublabel')}
        errorMessage={destinationError}
      >
        <EthAddressInput
          onAddressChange={function (address: string | undefined, isValid: boolean): void {
            setIsValidAddress(isValid);
            setDestination(address);
          }}
        />
      </LabelWrapper>
      <Divider my="1.5rem" />
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
