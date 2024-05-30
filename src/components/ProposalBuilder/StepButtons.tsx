import { Flex, Button, Icon } from '@chakra-ui/react';
import { CaretRight, CaretLeft } from '@phosphor-icons/react';
import { FormikProps } from 'formik';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { DAO_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { CreateProposalSteps } from '../../types';
import { CreateProposalForm, ProposalBuilderMode } from '../../types/proposalBuilder';

interface StateButtonsProps extends FormikProps<CreateProposalForm> {
  pendingTransaction: boolean;
  canUserCreateProposal?: boolean;
  safeNonce?: number;
  mode: ProposalBuilderMode;
}

function StateButtonsContainer({ children }: { children: ReactNode }) {
  return (
    <Flex
      mt="1.5rem"
      gap="0.75rem"
      alignItems="center"
      justifyContent="flex-end"
      width="100%"
    >
      {children}
    </Flex>
  );
}
export default function StateButtons(props: StateButtonsProps) {
  const { addressPrefix } = useNetworkConfig();
  const {
    node: { daoAddress },
  } = useFractal();
  const { step } = useParams();
  const navigate = useNavigate();
  const {
    pendingTransaction,
    errors: {
      transactions: transactionsError,
      nonce: nonceError,
      proposalMetadata: proposalMetadataError,
    },
    canUserCreateProposal,
    values: { proposalMetadata },
  } = props;
  const { t } = useTranslation(['common', 'proposal']);

  if (!daoAddress) {
    return null;
  }

  if (step === CreateProposalSteps.METADATA) {
    return (
      <StateButtonsContainer>
        <Button
          onClick={() =>
            navigate(DAO_ROUTES.proposalNewTransactions.relative(addressPrefix, daoAddress))
          }
          isDisabled={!!proposalMetadataError || !proposalMetadata.title}
          px="2rem"
        >
          {t('next', { ns: 'common' })}
          <CaretRight />
        </Button>
      </StateButtonsContainer>
    );
  }
  return (
    <StateButtonsContainer>
      <Button
        px="2rem"
        variant="text"
        color="lilac-0"
        onClick={() => navigate(DAO_ROUTES.proposalNew.relative(addressPrefix, daoAddress))}
      >
        <Icon
          bg="transparent"
          aria-label="Back"
          as={CaretLeft}
          color="lilac-0"
        />
        {t('back', { ns: 'common' })}
      </Button>
      <Button
        px="2rem"
        type="submit"
        isDisabled={
          !canUserCreateProposal || !!transactionsError || !!nonceError || pendingTransaction
        }
      >
        {t('createProposal', { ns: 'proposal' })}
      </Button>
    </StateButtonsContainer>
  );
}
