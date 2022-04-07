function Input({
  title,
  status,
  value,
  type,
  min,
  disabled,
  placeholder,
  onChange,
  onKeyDown,
}: {
  title: string,
  status: React.ReactNode,
  value: string,
  type: string,
  min: string | number | undefined,
  disabled: boolean,
  placeholder:string,
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined,
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement> | undefined,
}) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline">
        <div className="mr-1">{title}</div>
        <div>{status}</div>
      </div>
      <input
        type={type}
        min={min}
        className={`w-full border rounded py-1 px-2 shadow-inner ${disabled ? "disabled" : ""}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder = {placeholder}
        onKeyDown={onKeyDown}
        onWheel={e => (e.target as HTMLInputElement).blur()}
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
      />
    </div>
  );
}

function InputAddress({
  title,
  status,
  value,
  disabled,
  placeholder,
  onChange,
}: {
  title: string,
  status?: React.ReactNode,
  value: string,
  disabled: boolean,
  placeholder: string,
  onChange: (newValue: string) => void,
}) {
  return (
    <Input
      title={title}
      status={status}
      value={value}
      type="text"
      min={undefined}
      disabled={disabled}
      placeholder = {placeholder}
      onChange={e => onChange(e.target.value)}
      onKeyDown={undefined}
    />
  );
}

export {
  InputAddress,
};