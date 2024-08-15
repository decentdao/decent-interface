import { Button } from '@chakra-ui/react';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAddress, isHex } from 'viem';
import { DAO_ROUTES } from '../../../../constants/routes';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { createAccountSubstring } from '../../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../../types';
import { validateENSName } from '../../../../utils/url';
import { InputComponent } from '../../../ui/forms/InputComponent';
import { SettingsSection } from './SettingsSection';

export function MetadataContainer() {
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
    if (validateENSName(e.target.value) || (e.target.value === '' && daoSnapshotENS)) {
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
        title: t('updatesSafeName', { ns: 'proposalMetadata' }),
        description: '',
        documentationUrl: '',
      },
      targets: [getAddress(fractalRegistryContract.asProvider.address)],
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
        title: t('updateSnapshotSpace', { ns: 'proposalMetadata' }),
        description: '',
        documentationUrl: '',
      },
      targets: [getAddress(keyValuePairsContract.asProvider.address)],
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
    <SettingsSection
      title={t('daoMetadataName')}
      headerRight={
        canUserCreateProposal && (
          <Button
            variant="secondary"
            size="sm"
            isDisabled={name === daoName}
            onClick={handleEditDAOName}
          >
            {t('proposeChanges')}
          </Button>
        )
      }
      descriptionHeader={t('daoMetadataDescriptionTitle')}
      descriptionContent={t('daoMetadataDescriptionText')}
      nestedSection={{
        title: t('daoMetadataSnapshot'),
        headerRight: canUserCreateProposal && (
          <Button
            variant="secondary"
            size="sm"
            isDisabled={!snapshotENSValid || snapshotENS === daoSnapshotENS}
            onClick={handleEditDAOSnapshotENS}
          >
            {t('proposeChanges')}
          </Button>
        ),
        children: (
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
        ),
      }}
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
    </SettingsSection>
  );
}
