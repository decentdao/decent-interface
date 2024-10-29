import { Button, Divider, Flex, Hide, Show, Text } from '@chakra-ui/react';
import { abis } from '@fractal-framework/fractal-contracts';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { encodeFunctionData } from 'viem';
import { SettingsSection } from '../../../../../components/pages/SafeSettings/SettingsSection';
import { InputComponent } from '../../../../../components/ui/forms/InputComponent';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import NestedPageHeader from '../../../../../components/ui/page/Header/NestedPageHeader';
import { DAO_ROUTES } from '../../../../../constants/routes';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useCanUserCreateProposal } from '../../../../../hooks/utils/useCanUserSubmitProposal';
import { createAccountSubstring } from '../../../../../hooks/utils/useGetAccountName';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../../../types';
import { validateENSName } from '../../../../../utils/url';

export default function SafeGeneralSettingsPage() {
  const { t } = useTranslation(['settings', 'settingsMetadata']);
  const [name, setName] = useState('');
  const [snapshotENS, setSnapshotENS] = useState('');
  const [snapshotENSValid, setSnapshotENSValid] = useState<boolean>();
  const navigate = useNavigate();

  const { submitProposal } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const {
    node: { daoName, daoSnapshotENS, daoAddress, safe },
    readOnly: {
      user: { votingWeight },
    },
  } = useFractal();
  const {
    addressPrefix,
    contracts: { keyValuePairs, fractalRegistry },
  } = useNetworkConfig();

  useEffect(() => {
    if (daoName && daoAddress && createAccountSubstring(daoAddress) !== daoName) {
      setName(daoName);
    }

    if (daoSnapshotENS) {
      setSnapshotENS(daoSnapshotENS);
    }
  }, [daoName, daoSnapshotENS, daoAddress]);

  const handleSnapshotENSChange: ChangeEventHandler<HTMLInputElement> = e => {
    const lowerCasedValue = e.target.value.toLowerCase();
    setSnapshotENS(lowerCasedValue);
    if (validateENSName(lowerCasedValue) || (e.target.value === '' && daoSnapshotENS)) {
      setSnapshotENSValid(true);
    } else {
      setSnapshotENSValid(false);
    }
  };

  const userHasVotingWeight = votingWeight > 0n;

  const submitProposalSuccessCallback = () => {
    if (daoAddress) {
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  };

  const handleEditDAOName = () => {
    const encodedUpdateDAOName = encodeFunctionData({
      abi: abis.FractalRegistry,
      functionName: 'updateDAOName',
      args: [name],
    });

    const proposalData: ProposalExecuteData = {
      metaData: {
        title: t('updatesSafeName', { ns: 'proposalMetadata' }),
        description: '',
        documentationUrl: '',
      },
      targets: [fractalRegistry],
      values: [0n],
      calldatas: [encodedUpdateDAOName],
    };

    submitProposal({
      proposalData,
      nonce: safe?.nextNonce,
      pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
      successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
      failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
      successCallback: submitProposalSuccessCallback,
    });
  };

  const handleEditDAOSnapshotENS = () => {
    const encodedUpdateValues = encodeFunctionData({
      abi: abis.KeyValuePairs,
      functionName: 'updateValues',
      args: [['snapshotENS'], [snapshotENS]],
    });

    const proposalData: ProposalExecuteData = {
      metaData: {
        title: t('updateSnapshotSpace', { ns: 'proposalMetadata' }),
        description: '',
        documentationUrl: '',
      },
      targets: [keyValuePairs],
      values: [0n],
      calldatas: [encodedUpdateValues],
    };

    submitProposal({
      proposalData,
      nonce: safe?.nextNonce,
      pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
      successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
      failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
      successCallback: submitProposalSuccessCallback,
    });
  };

  return (
    <>
      <Show below="md">
        <NestedPageHeader
          title={t('daoSettingsGeneral')}
          backButtonText={t('settings')}
        />
      </Show>
      <Hide below="md"></Hide>
      {!!safe ? (
        <SettingsSection title={t('daoSettingsGeneral')}>
          <Flex
            flexDir="column"
            mt="2rem"
          >
            <Flex justifyContent="space-between">
              <Text textStyle="display-lg">{t('daoMetadataName')}</Text>
              {canUserCreateProposal && (
                <Button
                  variant="secondary"
                  size="sm"
                  isDisabled={name === daoName}
                  onClick={handleEditDAOName}
                >
                  {t('proposeChanges')}
                </Button>
              )}
            </Flex>
            <Divider
              my="1rem"
              w={{ base: 'calc(100% + 1.5rem)', md: 'calc(100% + 3rem)' }}
              mx={{ base: '-0.75rem', md: '-1.5rem' }}
            />
            <InputComponent
              isRequired={false}
              onChange={e => setName(e.target.value)}
              disabled={!userHasVotingWeight}
              value={name}
              placeholder="Amazing DAO"
              testId="daoSettings.name"
              gridContainerProps={{
                display: 'inline-flex',
                flexWrap: 'wrap',
                flex: '1',
                width: '100%',
              }}
              inputContainerProps={{
                width: '100%',
              }}
            />
          </Flex>
          <Flex
            flexDir="column"
            mt="2rem"
          >
            <Flex justifyContent="space-between">
              <Text textStyle="display-lg">{t('daoMetadataSnapshot')}</Text>
              <Button
                variant="secondary"
                size="sm"
                isDisabled={!snapshotENSValid || snapshotENS === daoSnapshotENS}
                onClick={handleEditDAOSnapshotENS}
              >
                {t('proposeChanges')}
              </Button>
            </Flex>
            <Divider
              my="1rem"
              w={{ base: 'calc(100% + 1.5rem)', md: 'calc(100% + 3rem)' }}
              mx={{ base: '-0.75rem', md: '-1.5rem' }}
            />
            <InputComponent
              isRequired={false}
              onChange={handleSnapshotENSChange}
              value={snapshotENS}
              disabled={!userHasVotingWeight}
              placeholder="example.eth"
              testId="daoSettings.snapshotENS"
              gridContainerProps={{
                display: 'inline-flex',
                flexWrap: 'wrap',
                flex: '1',
                width: '100%',
              }}
              inputContainerProps={{
                width: '100%',
              }}
            />
          </Flex>
        </SettingsSection>
      ) : (
        <Flex
          h="8.5rem"
          width="100%"
          alignItems="center"
          justifyContent="center"
        >
          <BarLoader />
        </Flex>
      )}
    </>
  );
}
