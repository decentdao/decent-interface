import { Button, VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction, useState } from 'react';
import ContentBox from '../ui/ContentBox';
import { InputComponent } from './InputComponent';

function UsulMetadata({
  show,
  setInputtedMetadata,
}: {
  show: boolean;
  setInputtedMetadata: Dispatch<SetStateAction<boolean>>;
}) {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [link, setLink] = useState<string>('');

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
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={false}
        />
        <InputComponent
          label={'Description'}
          helper={'Add a brief description.'}
          isRequired={false}
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={false}
        />
        <InputComponent
          label={'Additional Resources'}
          helper={'A link to any discussion or formal documentation.'}
          isRequired={false}
          value={link}
          onChange={e => setLink(e.target.value)}
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
