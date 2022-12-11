import { Box, Button, Text } from '@chakra-ui/react';
import { Check } from '@decent-org/fractal-ui';
import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@gnosis.pm/safe-service-client';
import { Signer } from 'ethers';
import { useTranslation } from 'react-i18next';
import { buildSafeTransaction, SafeSignature, safeSignTypedData } from '../../../helpers';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { MultisigProposal } from '../../../providers/Fractal/types';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
import ContentBox from '../../ui/ContentBox';

export function TxActions({ proposal }: { proposal: MultisigProposal }) {
  const {
    gnosis: { safe, safeService },
  } = useFractal();
  const {
    state: { account, signerOrProvider, chainId },
  } = useWeb3Provider();
  const { t } = useTranslation();
  const isOwner = safe.owners?.includes(account || '');
  const hasSigned = proposal.confirmations.find(confirm => confirm.owner === account);
  const multisigTx = proposal.transaction as SafeMultisigTransactionWithTransfersResponse;
  const confirmTransaction = async () => {
    try {
      if (!safeService || !signerOrProvider || !multisigTx || !safe.address) {
        return;
      }
      const safeTx = buildSafeTransaction({
        ...multisigTx,
      });
      const gnosisContract = await GnosisSafe__factory.connect(safe.address, signerOrProvider);
      const signature: SafeSignature = await safeSignTypedData(
        signerOrProvider as Signer & TypedDataSigner,
        gnosisContract,
        safeTx,
        chainId
      );
      await safeService.confirmTransaction(proposal.proposalNumber, signature.data);
    } catch (e) {
      logError(e, 'Error occured during transaction confirmation');
    }
  };
  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-lg-mono-medium">Proposal Details</Text>
      <Box marginTop={4}>
        <Button
          w="full"
          rightIcon={<Check boxSize="1.5rem" />}
          disabled={!isOwner || !!hasSigned}
          onClick={confirmTransaction}
        >
          {t('approve')}
        </Button>
      </Box>
    </ContentBox>
  );
}
