import { ChangeEvent, FormEvent } from "react";

interface InputProps {
  type: "text" | "number" | "textarea";
  value: string;
  label?: string;
  subLabel?: string;
  disabled?: boolean;
  errorMessage?: string;
  placeholder?: string;
  min?: string | number;
  onChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

/**
 * FormField builds and renders Input fields based on given parameters
 * includes: surrounding wrapper, label, input and error handling
 *
 */
const Input = ({ value, min, placeholder, type, label, subLabel, errorMessage, disabled, onChange, onKeyDown }: InputProps) => {
  const FieldType = type === "textarea" ? "textarea" : "input";
  const hasError = !!errorMessage;

  const Label = () =>
    !!label ? (
      <label htmlFor="form-field" className="text-gray-25 text-xs font-medium mb-1">
        {label}
      </label>
    ) : null;

  const SubLabel = () => (!!subLabel && !hasError ? <div className="text-gray-50 text-xs font-medium mt-1">{subLabel}</div> : null);
  const ErrorMessage = () => (!!hasError ? <div className="text-red text-xs mt-1">{errorMessage}</div> : null);

  const INPUT_BASE_STYLES = "w-full border border-gray-20 bg-gray-400 rounded py-1 px-2 shadow-inner text-gray-50 focus:outline-none";
  const INPUT_DISABLED_STYLED = "disabled:bg-gray-300 disabled:border-gray-200 disabled:text-gray-100"
  const borderColor = hasError ? "border border-red" : "";
  const inputTextColor = hasError ? "text-red" : "text-gray-25";

  const _type = type !== "textarea" ? type : undefined;

  return (
    <div className="flex flex-col">
      <Label />
      <FieldType
        id="form-field"
        type={_type}
        placeholder={placeholder}
        className={`${INPUT_BASE_STYLES} ${INPUT_DISABLED_STYLED} ${borderColor} ${inputTextColor}`}
        disabled={disabled}
        value={value}
        min={min}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onWheel={(e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target as HTMLInputElement).blur()}
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
      />
      <SubLabel />
      <ErrorMessage />
    </div>
  );
};

export default Input;
