import { Jazzicon } from '@ukstv/jazzicon-react';
import { Suspense } from 'react';
import { useImage } from 'react-image';
import { Box, Image } from '@chakra-ui/react';
function JazziconAvatar({ address }: { address: string }) {
  return (
    <Box
      w="1.5rem"
      h="1.5rem"
    >
      <Jazzicon address={address} />
    </Box>
  );
}

function URLAvatar({ url }: { url: string }) {
  const { src } = useImage({
    srcList: url,
  });

  return (
    <Box
      w="1.5rem"
      h="1.5rem"
    >
      <Image
        className="rounded-full"
        src={src}
        alt="avatar"
      />
    </Box>
  );
}

function Avatar({ address, url }: { address: string; url: string | null }) {
  if (!url) {
    return <JazziconAvatar address={address} />;
  }

  return (
    <Suspense fallback={<JazziconAvatar address={address} />}>
      <URLAvatar url={url} />
    </Suspense>
  );
}

export default Avatar;
