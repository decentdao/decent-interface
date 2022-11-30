import { Button } from '@chakra-ui/react';
import useGnosisSafeLink from '../../hooks/safe/useSafeLink';

function GnosisSafeLink({ address, label }: { address: string | undefined; label: string }) {
  const gnosisLink = useGnosisSafeLink(address);
  if (!gnosisLink) {
    return null;
  }
  return (
    <a
      href={gnosisLink}
      target="_blank"
      rel="noreferrer"
    >
      <Button>{label}</Button>
    </a>
  );
}

export default GnosisSafeLink;
