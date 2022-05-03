import cx from "classnames";

interface StatusBoxProps {
  status?: string;
}

const StatusBox = ({ status }: StatusBoxProps) => {
  const getStatusColors = () => {
    switch (status) {
      case "Open":
        return "bg-drab-500 text-gold-500";
      default:
        return "border border-gray-50 text-gray-50 bg-gray-400";
    }
  };
  return (
    <div className={cx("px-4 py-1 rounded-lg font-medium h-fit", getStatusColors())}>
      <div>{status}</div>
    </div>
  );
};

export default StatusBox;
