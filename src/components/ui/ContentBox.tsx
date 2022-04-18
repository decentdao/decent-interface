const ContentBox = ({
  title,
  children,
}: {
  title?: string,
  children?: React.ReactNode,
}) => {
  return (
    <div className="rounded-lg bg-black px-4 py-4 my-4">
      <p className="text-left text-md text-mediumGray">{title}</p>
      <div>{children}</div>
    </div>
  );
}

export default ContentBox;
