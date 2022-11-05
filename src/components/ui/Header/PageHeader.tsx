import { Box, Divider, Flex, Spacer, Text } from '@chakra-ui/react';
import { Button } from '@decent-org/fractal-ui';

/**
 * A component which displays a page title and an optional action button.
 * Intended to be used as the main title for a page.
 */
function PageHeader({
  title,
  titleTestId,
  buttonText,
  buttonClick,
  buttonTestId,
}: {
  title: string;
  titleTestId: string;
  buttonText?: string;
  buttonClick?: () => void;
  buttonTestId?: string;
}) {
  return (
    <Box
      marginTop="3rem"
      marginBottom="2rem"
    >
      <Flex
        w="full"
        align="center"
      >
        <Text
          data-testid={titleTestId}
          textStyle="text-2xl-mono-regular"
          color="grayscale.100"
        >
          {title}
        </Text>
        <Spacer />
        {buttonText && (
          <Button
            onClick={buttonClick}
            data-testid={buttonTestId}
            size="sm"
          >
            {buttonText}
          </Button>
        )}
      </Flex>
      <Divider marginTop="1rem" />
    </Box>
  );
}
export default PageHeader;
