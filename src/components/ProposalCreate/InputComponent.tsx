import { Input, HStack, Text, Textarea, Grid, GridItem } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';

interface BaseProps {
  label: string;
  helper: string;
  isRequired: boolean;
  value: string;
  disabled: boolean;
  exampleText: string;
  errorMessage?: string;
  children: React.ReactNode;
}

interface InputProps extends Omit<BaseProps, 'children'> {
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
}

interface TextareaProps extends Omit<BaseProps, 'children'> {
  onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
}

// TODO. this is the style to be applied to the example text once a JSX component can be passed to LabelWrapper
// const exampleLabelStyle = {
//   bg: 'chocolate.700',
//   borderRadius: '4px',
//   p: '3px 4px',
//   color: 'grayscale.100',
//   fontSize: '12px',
// };

function BaseComponent(props: BaseProps) {
  const { t } = useTranslation(['proposal', 'common']);
  const { label, helper, isRequired, exampleText, errorMessage, children } = props;
  return (
    <Grid
      columnGap={3}
      templateColumns="1fr 2fr"
      fontSize="14px"
      alignItems="start"
    >
      <GridItem>
        <HStack pb={1}>
          <Text>{label}</Text>
          {isRequired && <Text color="gold.500">*</Text>}
        </HStack>
        <Text color="grayscale.500">{helper}</Text>
      </GridItem>
      <GridItem>
        <LabelWrapper
          subLabel={`${t('example')}: ${exampleText}`}
          errorMessage={errorMessage}
        >
          {children}
        </LabelWrapper>
      </GridItem>
    </Grid>
  );
}

export function InputComponent(props: InputProps) {
  const { value, disabled, onChange } = props;
  return (
    <BaseComponent {...props}>
      <Input
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </BaseComponent>
  );
}

export function TextareaComponent(props: TextareaProps) {
  const { value, disabled, onChange } = props;
  return (
    <BaseComponent {...props}>
      <Textarea
        resize="none"
        onChange={onChange}
        value={value}
        disabled={disabled}
      ></Textarea>
    </BaseComponent>
  );
}
