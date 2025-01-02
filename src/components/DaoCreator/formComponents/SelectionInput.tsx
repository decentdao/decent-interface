import { Box, Flex, Icon, Image, RadioGroup } from '@chakra-ui/react';
import { CheckCircle } from '@phosphor-icons/react';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { RadioWithText } from '../../ui/forms/Radio/RadioWithText';
import { DropdownMenu } from '../../ui/menus/DropdownMenu';

export interface ISelectionOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  testId?: string;
}

export interface ISelection {
  label: string;
  description?: string;
  selected?: string; // selected item
  options: ISelectionOption[];
  onChange: (value: string) => void;
}

export function DropdownMenuSelection({
  label,
  description,
  selected,
  options,
  onChange,
}: ISelection) {
  return (
    <Box
      mt="2rem"
      mb="1.5rem"
    >
      <LabelComponent
        label={label}
        helper={description}
        isRequired
        alignLabel="flex-start"
      >
        <DropdownMenu
          items={options}
          selectedItem={options.find(item => item.value === selected)}
          onSelect={item => {
            onChange(item.value);
          }}
          title={label}
          isDisabled={false}
          renderItem={(item, isSelected) => {
            return (
              <>
                <Flex
                  alignItems="center"
                  gap="1rem"
                >
                  <Image
                    src={item.icon}
                    fallbackSrc="/images/coin-icon-default.svg"
                    boxSize="2rem"
                  />
                  {item.label}
                </Flex>
                {isSelected && (
                  <Icon
                    as={CheckCircle}
                    boxSize="1.5rem"
                    color="lilac-0"
                  />
                )}
              </>
            );
          }}
        />
      </LabelComponent>
    </Box>
  );
}

export function RadioSelection({ label, description, selected, options, onChange }: ISelection) {
  return (
    <Box
      mt="2rem"
      mb="1.5rem"
    >
      <LabelComponent
        label={label}
        helper={description}
        isRequired
      >
        <RadioGroup
          display="flex"
          flexDirection="column"
          name="governance"
          gap={4}
          mt="-0.5rem" // RadioGroup renders empty paragraph with margin, seems like this is only feasible way to align this group
          id="governance"
          value={selected}
          onChange={onChange}
        >
          {options.map(option => (
            <RadioWithText
              key={option.value}
              label={option.label}
              description={option.description ?? ''}
              testId={option.testId ?? option.value}
              value={option.value}
            />
          ))}
        </RadioGroup>
      </LabelComponent>
    </Box>
  );
}
