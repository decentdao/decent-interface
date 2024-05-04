import { ens_normalize } from '@adraffy/ens-normalize';
import { Flex, Text, Button, Divider } from '@chakra-ui/react';
import { useState, useEffect, ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isHex, getAddress } from 'viem';
import { SettingsSection } from '..';
import { DAO_ROUTES } from '../../../../../constants/routes';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useCanUserCreateProposal } from '../../../../../hooks/utils/useCanUserSubmitProposal';
import { createAccountSubstring } from '../../../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../../../types';
import { InputComponent } from '../../../../ui/forms/InputComponent';

export default function MetadataContainer() {
  const [name, setName] = useState('');
  const [snapshotENS, setSnapshotENS] = useState('');
  const [snapshotENSValid, setSnapshotENSValid] = useState<boolean>();
  const { t } = useTranslation(['settings', 'proposalMetadata']);
  const navigate = useNavigate();

  const { submitProposal } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const {
    baseContracts,
    node: { daoName, daoSnapshotENS, daoAddress, safe },
    readOnly: {
      user: { votingWeight },
    },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  useEffect(() => {
    if (daoName && daoAddress && createAccountSubstring(daoAddress) !== daoName) {
      setName(daoName);
    }

    if (daoSnapshotENS) {
      setSnapshotENS(daoSnapshotENS);
    }
  }, [daoName, daoSnapshotENS, daoAddress]);

  const handleSnapshotENSChange: ChangeEventHandler<HTMLInputElement> = e => {
    setSnapshotENS(e.target.value);
    try {
      ens_normalize(e.target.value);
      setSnapshotENSValid(true);
    } catch (error) {
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
    if (!baseContracts) {
      return;
    }
    const { fractalRegistryContract } = baseContracts;
    const encodedUpdateDAOName = fractalRegistryContract.asProvider.interface.encodeFunctionData(
      'updateDAOName',
      [name],
    );
    if (!isHex(encodedUpdateDAOName)) {
      return;
    }
    const proposalData: ProposalExecuteData = {
      metaData: {
        title: t('Update Safe Name', { ns: 'proposalMetadata' }),
        description: '',
        documentationUrl: '',
      },
      targets: [getAddress(fractalRegistryContract.asProvider.address)],
      values: [0n],
      calldatas: [encodedUpdateDAOName],
    };

    submitProposal({
      proposalData,
      nonce: safe?.nonce,
      pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
      successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
      failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
      successCallback: submitProposalSuccessCallback,
    });
  };

  const handleEditDAOSnapshotENS = () => {
    if (!baseContracts) {
      return;
    }
    const { keyValuePairsContract } = baseContracts;
    const encodedUpdateValues = keyValuePairsContract.asProvider.interface.encodeFunctionData(
      'updateValues',
      [['snapshotENS'], [snapshotENS]],
    );
    if (!isHex(encodedUpdateValues)) {
      return;
    }
    const proposalData: ProposalExecuteData = {
      metaData: {
        title: t('Update Snapshot Space', { ns: 'proposalMetadata' }),
        description: '',
        documentationUrl: '',
      },
      targets: [getAddress(keyValuePairsContract.asProvider.address)],
      values: [0n],
      calldatas: [encodedUpdateValues],
    };

    submitProposal({
      proposalData,
      nonce: safe?.nonce,
      pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
      successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
      failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
      successCallback: submitProposalSuccessCallback,
    });
  };

  return (
    <SettingsSection
      contentTitle={''}
      contentHeader={
        <Flex
          justifyContent="space-between"
          alignItems="center"
        >
          <Text
            textStyle="text-lg-mono-bold"
            color="grayscale.100"
          >
            {t('daoMetadataName')}
          </Text>
          {canUserCreateProposal && (
            <Button
              variant="tertiary"
              disabled={name === daoName}
              isDisabled={name === daoName}
              onClick={handleEditDAOName}
            >
              {t('proposeChanges')}
            </Button>
          )}
        </Flex>
      }
      descriptionTitle={t('daoMetadataDescriptionTitle')}
      descriptionText={t('daoMetadataDescriptionText')}
    >
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
      <Divider
        color="chocolate.400"
        mt={4}
        mb={4}
      />
      <Flex
        justifyContent="space-between"
        alignItems="center"
      >
        <Text
          textStyle="text-lg-mono-bold"
          color="grayscale.100"
        >
          {t('daoMetadataSnapshot')}
        </Text>
        {canUserCreateProposal && (
          <Button
            variant="tertiary"
            disabled={!snapshotENSValid || snapshotENS === daoSnapshotENS}
            isDisabled={!snapshotENSValid || snapshotENS === daoSnapshotENS}
            onClick={handleEditDAOSnapshotENS}
          >
            {t('proposeChanges')}
          </Button>
        )}
      </Flex>
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
    </SettingsSection>
  );
}
