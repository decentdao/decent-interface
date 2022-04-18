const GreyBox = ({
  title,
  children,
}: {
  title: string,
  children: React.ReactNode,
}) => {
  return (
    <div className="rounded-lg bg-black px-6 py-6 my-6">
      <div className= "">
      <p className="text-left text-md text-mediumGray pb-6">{title}</p>
      <div>{children}</div>
      </div>
    </div>
  );
}

export default GreyBox;
