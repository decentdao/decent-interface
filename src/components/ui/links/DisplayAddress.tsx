import { Flex, Text, Icon, LinkProps } from '@chakra-ui/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import EtherscanLink from './EtherscanLink';

export function DisplayAddress({
  address,
  truncate,
  children,
  ...rest
}: {
  address: string;
  truncate?: boolean | undefined;
  children?: ReactNode;
} & LinkProps) {
  const displayAddress = useDisplayName(address, truncate);
  return (
    <EtherscanLink
      {...rest}
      type="address"
      value={address}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        minW="fit-content"
      >
        <Text
          as="span"
          isTruncated
        >
          {children || displayAddress.displayName}
        </Text>
        <Icon
          as={ArrowUpRight}
          ml="0.5rem"
        />
      </Flex>
    </EtherscanLink>
  );
}
