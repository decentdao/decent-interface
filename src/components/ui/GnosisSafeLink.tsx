import useGnosisSafeLink from '../../hooks/useGnosisSafeLink';
import { PrimaryButton } from './forms/Button';

function GnosisSafeLink({ address, label }: { address: string | undefined; label: string }) {
  const gnosisLink = useGnosisSafeLink(address);
  console.log('🚀 ~ file: GnosisSafeLink.tsx ~ line 6 ~ gnosisLink', gnosisLink);
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
