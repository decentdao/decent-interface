import { Text, Grid, GridItem, Box, Flex, Center } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { Formik, FormikProps } from 'formik';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalDetails } from '../../../../src/components/ProposalCreate/ProposalDetails';
import { ProposalHeader } from '../../../../src/components/ProposalCreate/ProposalHeader';
import TransactionsForm from '../../../../src/components/ProposalCreate/TransactionsForm';
import UsulMetadata from '../../../../src/components/ProposalCreate/UsulMetadata';
import { DEFAULT_PROPOSAL } from '../../../../src/components/ProposalCreate/constants';
import { BarLoader } from '../../../../src/components/ui/loaders/BarLoader';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import { BACKGROUND_SEMI_TRANSPARENT, HEADER_HEIGHT } from '../../../../src/constants/common';
import { BASE_ROUTES, DAO_ROUTES } from '../../../../src/constants/routes';
import { usePrepareProposal } from '../../../../src/hooks/DAO/proposal/usePrepareProposal';
import useSubmitProposal from '../../../../src/hooks/DAO/proposal/useSubmitProposal';
import { useCreateProposalSchema } from '../../../../src/hooks/schemas/proposalCreate/useCreateProposalSchema';
import { useFractal } from '../../../../src/providers/Fractal/hooks/useFractal';
import { CreateProposalForm, CreateProposalState, GovernanceTypes } from '../../../../src/types';

const templateAreaTwoCol = '"content details"';
const templateAreaSingleCol = `"content"
  "details"`;

export default function ProposalCreatePage() {
  const {
    gnosis: { safe },
    governance: { type },
  } = useFractal();

  const { createProposalValidation } = useCreateProposalSchema();
  const { prepareProposal } = usePrepareProposal();
  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();

  const { push } = useRouter();
  const { t } = useTranslation(['proposal', 'common', 'breadcrumbs']);

  const [formState, setFormState] = useState(CreateProposalState.LOADING);

  useEffect(() => {
    if (!type) return;
    if (type === GovernanceTypes.GNOSIS_SAFE_USUL) {
      setFormState(CreateProposalState.METADATA_FORM);
    } else {
      setFormState(CreateProposalState.TRANSACTIONS_FORM);
    }
  }, [type]);

  const successCallback = () => {
    if (safe) {
      push(`/daos/${safe.address}/proposals`);
    }
  };

  if (!type) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <Formik<CreateProposalForm>
      validationSchema={createProposalValidation}
      initialValues={DEFAULT_PROPOSAL}
      onSubmit={values => {
        const { nonce } = values;
        const proposal = prepareProposal(values);
        submitProposal({
          proposalData: proposal,
          nonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage'),
          successToastMessage: t('proposalCreateSuccessToastMessage'),
          failedToastMessage: t('proposalCreateFailureToastMessage'),
          successCallback,
        });
      }}
    >
      {(formikProps: FormikProps<CreateProposalForm>) => {
        const { handleSubmit, setFieldValue, values } = formikProps;
        return (
          <form onSubmit={handleSubmit}>
            <Box>
              <PageHeader
                breadcrumbs={[
                  {
                    title: t('proposals', { ns: 'breadcrumbs' }),
                    path: DAO_ROUTES.proposals.relative(safe.address),
                  },
                  {
                    title: t('proposalNew', { ns: 'breadcrumbs' }),
                    path: '',
                  },
                ]}
                ButtonIcon={Trash}
                buttonVariant="secondary"
                buttonClick={() =>
                  push(safe.address ? DAO_ROUTES.dao.relative(safe.address) : BASE_ROUTES.landing)
                }
                isButtonDisabled={pendingCreateTx}
              />
              <Text
                textStyle="text-2xl-mono-regular"
                color="grayscale.100"
              >
                {t('createProposal')}
              </Text>
              <Grid
                mt={8}
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
                      rounded="lg"
                      p="1rem"
                      bg={BACKGROUND_SEMI_TRANSPARENT}
                    >
                      <ProposalHeader
                        isUsul={type === GovernanceTypes.GNOSIS_SAFE_USUL}
                        metadataTitle={
                          formState === CreateProposalState.TRANSACTIONS_FORM &&
                          !!values.proposalMetadata.title
                            ? values.proposalMetadata.title
                            : undefined
                        }
                        nonce={values.nonce}
                        setNonce={(nonce?: number) => setFieldValue('nonce', nonce)}
                      />

                      <UsulMetadata
                        isVisible={formState === CreateProposalState.METADATA_FORM}
                        setFormState={setFormState}
                        {...formikProps}
                      />
                      <TransactionsForm
                        isVisible={formState === CreateProposalState.TRANSACTIONS_FORM}
                        setFormState={setFormState}
                        showBackButton={type === GovernanceTypes.GNOSIS_SAFE_USUL}
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
