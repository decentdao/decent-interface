import { Button, Flex, Text } from '@chakra-ui/react';
import { Trash, WarningCircle } from '@phosphor-icons/react';

interface UnsavedChangesWarningContentProps {
  onDiscard: () => void;
  onKeepEditing: () => void;
}

export function UnsavedChangesWarningContent({
  onDiscard,
  onKeepEditing,
}: UnsavedChangesWarningContentProps) {
  return (
    <>
      <Flex
        height="full"
        direction="column"
        alignItems="center"
        my="1.5rem"
      >
        <WarningCircle size="2.5rem" />
        <Text
          mt="1rem"
          textStyle="display-xl"
        >
          Unsaved Changes
        </Text>
        <Text
          mt="0.5rem"
          textStyle="body-base"
          textAlign="center"
        >
          You have unsaved changes that will be lost if you continue. Do you want to discard your
          changes?
        </Text>
      </Flex>
      <Flex
        justifyContent="center"
        gap="0.75rem"
      >
        <Button
          color="red-1"
          borderWidth="1px"
          borderColor="red-1"
          border-radius="0.25rem"
          leftIcon={<Trash />}
          variant="outline"
          px="2rem"
          onClick={onDiscard}
        >
          Discard
        </Button>
        <Button
          onClick={onKeepEditing}
          px="2rem"
        >
          Keep Editing
        </Button>
      </Flex>
    </>
  );
}
