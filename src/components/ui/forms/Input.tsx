import { ChangeEvent, FormEvent } from "react";
import cx from "classnames";
interface InputProps {
  type: "text" | "number" | "textarea";
  value?: string | number;
  label?: string;
  subLabel?: string;
  helperText?: string;
  exampleText?: string;
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
const Input = ({ value, min, placeholder, type, label, subLabel, errorMessage, disabled, helperText, exampleText, onChange, onKeyDown }: InputProps) => {
  const FieldType = type === "textarea" ? "textarea" : "input";
  const hasError = !!errorMessage;

  const Label = () =>
    !!label ? (
      <label htmlFor="form-field" className="text-gray-25 text-xs font-medium mb-1">
        {label}
      </label>
    ) : null;

  const HelperText = () => (!!helperText ? <div className="text-gray-50 font-sans text-xs">{helperText}</div> : null);
  const HelperExampleText = () =>
    !!helperText && exampleText ? (
      <div className="text-gold-300 font-mono font-medium text-xxs mb-4">
        <div>Example:</div>
        <div>{exampleText}</div>
      </div>
    ) : null;

  const SubLabel = () => (!!subLabel && !hasError ? <div className="text-gray-50 text-xs font-medium mt-1">{subLabel}</div> : null);
  const ErrorMessage = () => (!!hasError ? <div className="text-red text-xs mt-1">{errorMessage}</div> : <div className={cx({ "mt-5": !subLabel })} />);

  const INPUT_BASE_STYLES = "w-full border border-gray-20 bg-gray-400 rounded py-1 px-2 shadow-inner text-gray-50 focus:outline-none";
  const INPUT_DISABLED_STYLED = "disabled:bg-gray-300 disabled:border-gray-200 disabled:text-gray-100";
  const borderColor = hasError ? "border border-red" : "";
  const inputTextColor = hasError ? "text-red" : "text-gray-25";

  const _type = type !== "textarea" ? type : undefined;

  return (
    <div
      className={cx("w-full", {
        "flex flex-wrap sm:flex-nowrap": !!helperText,
      })}
    >
      <div className={cx("flex flex-col w-full", { "pr-4": !!helperText })}>
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
      <div className="flex flex-col gap-4 sm:max-w-xxs sm:min-w-xxs sm:ml-2 sm:pl-6 pt-2 sm:pt-0 sm:border-l sm:border-gray-300 ">
        <HelperText />
        <HelperExampleText />
      </div>
    </div>
  );
};

export default Input;
