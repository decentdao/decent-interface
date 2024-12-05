import { Box, Image } from '@chakra-ui/react';
import { blo } from 'blo';
import { Suspense } from 'react';
import { useImage } from 'react-image';
import { Address } from 'viem';

export type AvatarSize = 'icon' | 'lg' | 'sm' | 'xl' | 'md';
const avatarSizes: { [size: string]: string } = {
  sm: '1rem',
  icon: '1.5rem',
  md: '1.6875rem',
  lg: '2rem',
  xl: '3rem',
};

function BlockieAvatar({ address, size }: { size: AvatarSize; address: Address }) {
  return (
    <Box
      h={avatarSizes[size]}
      w={avatarSizes[size]}
    >
      <Image
        borderRadius="full"
        src={blo(address)}
        alt={address}
      />
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
        flexShrink={0}
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
  address: Address;
  url?: string | null;
}) {
  if (!url) {
    return (
      <BlockieAvatar
        size={size}
        address={address}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <BlockieAvatar
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
