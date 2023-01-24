import { Flex, Text, Input } from '@chakra-ui/react';
import { Dispatch, SetStateAction, useEffect } from 'react';
import useUsul from '../../hooks/DAO/proposal/useUsul';
import useDefaultNonce from '../../hooks/DAO/useDefaultNonce';

export function CustomNonceInput({
  nonce,
  setNonce,
}: {
  nonce: number | undefined;
  setNonce: Dispatch<SetStateAction<number | undefined>>;
}) {
  const { usulContract } = useUsul();
  const defaultNonce = useDefaultNonce();

  useEffect(() => {
    setNonce(defaultNonce);
  }, [defaultNonce, setNonce]);

  if (!!usulContract) return null;

  return (
    <Flex>
      <Text textStyle="text-md-mono-regular">Custom Nonce</Text>
      <Input
        value={nonce}
        onChange={e => setNonce(Number(e.target.value))}
        size="md"
        type="number"
        px={2}
      />
    </Flex>
  );
}
