import { Jazzicon } from "@ukstv/jazzicon-react";
import { Suspense } from "react";
import { useImage } from "react-image";

const JazziconAvatar = ({ address }: { address: string }) => {
  return (
    <div className="h-7 w-7">
      <Jazzicon address={address} />
    </div>
  );
}

const URLAvatar = ({ url }: { url: string }) => {
  const { src } = useImage({
    srcList: url,
  });

  return (
    <div className="h-7 w-7">
      <img className="rounded-full" src={src} alt="avatar" />
    </div>
  );
}

const Avatar = ({ address, url }: { address: string; url: string | null }) => {
  if (!url) {
    return <JazziconAvatar address={address} />;
  }

  return (
    <Suspense fallback={<JazziconAvatar address={address} />}>
      <URLAvatar url={url} />
    </Suspense>
  );
};

export default Avatar;
