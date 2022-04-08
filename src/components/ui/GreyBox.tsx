const GreyBox = ({
  title,
  children,
}: {
  title: string,
  children: React.ReactNode,
}) => {
  return (
    <div className="bg-slate-100 p-8">
      <p className="text-center mb-8 text-lg">{title}</p>
      <div>{children}</div>
    </div>
  );
}

export default GreyBox;
