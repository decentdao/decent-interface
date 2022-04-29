import Button from "./Button";

function PrimaryButton({
  disabled = false,
  onClick,
  children,
  type = "button",
  ...rest
}: {
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      addedClassNames={`flex place-content-center px-8 py-3 mx-2 my-2 ${
        disabled
          ? "bg-chocolate-500 text-gray-50"
          : "bg-gold-500 text-black-500"
      }`}
    >
      {children}
    </Button>
  );
}

export default PrimaryButton;