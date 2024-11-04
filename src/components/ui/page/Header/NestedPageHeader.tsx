import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { ArrowLeft } from '@phosphor-icons/react';
import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

export default function NestedPageHeader({
  title,
  backButtonText,
  backButtonHref,
  children,
}: PropsWithChildren<{ title: string; backButtonText: string; backButtonHref: string }>) {
  return (
    <Flex
      py={6}
      justifyContent="space-between"
      alignItems="center"
    >
      <Box width="25%">
        <Button
          variant="link"
          width="min-content"
          as={Link}
          to={backButtonHref}
          color="neutral-7"
          padding={0}
          leftIcon={<ArrowLeft />}
        >
          {backButtonText}
        </Button>
      </Box>
      <Text textStyle="body-base-strong">{title}</Text>
      {children || <Box width="25%" />}
    </Flex>
  );
}
