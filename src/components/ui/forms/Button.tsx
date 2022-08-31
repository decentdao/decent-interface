import cx from 'classnames';

interface LabelProps {
  isLoading?: boolean;
  label?: string;
}

function Label({ isLoading, label }: LabelProps) {
  return (
    <div className="flex justify-center relative">
      <div
        className={cx({
          'animate-pulse absolute': isLoading,
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
}

interface IconProps {
  icon: JSX.Element;
  isLoading?: boolean;
}
function Icon({ icon, isLoading }: IconProps) {
  return !isLoading ? icon : null;
}

interface ButtonProps {
  onClick?: () => void;
  label?: string;
  icon?: JSX.Element;
  isSpaceBetween?: boolean;
  isLarge?: boolean;
  isIconRight?: boolean;
  isLoading?: boolean;
}
function Button({
  label,
  icon,
  className,
  isLarge,
  isSpaceBetween,
  isIconRight,
  isLoading,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  /****************************
   * Styles
   ****************************/

  const BASE_BUTTON_STYLES =
    'h-10 min-w-20 font-mono rounded flex items-center justify-center focus:outline-none';

  return (
    <button
      className={cx(
        BASE_BUTTON_STYLES,
        className,
        {
          'h-16 w-': isLarge,
        },
        {
          'justify-center': !isSpaceBetween,
          'justify-between': isSpaceBetween,
        }
      )}
      {...rest}
    >
      {!isIconRight && icon && (
        <Icon
          icon={icon}
          isLoading={isLoading}
        />
      )}
      <Label
        isLoading={isLoading}
        label={label}
      />
      {isIconRight && icon && (
        <Icon
          icon={icon}
          isLoading={isLoading}
        />
      )}
    </button>
  );
}

export default Button;

export function PrimaryButton({
  className,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const BASE_STYLES = 'bg-gold-500 text-gray-500 font-semibold px-4 mx-2';
  const HOVER_STATE = 'hover:bg-gold-300';
  const DISABLED_STATE = 'disabled:bg-chocolate-500 disabled:text-gray-50';

  return (
    <Button
      className={cx(BASE_STYLES, HOVER_STATE, DISABLED_STATE, className)}
      {...rest}
    />
  );
}

export function SecondaryButton({
  className,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const BASE_STYLES =
    'bg-chocolate-500 border border-gold-500 text-gold-500 font-semibold px-4 mx-2';
  const HOVER_STATE = 'hover:border-gold-300 hover:text-gold-300';
  const DISABLED_STATE = 'disabled:border-gray-50 disabled:text-gray-50';
  return (
    <Button
      className={cx(BASE_STYLES, HOVER_STATE, DISABLED_STATE, className)}
      {...rest}
    />
  );
}

export function TextButton({
  className,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const BASE_STYLES = 'text-gold-500 font-medium';
  const HOVER_STATE = 'hover:text-gold-300';
  const DISABLED_STATE = 'disabled:text-gray-50';
  return (
    <Button
      className={cx(BASE_STYLES, HOVER_STATE, DISABLED_STATE, className)}
      {...rest}
    />
  );
}
