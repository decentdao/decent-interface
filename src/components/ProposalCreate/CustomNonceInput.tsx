import { Flex, Text, Input, Tooltip } from '@chakra-ui/react';
import { SupportQuestion } from '@decent-org/fractal-ui';
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
      <Text
        textStyle="text-md-mono-regular"
        whiteSpace="nowrap"
        mt="1"
      >
        Custom Nonce
      </Text>
      <Tooltip
        label="Set a custom proposal nonce if necessary to prevent nonce collisions"
        maxW="18rem"
        placement="top"
      >
        <SupportQuestion
          boxSize="1.5rem"
          minWidth="auto"
          mx="2"
          mt="1"
        />
      </Tooltip>
      <Input
        value={nonce}
        onChange={e => setNonce(Number(e.target.value))}
        type="number"
        px="4"
        ml="4"
      />
    </Flex>
  );
}
