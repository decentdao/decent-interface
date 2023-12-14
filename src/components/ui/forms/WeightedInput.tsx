import { IconButton, Flex, Input, Text } from '@chakra-ui/react';
import { AddPlus, Minus } from '@decent-org/fractal-ui';

interface IWeightedInput {
  onChange: (value: number) => void;
  label: string;
  value: number;
  totalValue: number;
}

export default function WeightedInput({ label, value, totalValue, onChange }: IWeightedInput) {
  return (
    <Flex
      color="gold.500"
      bg="chocolate.500"
      borderRadius="0.5rem"
      mt={4}
      mb={4}
      py={1}
      px={4}
    >
      <Flex
        width="50%"
        alignItems="center"
      >
        <Text>{label}</Text>
      </Flex>
      <Flex
        width="50%"
        alignItems="center"
        justifyContent="space-between"
      >
        <IconButton
          aria-label={`Reduce vote weight for ${label}`}
          p={1}
          minW="24px"
          h="24px"
          variant="secondary"
          border="none"
          bg="chocolate.700"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={!value}
        >
          <Minus />
        </IconButton>
        <Input
          onChange={e => onChange(Math.max(parseInt(e.target.value), 0))}
          value={value.toString()}
          type="number"
          border="none"
          bg="transparent"
          padding={0}
          textAlign="center"
          color="gold.500"
          width="48px"
        />
        <IconButton
          aria-label={`Increase vote weight for ${label}`}
          p={1}
          minW="24px"
          h="24px"
          variant="secondary"
          border="none"
          bg="chocolate.700"
          onClick={() => onChange(value + 1)}
          mr={3}
        >
          <AddPlus />
        </IconButton>
        <Text>{totalValue ? ((value * 100) / totalValue).toFixed(2) : 0}%</Text>
      </Flex>
    </Flex>
  );
}
