import { Input } from './Input'

const InputAddress = ({
    value,
    disabled,
    placeholder,
    onChange,
  }: {
    value: string,
    disabled: boolean,
    placeholder: string,
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
    onChange={e => onChange(e.target.value)}
    onKeyDown={undefined}
  />
  )
}

export default InputAddress