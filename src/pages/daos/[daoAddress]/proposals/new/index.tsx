import { Grid, GridItem, Box, Flex, Center } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { Formik, FormikProps } from 'formik';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProposalDetails } from '../../../../../components/ProposalCreate/ProposalDetails';
import { ProposalHeader } from '../../../../../components/ProposalCreate/ProposalHeader';
import ProposalMetadata from '../../../../../components/ProposalCreate/ProposalMetadata';
import TransactionsForm from '../../../../../components/ProposalCreate/TransactionsForm';
import { DEFAULT_PROPOSAL } from '../../../../../components/ProposalCreate/constants';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { BACKGROUND_SEMI_TRANSPARENT, HEADER_HEIGHT } from '../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { usePrepareProposal } from '../../../../../hooks/DAO/proposal/usePrepareProposal';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useCreateProposalSchema } from '../../../../../hooks/schemas/proposalCreate/useCreateProposalSchema';
import { useCanUserCreateProposal } from '../../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { CreateProposalForm, CreateProposalState, GovernanceType } from '../../../../../types';

const templateAreaTwoCol = '"content details"';
const templateAreaSingleCol = `"content"
  "details"`;

export default function ProposalCreatePage() {
  const {
    node: { daoAddress, safe },
    governance: { type },
  } = useFractal();
  const { createProposalValidation } = useCreateProposalSchema();
  const { prepareProposal } = usePrepareProposal();
  const { submitProposal, pendingCreateTx } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();

  const navigate = useNavigate();
  const { t } = useTranslation(['proposal', 'common', 'breadcrumbs']);

  const [formState, setFormState] = useState(CreateProposalState.METADATA_FORM);
  const isAzorius = useMemo(
    () => type === GovernanceType.AZORIUS_ERC20 || type === GovernanceType.AZORIUS_ERC721,
    [type],
  );

  const successCallback = () => {
    if (daoAddress) {
      navigate(DAO_ROUTES.proposals.relative(daoAddress));
    }
  };

  if (!type || !daoAddress || !safe) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <Formik<CreateProposalForm>
      validationSchema={createProposalValidation}
      initialValues={{ ...DEFAULT_PROPOSAL, nonce: safe.nonce }}
      onSubmit={async values => {
        const { nonce } = values;
        const proposalData = await prepareProposal(values);
        submitProposal({
          proposalData,
          nonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage'),
          successToastMessage: t('proposalCreateSuccessToastMessage'),
          failedToastMessage: t('proposalCreateFailureToastMessage'),
          successCallback,
        });
      }}
      validateOnMount
      isInitialValid={false}
    >
      {(formikProps: FormikProps<CreateProposalForm>) => {
        const { handleSubmit, setFieldValue, values } = formikProps;
        return (
          <form onSubmit={handleSubmit}>
            <Box>
              <PageHeader
                title={t('createProposal')}
                breadcrumbs={[
                  {
                    terminus: t('proposals', { ns: 'breadcrumbs' }),
                    path: DAO_ROUTES.proposals.relative(daoAddress),
                  },
                  {
                    terminus: t('proposalNew', { ns: 'breadcrumbs' }),
                    path: '',
                  },
                ]}
                ButtonIcon={Trash}
                buttonVariant="secondary"
                buttonClick={() => navigate(DAO_ROUTES.proposals.relative(daoAddress))}
                isButtonDisabled={pendingCreateTx}
              />
              <Grid
                gap={4}
                templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
                gridTemplateRows={{ base: '1fr', lg: '5.1em 1fr' }}
                templateAreas={{
                  base: templateAreaSingleCol,
                  lg: templateAreaTwoCol,
                }}
              >
                <GridItem area="content">
                  <Flex
                    flexDirection="column"
                    align="left"
                  >
                    <Box
                      marginBottom="2rem"
                      rounded="lg"
                      p="1rem"
                      bg={BACKGROUND_SEMI_TRANSPARENT}
                    >
                      <ProposalHeader
                        isAzorius={isAzorius}
                        metadataTitle={
                          formState === CreateProposalState.TRANSACTIONS_FORM &&
                          !!values.proposalMetadata.title
                            ? values.proposalMetadata.title
                            : undefined
                        }
                        nonce={values.nonce}
                        setNonce={(nonce?: number) => {
                          setFieldValue('nonce', nonce);
                        }}
                      />

                      <ProposalMetadata
                        isVisible={formState === CreateProposalState.METADATA_FORM}
                        setFormState={setFormState}
                        {...formikProps}
                      />
                      <TransactionsForm
                        isVisible={formState === CreateProposalState.TRANSACTIONS_FORM}
                        setFormState={setFormState}
                        pendingTransaction={pendingCreateTx}
                        canUserCreateProposal={canUserCreateProposal}
                        {...formikProps}
                      />
                    </Box>
                  </Flex>
                </GridItem>
                <GridItem
                  area="details"
                  w="100%"
                >
                  <ProposalDetails />
                </GridItem>
              </Grid>
            </Box>
          </form>
        );
      }}
    </Formik>
  );
}
