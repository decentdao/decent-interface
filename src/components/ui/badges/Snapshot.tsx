import { Button, ButtonProps, Image, Link } from '@chakra-ui/react';
import { t } from 'i18next';

interface Props extends ButtonProps {
  snapshotENS: string;
}

export default function Snapshot({ snapshotENS, mt }: Props) {
  return (
    <Button
      href={`https://snapshot.org/#${snapshotENS}`}
      as={Link}
      target="_blank"
      variant="secondary"
      mt={mt || 5}
      h={6}
      w={32}
    >
      <>
        <Image
          src="/images/snapshot-icon.svg"
          alt="snapshot icon"
          mr={1}
        />
        {t('snapshot')}
      </>
    </Button>
  );
}
