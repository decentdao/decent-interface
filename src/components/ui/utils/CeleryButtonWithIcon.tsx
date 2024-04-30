import { Button, ButtonProps, Icon } from '@chakra-ui/react';
import { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';

interface ICeleryButtonWithIcon extends ButtonProps {
  icon?: PhosphorIcon;
  children: ReactNode;
  iconPosition?: 'start' | 'end';
}
export default function CeleryButtonWithIcon({
  icon,
  onClick,
  children,
  iconPosition = 'start',
  ...rest
}: ICeleryButtonWithIcon) {
  return (
    <Button
      variant="text"
      color="celery-0"
      padding="0.25rem 0.75rem"
      gap="0.25rem"
      borderRadius="625rem"
      borderColor="transparent"
      borderWidth="1px"
      _hover={{ bg: 'celery--6', borderColor: 'celery--6' }}
      _active={{ bg: 'celery--6', borderWidth: '1px', borderColor: 'celery--5' }}
      onClick={onClick}
      {...rest}
    >
      {' '}
      {iconPosition === 'start' && icon && <Icon as={icon} />}
      {children}
      {iconPosition === 'end' && icon && <Icon as={icon} />}
    </Button>
  );
}
