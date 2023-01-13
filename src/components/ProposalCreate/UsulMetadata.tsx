import { Button, Divider, VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputComponent, TextareaComponent } from './InputComponent';

function UsulMetadata({
  show,
  setInputtedMetadata,
  metadata,
  setMetadata,
}: {
  show: boolean;
  setInputtedMetadata: Dispatch<SetStateAction<boolean>>;
  metadata: {
    title: string;
    description: string;
    documentationUrl: string;
  };
  setMetadata: Dispatch<
    SetStateAction<{
      title: string;
      description: string;
      documentationUrl: string;
    }>
  >;
}) {
  const { t } = useTranslation(['proposal', 'common']);
  const [urlErrorMessage, setUrlErrorMessage] = useState<string>();

  const isValidUrl = (url: string) => {
    if (!url) return true;

    let pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return !!pattern.test(url);
  };

  const updateTitle = (title: string) => {
    const metadataCopy = {
      ...metadata,
      title,
    };
    setMetadata(metadataCopy);
  };

  const updateDescription = (description: string) => {
    const metadataCopy = {
      ...metadata,
      description,
    };
    setMetadata(metadataCopy);
  };

  const updateDocumentationUrl = (documentationUrl: string) => {
    setUrlErrorMessage(isValidUrl(documentationUrl) ? undefined : 'Invalid URL');
    const metadataCopy = {
      ...metadata,
      documentationUrl,
    };
    setMetadata(metadataCopy);
  };

  if (!show) return null;

  return (
    <>
      <VStack
        align="left"
        spacing={4}
        mt={4}
      >
        <InputComponent
          label={t('proposalTitle')}
          helper={t('proposalTitleHelper')}
          isRequired={false}
          value={metadata.title}
          onChange={e => updateTitle(e.target.value)}
          disabled={false}
          placeholder={t('proposalTitlePlaceholder')}
        />
        <TextareaComponent
          label={t('proposalDescription')}
          helper={t('proposalDescriptionHelper')}
          isRequired={false}
          value={metadata.description}
          onChange={e => updateDescription(e.target.value)}
          disabled={false}
          rows={3}
        />
        <InputComponent
          label={t('proposalAdditionalResources')}
          helper={t('proposalAdditionalResourcesHelper')}
          isRequired={false}
          value={metadata.documentationUrl}
          onChange={e => updateDocumentationUrl(e.target.value)}
          disabled={false}
          placeholder={t('proposalAdditionalResourcesPlaceholder')}
          errorMessage={urlErrorMessage}
        />
      </VStack>
      <Divider
        color="chocolate.700"
        mt={8}
        mb={6}
      />
      <Button
        w="100%"
        onClick={() => setInputtedMetadata(true)}
        disabled={!!urlErrorMessage}
      >
        Next
      </Button>
    </>
  );
}

export default UsulMetadata;
