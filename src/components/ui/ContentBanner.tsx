import Info from "./svg/Info";

interface ContentBannerProps {
  description: string;
}

const ContentBanner = ({ description }: ContentBannerProps) => {
  return (
    <div className="flex items-center bg-gray-500 border-t border-sand-500 my-4 p-4 text-gray-25">
      <Info />
      <div className="font-medium text-xs text-gray-25 ml-4">{description}</div>
    </div>
  );
};

export default ContentBanner;
