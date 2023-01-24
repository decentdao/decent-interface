import { Flex, Text, Input } from '@chakra-ui/react';
import { GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import useUsul from '../../hooks/DAO/proposal/useUsul';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';

export function CustomNonceInput({
  nonce,
  setNonce,
}: {
  nonce: number | undefined;
  setNonce: Dispatch<SetStateAction<number | undefined>>;
}) {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const {
    gnosis: { safe },
  } = useFractal();
  const { usulContract } = useUsul();

  useEffect(() => {
    if (!safe.address) {
      setNonce(undefined);
      return;
    }

    const gnosisSafeContract = GnosisSafe__factory.connect(safe.address, signerOrProvider);

    gnosisSafeContract.nonce().then(_nonce => setNonce(_nonce.toNumber()));
  }, [safe.address, setNonce, signerOrProvider]);

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
