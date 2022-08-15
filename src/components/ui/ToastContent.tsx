import { TextButton } from './forms/Button';

export function ToastContent({
  title,
  label,
  action,
}: {
  title: string;
  label: string;
  action?: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div>{title}</div>
      <TextButton
        label={label}
        onClick={action}
      />
    </div>
  );
}
