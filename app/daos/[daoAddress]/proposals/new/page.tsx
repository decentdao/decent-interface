'use client';

import { Text, Grid, GridItem, Box, Flex, Center } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { Formik, FormikProps } from 'formik';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalDetails } from '../../../../../src/components/ProposalCreate/ProposalDetails';
import { ProposalHeader } from '../../../../../src/components/ProposalCreate/ProposalHeader';
import TransactionsForm from '../../../../../src/components/ProposalCreate/TransactionsForm';
import UsulMetadata from '../../../../../src/components/ProposalCreate/UsulMetadata';
import { DEFAULT_PROPOSAL } from '../../../../../src/components/ProposalCreate/constants';
import { BarLoader } from '../../../../../src/components/ui/loaders/BarLoader';
import PageHeader from '../../../../../src/components/ui/page/Header/PageHeader';
import { BACKGROUND_SEMI_TRANSPARENT, HEADER_HEIGHT } from '../../../../../src/constants/common';
import { DAO_ROUTES } from '../../../../../src/constants/routes';
import { usePrepareProposal } from '../../../../../src/hooks/DAO/proposal/usePrepareProposal';
import useSubmitProposal from '../../../../../src/hooks/DAO/proposal/useSubmitProposal';
import useDefaultNonce from '../../../../../src/hooks/DAO/useDefaultNonce';
import { useCreateProposalSchema } from '../../../../../src/hooks/schemas/proposalCreate/useCreateProposalSchema';
import { useFractal } from '../../../../../src/providers/App/AppProvider';
import { CreateProposalForm, CreateProposalState, StrategyType } from '../../../../../src/types';

const templateAreaTwoCol = '"content details"';
const templateAreaSingleCol = `"content"
  "details"`;

export default function ProposalCreatePage() {
  const {
    node: { daoAddress },
    governance: { type },
  } = useFractal();
  const defaultNonce = useDefaultNonce();
  const { createProposalValidation } = useCreateProposalSchema();
  const { prepareProposal } = usePrepareProposal();
  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();

  const { push } = useRouter();
  const { t } = useTranslation(['proposal', 'common', 'breadcrumbs']);

  const [formState, setFormState] = useState(CreateProposalState.LOADING);

  useEffect(() => {
    if (!type) return;
    if (type === StrategyType.GNOSIS_SAFE_USUL) {
      setFormState(CreateProposalState.METADATA_FORM);
    } else {
      setFormState(CreateProposalState.TRANSACTIONS_FORM);
    }
  }, [type]);

  const successCallback = () => {
    if (daoAddress) {
      push(`/daos/${daoAddress}/proposals`);
    }
  };

  if (!type || !daoAddress) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <Formik<CreateProposalForm>
      validationSchema={createProposalValidation}
      initialValues={{ ...DEFAULT_PROPOSAL, nonce: defaultNonce || 0 }}
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
          safeAddress: daoAddress,
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
                    path: DAO_ROUTES.proposals.relative(daoAddress),
                  },
                  {
                    title: t('proposalNew', { ns: 'breadcrumbs' }),
                    path: '',
                  },
                ]}
                ButtonIcon={Trash}
                buttonVariant="secondary"
                buttonClick={() => push(DAO_ROUTES.dao.relative(daoAddress))}
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
                        isUsul={type === StrategyType.GNOSIS_SAFE_USUL}
                        metadataTitle={
                          formState === CreateProposalState.TRANSACTIONS_FORM &&
                          !!values.proposalMetadata.title
                            ? values.proposalMetadata.title
                            : undefined
                        }
                        nonce={values.nonce}
                        defaultNonce={defaultNonce}
                        setNonce={(nonce?: number) =>
                          setFieldValue('nonce', nonce ? parseInt(nonce.toString(), 10) : undefined)
                        }
                      />

                      <UsulMetadata
                        isVisible={formState === CreateProposalState.METADATA_FORM}
                        setFormState={setFormState}
                        {...formikProps}
                      />
                      <TransactionsForm
                        isVisible={formState === CreateProposalState.TRANSACTIONS_FORM}
                        setFormState={setFormState}
                        showBackButton={type === StrategyType.GNOSIS_SAFE_USUL}
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
