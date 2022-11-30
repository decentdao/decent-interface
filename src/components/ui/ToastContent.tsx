import { Button } from '@chakra-ui/react';

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
      <Button
        variant="text"
        onClick={action}
      >
        {label}
      </Button>
    </div>
  );
}
