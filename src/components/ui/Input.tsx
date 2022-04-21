function Input({
  value,
  type,
  min,
  disabled,
  placeholder,
  width,
  onChange,
  onKeyDown,
}: {
  value: string,
  type: string,
  min: string | number | undefined,
  disabled: boolean,
  placeholder?: string,
  width:string,
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined,
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement> | undefined,
}) {
  return (
    <input
      type={type}
      min={min}
      className={`${width} border border-black-500 bg-black-700 rounded py-1 px-2 shadow-inner text-black-300 ${disabled ? "disabled" : ""}`}
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

export {
  Input,
};