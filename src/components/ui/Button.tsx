function Button({
  disabled,
  onClick,
  children,
  type = "button",
  ...rest
}: {
  disabled: boolean,
  onClick: () => void,
  children: React.ReactNode,
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-4 py-2 border rounded shadow ${disabled ? "opacity-50" : ""}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button;
