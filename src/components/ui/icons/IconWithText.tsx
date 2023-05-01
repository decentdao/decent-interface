import { Link } from '@chakra-ui/next-js';
import { HStack, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface IconWithTextProps {
  icon: ReactNode;
  label: string;
  url: string;
  testid: string;
}

export default function IconWithText({ icon, label, url, testid }: IconWithTextProps) {
  return (
    <Link
      data-testid={testid}
      href={url}
      target="_blank"
    >
      <HStack>
        {icon}
        <Text
          textStyle="text-button-md-semibold"
          color="gold.500"
        >
          {label}
        </Text>
      </HStack>
    </Link>
  );
}
