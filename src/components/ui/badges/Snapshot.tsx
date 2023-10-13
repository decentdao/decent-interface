import { Button, ButtonProps, Image } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import { t } from 'i18next';

interface Props extends ButtonProps {
  snapshotURL: string;
  isExternal?: boolean;
}

export default function Snapshot({ snapshotURL, isExternal, ...rest }: Props) {
  return (
    <Button
      onClick={() => window.open(`https://snapshot.org/#/${snapshotURL}`)}
      variant="secondary"
      mt={5}
      h={6}
      w={isExternal ? 40 : 32}
      {...rest}
    >
      <>
        <Image
          src="/images/snapshot-icon.svg"
          alt="snapshot icon"
          mr={1}
        />
        {t('snapshot')}
        {isExternal && (
          <ArrowAngleUp
            width="24px"
            height="24px"
            ml={1}
          />
        )}
      </>
    </Button>
  );
}
