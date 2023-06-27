import { Flex, Text, Button, Divider } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '..';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { createAccountSubstring } from '../../../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { InputComponent } from '../../../../ui/forms/InputComponent';

export default function MetadataContainer() {
  const [name, setName] = useState('');
  const [snapshotURL, setSnapshotURL] = useState('');
  const { t } = useTranslation('settings');

  const { canUserCreateProposal } = useSubmitProposal();
  const {
    node: { daoName, daoSnapshotURL, daoAddress },
  } = useFractal();

  useEffect(() => {
    if (daoName && daoAddress && createAccountSubstring(daoAddress) !== daoName) {
      setName(daoName);
    }

    if (daoSnapshotURL) {
      setSnapshotURL(daoSnapshotURL);
    }
  }, [daoName, daoSnapshotURL, daoAddress]);

  return (
    <SettingsSection
      contentTitle={t('daoMetadataTitle')}
      contentHeader={
        <Flex justifyContent="space-between">
          <Text
            textStyle="text-lg-mono-bold"
            color="grayscale.100"
          >
            {t('daoMetadataName')}
          </Text>
          {canUserCreateProposal && (
            <Button
              variant="tertiary"
              disabled
              isDisabled
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
        color="chocolate.700"
        mt={4}
        mb={4}
      />
      <Flex justifyContent="space-between">
        <Text
          textStyle="text-lg-mono-bold"
          color="grayscale.100"
        >
          {t('daoMetadataSnapshotURL')}
        </Text>
        {canUserCreateProposal && (
          <Button
            variant="tertiary"
            disabled
            isDisabled
          >
            {t('proposeChanges')}
          </Button>
        )}
      </Flex>
      <InputComponent
        isRequired={false}
        onChange={e => setSnapshotURL(e.target.value)}
        value={snapshotURL}
        placeholder="example.eth"
        testId="daoSettings.snapshotUrl"
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
