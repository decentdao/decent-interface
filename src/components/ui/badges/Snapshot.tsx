import { Button, ButtonProps, Image, Link } from '@chakra-ui/react';
import { t } from 'i18next';

interface Props extends ButtonProps {
  snapshotURL: string;
}

export default function Snapshot({ snapshotURL, ...rest }: Props) {
  return (
    <Button
      href={`https://snapshot.org/#/${snapshotURL}`}
      as={Link}
      target="_blank"
      variant="secondary"
      mt={5}
      h={6}
      w={32}
      {...rest}
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
