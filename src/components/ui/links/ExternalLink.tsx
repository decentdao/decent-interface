import { Link, LinkProps } from '@chakra-ui/react';
import { Ref, forwardRef } from 'react';

export default function ExternalLink({
  children,
  internalRef,
  ...rest
}: LinkProps & { internalRef?: Ref<any> }) {
  return (
    <Link
      color="celery-0"
      padding="0.25rem 0.75rem"
      gap="0.25rem"
      borderRadius="625rem"
      borderColor="transparent"
      borderWidth="1px"
      _hover={{ bg: 'celery--6', borderColor: 'celery--6' }}
      _active={{ bg: 'celery--6', borderWidth: '1px', borderColor: 'celery--5' }}
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

export const ExtrernalLinkWrappable = forwardRef(({ children, ...props }: LinkProps, ref) => (
  <ExternalLink
    {...props}
    internalRef={ref}
  >
    {children}
  </ExternalLink>
));
ExtrernalLinkWrappable.displayName = 'ExtrernalLinkWrappable';
