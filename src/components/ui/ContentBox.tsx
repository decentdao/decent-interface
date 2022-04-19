import ContentBoxTitle from "./ContentBoxTitle";

const ContentBox = ({
  title,
  children,
}: {
  title?: string,
  children?: React.ReactNode,
}) => {
  return (
    <div className="rounded-lg bg-black-900 px-4 py-4 my-4">
      <ContentBoxTitle>
        {title}
      </ContentBoxTitle>
      <div>{children}</div>
    </div>
  );
}

export default ContentBox;
