import { Box, Image } from '@chakra-ui/react';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { Suspense } from 'react';
import { useImage } from 'react-image';

type AvatarSize = 'icon' | 'lg' | 'sm';
const avatarSizes: { [size: string]: string } = {
  sm: '1rem',
  icon: '1.5rem',
  lg: '2rem',
};

function JazziconAvatar({ address, size }: { size: AvatarSize; address: string }) {
  return (
    <Box
      h={avatarSizes[size]}
      w={avatarSizes[size]}
    >
      <Jazzicon address={address} />
    </Box>
  );
}

function URLAvatar({ url, size }: { size: AvatarSize; url: string }) {
  const { src } = useImage({
    srcList: url,
  });

  return (
    <Box w={avatarSizes[size]}>
      <Image
        borderRadius="full"
        src={src}
        alt="avatar"
      />
    </Box>
  );
}

function Avatar({
  size = 'icon',
  address,
  url,
}: {
  size?: AvatarSize;
  address: string;
  url?: string | null;
}) {
  if (!url) {
    return (
      <JazziconAvatar
        size={size}
        address={address}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <JazziconAvatar
          size={size}
          address={address}
        />
      }
    >
      <URLAvatar
        size={size}
        url={url}
      />
    </Suspense>
  );
}

export default Avatar;
