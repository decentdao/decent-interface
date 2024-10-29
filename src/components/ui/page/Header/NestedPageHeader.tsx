import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { ArrowLeft } from '@phosphor-icons/react';
import { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NestedPageHeader({
  title,
  backButtonText,
  children,
}: PropsWithChildren<{ title: string; backButtonText: string }>) {
  const navigate = useNavigate();
  return (
    <Flex
      py={6}
      justifyContent="space-between"
      alignItems="center"
    >
      <Button
        variant="link"
        color="neutral-7"
        padding={0}
        onClick={() => navigate(-1)}
        leftIcon={<ArrowLeft />}
        width="25%"
      >
        {backButtonText}
      </Button>
      <Text
        textStyle="body-base-strong"
        width="50%"
        textAlign="center"
      >
        {title}
      </Text>
      {children ?? <Box width="25%" />}
    </Flex>
  );
}
