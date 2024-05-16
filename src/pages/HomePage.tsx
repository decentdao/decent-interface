import { Flex } from '@chakra-ui/react';
import { DecentSignature } from '@decent-org/fractal-ui';
import { useEffect } from 'react';
import { useFractal } from '../providers/App/AppProvider';

export default function HomePage() {
  const {
    node: { daoAddress },
    action,
  } = useFractal();

  useEffect(() => {
    if (daoAddress) {
      action.resetDAO();
    }
  }, [daoAddress, action]);

  return (
    <Flex
      direction="column"
      gap="1rem"
      alignItems="center"
    >
      <DecentSignature
        marginTop="2rem"
        height="auto"
        width="8rem"
      />
    </Flex>
  );
}
