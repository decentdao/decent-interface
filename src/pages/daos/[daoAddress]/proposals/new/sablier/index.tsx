import {
  Center,
  Box,
  Grid,
  Flex,
  GridItem,
  Button,
  Icon,
  VStack,
  Text,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { Trash, CaretRight, CaretLeft } from '@phosphor-icons/react';
import { Dispatch, FormEvent, SetStateAction, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Routes, Navigate, Route } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Address, Hash } from 'viem';
import {
  InputComponent,
  TextareaComponent,
} from '../../../../../../components/ui/forms/InputComponent';
import { BarLoader } from '../../../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../../../components/ui/page/Header/PageHeader';
import Markdown from '../../../../../../components/ui/proposal/Markdown';
import { CeleryTextLink } from '../../../../../../components/ui/utils/CeleryTextLink';
import { useHeaderHeight } from '../../../../../../constants/common';
import { BASE_ROUTES, DAO_ROUTES } from '../../../../../../constants/routes';
import useSubmitProposal from '../../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useCanUserCreateProposal } from '../../../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { CreateProposalSteps } from '../../../../../../types';

function StepButtons({
  values: { proposalMetadata },
  pendingTransaction,
}: {
  values: { proposalMetadata: { title: string; description?: string } };
  pendingTransaction: boolean;
}) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['common', 'proposal']);

  if (!daoAddress) {
    return null;
  }

  // @dev these prevStepUrl and nextStepUrl calculation is done this way to universally build URL for the next/prev steps both for proposal builder and proposal template builder
  const prevStepUrl = `${location.pathname.replace(`${CreateProposalSteps.TRANSACTIONS}`, `${CreateProposalSteps.METADATA}`)}${location.search}`;
  const nextStepUrl = `${location.pathname.replace(`${CreateProposalSteps.METADATA}`, `${CreateProposalSteps.TRANSACTIONS}`)}${location.search}`;

  return (
    <Flex
      mt="1.5rem"
      gap="0.75rem"
      alignItems="center"
      justifyContent="flex-end"
      width="100%"
    >
      <Routes>
        <Route
          path={CreateProposalSteps.METADATA}
          element={
            <Button
              onClick={() => navigate(nextStepUrl)}
              isDisabled={!proposalMetadata.title}
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
                isDisabled={!canUserCreateProposal || pendingTransaction}
              >
                {t('createProposal', { ns: 'proposal' })}
              </Button>
            </>
          }
        />
      </Routes>
    </Flex>
  );
}

function ProposalDetails({
  values: { proposalMetadata },
}: {
  values: { proposalMetadata: { title: string; description: string } };
}) {
  const { t } = useTranslation(['proposalTemplate', 'proposal']);
  const trimmedTitle = proposalMetadata.title?.trim();
  const [descriptionCollapsed, setDescriptionCollapsed] = useState(true);

  return (
    <Box
      rounded="lg"
      border="1px solid"
      borderColor="neutral-3"
      p={6}
      maxWidth="400px"
    >
      <VStack
        spacing={3}
        align="left"
      >
        <Text textStyle="display-lg">{t('preview')}</Text>
        <Divider />
        <HStack justifyContent="space-between">
          <Text color="neutral-7">{t('previewTitle')}</Text>
          <Text
            textAlign="right"
            width="66%"
          >
            {trimmedTitle}
          </Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text color="neutral-7">{t('proposalTemplateDescription')}</Text>
          {proposalMetadata.description && (
            <CeleryTextLink
              onClick={() => setDescriptionCollapsed(prevState => !prevState)}
              text={t(descriptionCollapsed ? 'show' : 'hide', { ns: 'common' })}
            />
          )}
        </HStack>
        {!descriptionCollapsed && (
          <Markdown
            content={proposalMetadata.description}
            collapsedLines={100}
          />
        )}
        <Divider />
      </VStack>
    </Box>
  );
}

function ProposalMetadata({
  values: { proposalMetadata },
  setTitle,
  setDescription,
}: {
  values: { proposalMetadata: { title: string; description: string } };
  setTitle: Dispatch<SetStateAction<string>>;
  setDescription: Dispatch<SetStateAction<string>>;
}) {
  const { t } = useTranslation(['proposalTemplate', 'proposal', 'common']);

  return (
    <VStack
      align="left"
      spacing={8}
      p="1.5rem"
    >
      <InputComponent
        label={t('proposalTitle', { ns: 'proposal' })}
        helper={t('proposalTitleHelper', { ns: 'proposal' })}
        placeholder={t('proposalTitlePlaceholder', { ns: 'proposal' })}
        isRequired
        value={proposalMetadata.title}
        onChange={e => setTitle(e.target.value)}
        testId="metadata.title"
        maxLength={50}
      />
      <TextareaComponent
        label={t('proposalDescription', { ns: 'proposal' })}
        subLabel={t('')}
        helper={t('proposalDescriptionHelper', { ns: 'proposal' })}
        placeholder={t('proposalDescriptionPlaceholder', { ns: 'proposal' })}
        isRequired={false}
        value={proposalMetadata.description}
        onChange={e => setDescription(e.target.value)}
        rows={12}
      />
    </VStack>
  );
}

function StreamBuilder() {
  return <p>I am stream builder</p>;
}

export default function SablierProposalCreatePage() {
  const {
    node: { daoAddress, safe },
    governance: { type },
  } = useFractal();
  const { submitProposal, pendingCreateTx } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();
  const { t } = useTranslation(['proposalTemplate', 'proposal']);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const HEADER_HEIGHT = useHeaderHeight();

  const successCallback = () => {
    if (daoAddress) {
      // Redirecting to proposals page so that user will see Proposal for Proposal Template creation
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  };

  const values = useMemo(
    () => ({ proposalMetadata: { title, description } }),
    [title, description],
  );

  const prepareProposalData = useCallback(async () => {
    const targets: Address[] = [];
    return {
      targets,
      values: targets.map(() => 0n),
      calldatas: targets.map(() => '0x' as Hash), // TODO: Proper calldata
      metaData: values.proposalMetadata,
    };
  }, [values]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canUserCreateProposal) {
      toast(t('errorNotProposer', { ns: 'common' }));
    }

    try {
      const proposalData = await prepareProposalData();
      if (proposalData) {
        submitProposal({
          proposalData,
          nonce: safe?.nextNonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
          successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
          failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
          successCallback,
        });
      }
    } catch (e) {
      console.error(e);
      toast(t('encodingFailedMessage', { ns: 'proposal' }));
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
    <form onSubmit={handleSubmit}>
      <Box>
        <PageHeader
          title={t('createProposal', { ns: 'proposal' })}
          breadcrumbs={[
            {
              terminus: t('proposals', { ns: 'breadcrumbs' }),
              path: DAO_ROUTES.proposals.relative(addressPrefix, daoAddress),
            },
            {
              terminus: t('proposalNew', { ns: 'breadcrumbs' }),
              path: '',
            },
          ]}
          ButtonIcon={Trash}
          buttonVariant="secondary"
          buttonClick={() =>
            navigate(
              daoAddress
                ? DAO_ROUTES.proposals.relative(addressPrefix, daoAddress)
                : BASE_ROUTES.landing,
            )
          }
          isButtonDisabled={pendingCreateTx}
        />
        <Grid
          gap={4}
          marginTop="3rem"
          templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
          templateAreas={{
            base: '"content" "details"',
            lg: '"content details"',
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
                bg="neutral-2"
              >
                <Routes>
                  <Route
                    path={CreateProposalSteps.METADATA}
                    element={
                      <ProposalMetadata
                        values={values}
                        setTitle={setTitle}
                        setDescription={setDescription}
                      />
                    }
                  />
                  <Route
                    path={CreateProposalSteps.TRANSACTIONS}
                    element={<StreamBuilder />}
                  />
                  <Route
                    path="*"
                    element={
                      <Navigate
                        to={`${CreateProposalSteps.METADATA}${location.search}`}
                        replace
                      />
                    }
                  />
                </Routes>
              </Box>
              <StepButtons
                pendingTransaction={pendingCreateTx}
                values={values}
              />
            </Flex>
          </GridItem>
          <GridItem
            area="details"
            w="100%"
          >
            <ProposalDetails values={values} />
          </GridItem>
        </Grid>
      </Box>
    </form>
  );
}
