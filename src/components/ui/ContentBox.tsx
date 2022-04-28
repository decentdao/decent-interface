import ContentBoxTitle from "./ContentBoxTitle";

const ContentBox = ({
  title,
  children,
}: {
  title?: string,
  children: React.ReactNode,
}) => {
  return (
    <div className="bg-gray-600 rounded-lg p-4">
      {title && <ContentBoxTitle>
        {title}
      </ContentBoxTitle>}
      <div>{children}</div>
    </div>
  );
}

export default ContentBox;
