import { Link, LinkProps } from '@chakra-ui/react';
import { Ref } from 'react';

export default function ExternalLink({
  children,
  internalRef,
  isTextLink,
  ...rest
}: LinkProps & { isTextLink?: boolean; internalRef?: Ref<any> }) {
  const textLinkStyles = {
    hover: {
      textDecoration: 'underline',
    },
    active: {},
  };

  const pillLinkStyles = {
    hover: {
      bg: 'celery--6',
      borderColor: 'celery--6',
    },
    active: {
      bg: 'celery--5',
      borderColor: 'celery--5',
      borderWidth: '1px',
    },
  };

  return (
    <Link
      color="celery-0"
      padding="0.25rem 0.75rem"
      gap="0.25rem"
      borderRadius="625rem"
      borderColor="transparent"
      borderWidth="1px"
      _hover={isTextLink ? textLinkStyles.hover : pillLinkStyles.hover}
      _active={isTextLink ? textLinkStyles.active : pillLinkStyles.active}
      target="_blank"
      rel="noreferrer"
      textDecoration="none"
      ref={internalRef}
      {...rest}
    >
      {children}
    </Link>
  );
}
