import { Box, Button, Divider, Flex, SimpleGrid, Spacer, Text } from '@chakra-ui/react';
import { Input, LabelWrapper } from '@decent-org/fractal-ui';
import { constants } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import useDelegateVote from '../../../hooks/DAO/useDelegateVote';
import useAddress from '../../../hooks/utils/useAddress';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import EtherscanLinkAddress from '../EtherscanLinkAddress';

export function DelegateModal({ close }: { close: Function }) {
  const [newDelegatee, setNewDelegatee] = useState<string>('');
  const { t } = useTranslation(['modals', 'common']);
  const [pending, setPending] = useState<boolean>(false);

  const {
    governance: { governanceToken },
  } = useFractal();
  const {
    state: { account },
  } = useWeb3Provider();

  const [, validAddress] = useAddress(newDelegatee);
  const delegateeDisplayName = useDisplayName(governanceToken?.delegatee);
  const delegateVote = useDelegateVote({
    delegatee: newDelegatee,
    votingTokenContract: governanceToken?.tokenContract,
    setPending: setPending,
  });

  const delegateSelf = () => {
    if (account) setNewDelegatee(account);
  };

  const onDelegateClick = () => {
    delegateVote();
    if (close) close();
  };

  const errorMessage =
    validAddress === false ? t('errorInvalidAddress', { ns: 'common' }) : undefined;

  if (!governanceToken) return null;

  return (
    <Box>
      <SimpleGrid
        columns={2}
        color="chocolate.200"
      >
        <Text
          align="start"
          marginBottom="0.5rem"
        >
          {t('titleBalance')}
        </Text>
        <Text
          align="end"
          color="grayscale.100"
        >
          {governanceToken.userBalanceString}
        </Text>
        <Text
          align="start"
          marginBottom="0.5rem"
        >
          {t('titleWeight')}
        </Text>
        <Text
          align="end"
          color="grayscale.100"
        >
          {governanceToken.votingWeightString}
        </Text>
        <Text
          align="start"
          marginBottom="1rem"
        >
          {t('titleDelegatedTo')}
        </Text>
        <Text
          align="end"
          color="grayscale.100"
        >
          {governanceToken?.delegatee === constants.AddressZero ? (
            '--'
          ) : (
            <EtherscanLinkAddress address={governanceToken.delegatee}>
              {delegateeDisplayName.displayName}
            </EtherscanLinkAddress>
          )}
        </Text>
      </SimpleGrid>
      <Divider
        color="chocolate.700"
        marginBottom="1rem"
      />
      <Flex alignItems="center">
        <Text color="grayscale.100">{t('labelDelegateInput')}</Text>
        <Spacer />
        <Text
          textStyle="text-sm-sans-regular"
          color="gold.500-active"
          onClick={delegateSelf}
        >
          {t('linkSelfDelegate')}
        </Text>
      </Flex>
      <LabelWrapper
        subLabel={t('sublabelDelegateInput')}
        errorMessage={errorMessage}
      >
        <Input
          data-testid="essentials-daoName"
          type="text"
          size="base"
          width="full"
          placeholder={constants.AddressZero}
          value={newDelegatee}
          onChange={e => setNewDelegatee(e.target.value)}
        />
      </LabelWrapper>
      <Button
        marginTop="2rem"
        width="100%"
        disabled={!validAddress || newDelegatee.trim() === '' || pending}
        onClick={onDelegateClick}
      >
        {t('buttonDelegate')}
      </Button>
    </Box>
  );
}
