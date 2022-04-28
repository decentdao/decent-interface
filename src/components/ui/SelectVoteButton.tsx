import Check from "./svg/Check";
import Button from "./Button";

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
    <Button
      onClick={onClick}
      disabled={disabled}
      addedClassNames={`flex px-8 py-2 mx-2 ${
        selected
          ? "border-gold-500 bg-black-500 text-gold-500"
          : "border-gray-25 bg-chocolate-500 text-gray-25"
      }`}
    >
      {children}
      {selected && <Check />}
    </Button>
  );
}

export default SelectVoteButton;
