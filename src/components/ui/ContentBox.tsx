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
      <div>{children}</div>
    </div>
  );
}

export default ContentBox;
