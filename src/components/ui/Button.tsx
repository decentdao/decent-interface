function Button({
  disabled = false,
  onClick,
  children,
  type = "button",
  ...rest
}: {
  disabled?: boolean,
  onClick: () => void,
  children: React.ReactNode,
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-8 py-2 mx-2 border rounded border-lightGold bg-chocolate text-lightGold ${disabled ? "opacity-50" : ""}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
