import cx from "classnames";

interface ButtonProps {
  onClick?: () => void;
  label?: string;
  icon?: JSX.Element;
  isSpaceBetween?: boolean;
  isLarge?: boolean;
  isIconRight?: boolean;
  isLoading?: boolean;
}

export const PrimaryButton = ({className, ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const BASE_STYLES = "bg-gold-500 text-gray-500 font-semibold";
  const HOVER_STATE = "hover:bg-gold-300";
  const DISABLED_STATE = "disabled:bg-chocolate-500 disabled:text-gray-50";

  return <Button className={cx(BASE_STYLES, HOVER_STATE, DISABLED_STATE, className)} {...rest} />;
};

export const SecondaryButton = ({className, ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const BASE_STYLES = "bg-chocolate-500 border border-gold-500 text-gold-500 font-semibold";
  const HOVER_STATE = "hover:border-gold-300 hover:text-gold-300";
  const DISABLED_STATE = "disabled:border-gray-50 disabled:text-gray-50";
  return <Button className={cx(BASE_STYLES, HOVER_STATE, DISABLED_STATE, className)} {...rest} />;
};

export const TextButton = ({className, ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const BASE_STYLES = "text-gold-500 font-medium";
  const HOVER_STATE = "hover:text-gold-300";
  const DISABLED_STATE = "disabled:text-gray-50";
  return <Button className={cx(BASE_STYLES, HOVER_STATE, DISABLED_STATE, className)} {...rest} />;
};

const Button = ({
  label,
  icon,
  className,
  isLarge,
  isSpaceBetween,
  isIconRight,
  isLoading,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  /****************************
   * Text and Loading Component
   ****************************/
  const Label = () => {
    // @todo update button loader component
    return (
      <div className="flex justify-center relative">
        <div
          className={cx({
            "animate-pulse absolute": isLoading,
            hidden: !isLoading,
          })}
        >
          * * *
        </div>
        <div
          className={cx({
            invisible: isLoading,
            visible: !isLoading,
          })}
        >
          {label}
        </div>
      </div>
    );
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

  const BASE_BUTTON_STYLES = "py-1 px-4 mx-2 font-mono rounded flex items-center justify-center";

  return (
    <button
      className={cx(
        BASE_BUTTON_STYLES,
        className,
        {
          "h-16": isLarge,
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
