function Input({
  value,
  type,
  min,
  disabled,
  placeholder,
  width,
  borderColor,
  onChange,
  onKeyDown,
}: {
  value: string,
  type: string,
  min: string | number | undefined,
  disabled: boolean,
  placeholder?: string,
  width:string,
  borderColor:string,
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined,
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement> | undefined,
}) {
  return (
    <input
      type={type}
      min={min}
      className={`${width} border ${borderColor} border-gray-20 bg-gray-400 rounded py-1 px-2 shadow-inner text-gray-50 ${disabled ? "disabled" : ""}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      onWheel={e => (e.target as HTMLInputElement).blur()}
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck="false"
    />
  );
}

const InputAddress = ({
  value,
  disabled,
  placeholder,
  error,
  onChange,
}: {
  value: string,
  disabled: boolean,
  placeholder: string,
  error: boolean,
  onChange: (newValue: string) => void,
}) => {
return (
  <Input
  width="w-full"
  value={value}
  type="text"
  min={undefined}
  disabled={disabled}
  placeholder={placeholder}
  borderColor={error ? "border-red" : "border-black-100"}
  onChange={e => onChange(e.target.value)}
  onKeyDown={undefined}
/>
)
}

export {
  Input,
  InputAddress
};