import { Flex, Text, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '..';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';

export default function MetadataContainer() {
  const { t } = useTranslation('settings');
  const { canUserCreateProposal } = useSubmitProposal();
  return (
    <SettingsSection
      contentTitle={t('daoMetadataTitle')}
      contentHeader={
        <Flex justifyContent="space-between">
          <Text
            textStyle="text-lg-mono-medium"
            color="grayscale.100"
          >
            {t('daoMetadataTitle')}
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
      TODO
    </SettingsSection>
  );
}
