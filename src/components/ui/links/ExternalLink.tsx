import { Link, LinkProps } from '@chakra-ui/react';

export default function ExternalLink({ children, ...rest }: LinkProps) {
  return (
    <Link
      color="gold.500"
      _hover={{ color: 'gold.500-hover' }}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: 'none' }}
      {...rest}
    >
      {children}
    </Link>
  );
}
