import { Flex, Button, Icon } from '@chakra-ui/react';
import { CaretRight, CaretLeft } from '@phosphor-icons/react';
import { FormikProps } from 'formik';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useFractal } from '../../providers/App/AppProvider';
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
  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();
  const location = useLocation();
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

  const prevStepUrl = `${location.pathname.replace(`${CreateProposalSteps.TRANSACTIONS}`, `${CreateProposalSteps.METADATA}`)}${location.search}`;
  const nextStepUrl = `${location.pathname.replace(`${CreateProposalSteps.METADATA}`, `${CreateProposalSteps.TRANSACTIONS}`)}${location.search}`;

  return (
    <StateButtonsContainer>
      <Routes>
        <Route
          path={CreateProposalSteps.METADATA}
          element={
            <Button
              onClick={() => navigate(nextStepUrl)}
              isDisabled={!!proposalMetadataError || !proposalMetadata.title}
              px="2rem"
            >
              {t('next', { ns: 'common' })}
              <CaretRight />
            </Button>
          }
        />
        <Route
          path={CreateProposalSteps.TRANSACTIONS}
          element={
            <>
              <Button
                px="2rem"
                variant="text"
                color="lilac-0"
                onClick={() => navigate(prevStepUrl)}
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
                  !canUserCreateProposal ||
                  !!transactionsError ||
                  !!nonceError ||
                  pendingTransaction
                }
              >
                {t('createProposal', { ns: 'proposal' })}
              </Button>
            </>
          }
        />
      </Routes>
    </StateButtonsContainer>
  );
}
