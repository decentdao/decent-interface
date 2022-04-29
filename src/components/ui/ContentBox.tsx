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
      <div className="rounded-lg bg-gray-600 px-4 py-2 my-2">{children}</div>
    </div>
  );
}

export default ContentBox;
