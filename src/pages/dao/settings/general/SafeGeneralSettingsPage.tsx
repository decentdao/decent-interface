import { Button, Flex, Show, Text } from '@chakra-ui/react';
import { abis } from '@fractal-framework/fractal-contracts';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { encodeFunctionData, zeroAddress } from 'viem';
import { SettingsContentBox } from '../../../../components/SafeSettings/SettingsContentBox';
import { InputComponent } from '../../../../components/ui/forms/InputComponent';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import NestedPageHeader from '../../../../components/ui/page/Header/NestedPageHeader';
import Divider from '../../../../components/ui/utils/Divider';
import { DAO_ROUTES } from '../../../../constants/routes';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { createAccountSubstring } from '../../../../hooks/utils/useGetAccountName';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../../types';
import { validateENSName } from '../../../../utils/url';

export function SafeGeneralSettingsPage() {
  const { t } = useTranslation(['settings', 'settingsMetadata']);
  const [name, setName] = useState('');
  const [snapshotENS, setSnapshotENS] = useState('');
  const [snapshotENSValid, setSnapshotENSValid] = useState<boolean>();
  const navigate = useNavigate();

  const { submitProposal } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const {
    node: { daoName, daoSnapshotENS, safe },
  } = useFractal();
  const {
    addressPrefix,
    contracts: { keyValuePairs },
  } = useNetworkConfig();

  const safeAddress = safe?.address;

  useEffect(() => {
    if (daoName && safeAddress && createAccountSubstring(safeAddress) !== daoName) {
      setName(daoName);
    }

    if (daoSnapshotENS) {
      setSnapshotENS(daoSnapshotENS);
    }
  }, [daoName, daoSnapshotENS, safeAddress]);

  const handleSnapshotENSChange: ChangeEventHandler<HTMLInputElement> = e => {
    const lowerCasedValue = e.target.value.toLowerCase();
    setSnapshotENS(lowerCasedValue);
    if (validateENSName(lowerCasedValue) || (e.target.value === '' && daoSnapshotENS)) {
      setSnapshotENSValid(true);
    } else {
      setSnapshotENSValid(false);
    }
  };

  const submitProposalSuccessCallback = () => {
    if (safeAddress) {
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, safeAddress));
    }
  };

  const handleEditDAOName = () => {
    const proposalData: ProposalExecuteData = {
      metaData: {
        title: t('updatesSafeName', { ns: 'proposalMetadata' }),
        description: '',
        documentationUrl: '',
      },
      targets: [keyValuePairs],
      values: [0n],
      calldatas: [
        encodeFunctionData({
          abi: abis.KeyValuePairs,
          functionName: 'updateValues',
          args: [['daoName'], [name]],
        }),
      ],
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
          backButton={{
            text: t('settings'),
            href: DAO_ROUTES.settings.relative(addressPrefix, safeAddress || zeroAddress),
          }}
        />
      </Show>
      {!!safe ? (
        <SettingsContentBox>
          <Flex
            flexDir="column"
            gap="1rem"
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
            <InputComponent
              isRequired={false}
              onChange={e => setName(e.target.value)}
              disabled={!canUserCreateProposal}
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
              my="1rem"
              w={{ base: 'calc(100% + 1.5rem)', md: 'calc(100% + 3rem)' }}
              mx={{ base: '-0.75rem', md: '-1.5rem' }}
            />
          </Flex>
          <Flex
            flexDir="column"
            gap="1rem"
            mt="1rem"
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
            <InputComponent
              isRequired={false}
              onChange={handleSnapshotENSChange}
              value={snapshotENS}
              disabled={!canUserCreateProposal}
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
        </SettingsContentBox>
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
