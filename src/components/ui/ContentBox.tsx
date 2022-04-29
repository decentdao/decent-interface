import ContentBoxTitle from "./ContentBoxTitle";

const ContentBox = ({
  title,
  children,
}: {
  title?: string,
  children: React.ReactNode,
}) => {
  return (
    <div>
      {title && <ContentBoxTitle>
        {title}
      </ContentBoxTitle>}
      <div className="rounded-lg bg-gray-600 px-4 py-2 my-2">{children}</div>
    </div>
  );
}

export default ContentBox;
