import { Text, TextProps } from '@chakra-ui/react';

interface Props extends TextProps {
  text: string;
}

/**
 * Handles properly displaying line breaks in a string.
 */
export default function LineBreakBlock({ text, ...rest }: Props) {
  const split = text.split(/\r?\n/);
  return (
    <Text {...rest}>
      {split.map((s, index) => (
        // display each line as a separate <Text> element
        // if it's a line break only, display an empty character
        <Text key={index}>{s.length > 0 ? s : '​'}</Text>
      ))}
    </Text>
  );
}
