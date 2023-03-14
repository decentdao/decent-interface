import { Flex, Text } from '@chakra-ui/react';
import { Info } from '@decent-org/fractal-ui';

interface ContentBannerProps {
  description: string;
}

function ContentBanner({ description }: ContentBannerProps) {
  return (
    <Flex
      alignItems="center"
      bg="black.500"
      borderTop="1px solid"
      borderColor="sand.500"
      my="2rem"
      p="1rem"
      color="grayscale.100"
      textStyle="text-sm-sans-regular"
      gap="2"
    >
      <Info boxSize="1.5rem" />
      <Text>{description}</Text>
    </Flex>
  );
}

export default ContentBanner;
