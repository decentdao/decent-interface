import cx from "classnames";

interface ButtonProps {
  onClick?: () => void;
  label?: string;
  icon?: JSX.Element;
  isSpaceBetween?: boolean;
  isFullWidth?: boolean;
  isIconRight?: boolean;
  isLoading?: boolean;
}

export const PrimaryButton = ({ ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const BASE_COLORS = "bg-gold-500 text-gray-500";
  const HOVER_STATE = "hover:bg-gold-300";
  const DISABLED_STATE = "disabled:bg-chocolate-500 disabled:text-gray-50";

  return <Button className={cx(BASE_COLORS, HOVER_STATE, DISABLED_STATE)} {...rest} />;
};

export const SecondaryButton = ({ ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const BASE_COLORS = "bg-chocolate-500 border border-gold-500 text-gold-500";
  const HOVER_STATE = "hover:border-gold-300 hover:text-gold-300";
  const DISABLED_STATE = "disabled:border-gray-50 disabled:text-gray-50";
  return <Button className={cx(BASE_COLORS, HOVER_STATE, DISABLED_STATE)} {...rest} />;
};

export const TextButton = ({ ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const BASE_COLORS = "text-gold-500";
  const HOVER_STATE = "hover:text-gold-300";
  const DISABLED_STATE = "disabled:text-gray-50";
  return <Button className={cx(BASE_COLORS, HOVER_STATE, DISABLED_STATE)} {...rest} />;
};

const Button = ({
  label,
  icon,
  className,
  isFullWidth,
  isSpaceBetween,
  isIconRight,
  isLoading,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {

  /****************************
   * Text and Loading Component
   ****************************/
  const Label = () => {
    if (isLoading) {
      return (
        <div className={cx("flex items-center animate-pulse", {
          'text-xs leading-6': !isFullWidth
        })}>
          Loading...
        </div>
      );
    }
    if (!label) {
      return null;
    }
    return <span className="flex items-center">{label}</span>;
  };

  /****************************
   * Icon Components
   ****************************/
  const Icon = () => (!!icon && !isLoading ? icon : null);
  const IconLeft = () => (!isIconRight ? <Icon /> : null);
  const IconRight = () => (isIconRight ? <Icon /> : null);

  /****************************
   * Styles
   ****************************/

  const BASE_BUTTON_STYLES = "py-1 px-4 mx-2 font-mono rounded flex items-center justify-center font-semibold";

  return (
    <button
      className={cx(
        BASE_BUTTON_STYLES,
        className,
        {
          "w-full h-16": isFullWidth,
        },
        {
          "justify-center": !isSpaceBetween,
          "justify-between": isSpaceBetween,
        }
      )}
      {...rest}
    >
      <IconLeft />
      <Label />
      <IconRight />
    </button>
  );
};

export default Button;
