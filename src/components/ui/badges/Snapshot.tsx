import { Button, ButtonProps, Image } from '@chakra-ui/react';
import { t } from 'i18next';

interface Props extends ButtonProps {
  snapshotURL: string;
}

export default function Snapshot({ snapshotURL, ...rest }: Props) {
  return (
    <Button
      onClick={() => window.open(`https://snapshot.org/#/${snapshotURL}`)}
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
