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
      addedClassNames={`flex px-6 py-3 mx-2 my-2 ${
        selected
          ? "border-gold-500 bg-black-500 text-gold-500"
          : "border-gray-25 bg-chocolate-500 text-gray-25"
      }`}
    >
      <div className="flex flex-grow">
      {children}
      </div>
      <div className="flex flex-grow place-content-end">
      {selected && <Check />}
      </div>
    </Button>
  );
}

export default SelectVoteButton;
