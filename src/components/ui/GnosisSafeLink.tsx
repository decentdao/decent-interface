import useGnosisSafeLink from '../../hooks/useGnosisSafeLink';
import { PrimaryButton } from './forms/Button';

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
      <PrimaryButton label={label} />
    </a>
  );
}

export default GnosisSafeLink;
