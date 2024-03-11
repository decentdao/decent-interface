import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DAO_ROUTES } from '../../../constants/routes';
import useLidoStaking from '../../../hooks/stake/lido/useLidoStaking';
import { useFractal } from '../../../providers/App/AppProvider';
import { BigNumberValuePair } from '../../../types';
import { BigNumberInput } from '../forms/BigNumberInput';
import { useNavigate } from 'react-router-dom';

export default function StakeModal({ close }: { close: () => void }) {
  const {
    node: { daoAddress },
    treasury: { assetsFungible },
  } = useFractal();
  const navigate = useNavigate();
  const { t } = useTranslation('stake');

  const fungibleAssetsWithBalance = assetsFungible.filter(asset => parseFloat(asset.balance) > 0);

  const [selectedAsset] = useState<SafeBalanceUsdResponse>(fungibleAssetsWithBalance[0]);
  const [inputAmount, setInputAmount] = useState<BigNumberValuePair>();
  const onChangeAmount = (value: BigNumberValuePair) => {
    setInputAmount(value);
  };

  const { handleStake } = useLidoStaking();
  const handleSubmit = async () => {
    if (inputAmount?.bigNumberValue) {
      await handleStake(inputAmount?.bigNumberValue);
      close();
      if (daoAddress) {
        navigate(DAO_ROUTES.proposals.relative(daoAddress));
      }
    }
  };

  return (
    <Box>
      <Box>
        <Flex
          alignItems="center"
          marginBottom="0.5rem"
        >
          <Text>{t('stakeAmount')}</Text>
        </Flex>
        <BigNumberInput
          value={inputAmount?.bigNumberValue}
          onChange={onChangeAmount}
          decimalPlaces={selectedAsset?.token?.decimals}
          placeholder="0"
          maxValue={BigNumber.from(selectedAsset.balance)}
        />
      </Box>
      <Button
        onClick={handleSubmit}
        mt={4}
        width="100%"
      >
        {t('submitStakingProposal')}
      </Button>
    </Box>
  );
}
