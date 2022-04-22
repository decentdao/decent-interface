import { Input } from './Input'

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

export default InputAddress