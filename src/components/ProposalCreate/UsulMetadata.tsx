import { Button, VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';
import ContentBox from '../ui/ContentBox';
import { InputComponent } from './InputComponent';

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
    const metadataCopy = {
      ...metadata,
      documentationUrl,
    };
    setMetadata(metadataCopy);
  };

  if (!show) return null;

  return (
    <ContentBox>
      <VStack
        align="left"
        spacing={4}
        mt={6}
      >
        <InputComponent
          label={'Proposal Title'}
          helper={'A short title for this proposal.'}
          isRequired={false}
          value={metadata.title}
          onChange={e => updateTitle(e.target.value)}
          disabled={false}
        />
        <InputComponent
          label={'Description'}
          helper={'Add a brief description.'}
          isRequired={false}
          value={metadata.description}
          onChange={e => updateDescription(e.target.value)}
          disabled={false}
        />
        <InputComponent
          label={'Additional Resources'}
          helper={'A link to any discussion or formal documentation.'}
          isRequired={false}
          value={metadata.documentationUrl}
          onChange={e => updateDocumentationUrl(e.target.value)}
          disabled={false}
        />
      </VStack>
      <Button
        w="100%"
        onClick={() => setInputtedMetadata(true)}
        disabled={false}
      >
        Next
      </Button>
    </ContentBox>
  );
}

export default UsulMetadata;
