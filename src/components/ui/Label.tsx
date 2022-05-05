interface LabelProps {
  label: string;
  children: React.ReactNode;
  isDataLoading?: boolean;
}

const Label = ({ isDataLoading, label, children }: LabelProps) => {
  if (isDataLoading) {
    return (
      <div className="flex mx-2 my-1 text-gray-50">
        <span>{label}</span>
        <span className="ml-2 w-12">
          <div className="animate-loading-flash animate-pulse bg-gradient-to-r from-transparent to-gray-25 h-full opacity-70"></div>
        </span>
      </div>
    );
  }
  return (
    <div className="flex mx-2 my-1 text-gray-50">
      <span>{label}</span>
      {children}
    </div>
  );
};

export default Label;
