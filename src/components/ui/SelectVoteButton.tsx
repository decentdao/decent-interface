import Check from "./svg/Check";

function SelectVoteButton({
  disabled = false,
  selected,
  onClick,
  children,
  type = "button",
  ...rest
}: {
  disabled?: boolean;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex px-8 py-2 mx-2 border rounded ${
        selected
          ? "border-gold-500 bg-black-500 text-gold-500"
          : "border-gray-25 bg-chocolate-500 text-gray-25"
      } ${disabled ? "opacity-50" : ""}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {children}
      {selected ? <Check /> : null}
    </button>
  );
}

export default SelectVoteButton;
