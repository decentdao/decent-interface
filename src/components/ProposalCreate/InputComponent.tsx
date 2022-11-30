import {
  Flex,
  Input,
  Button,
  HStack,
  VStack,
  Text,
  Textarea,
  Box,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { constants, ethers } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logError } from '../../helpers/errorLogging';
import { checkAddress } from '../../hooks/utils/useAddress';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';
import { TransactionData } from '../../types/transaction';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';

interface InputProps {
  label: string;
  helper: string;
  isRequired: boolean;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  disabled: boolean;
  exampleText: string;
  errorMessage?: string;
}

const lableStyleTODO = {
  bg: 'chocolate.700',
  borderRadius: '4px',
  p: '3px 4px',
  color: 'grayscale.100',
  fontSize: '12px',
};

export function InputComponent(props: InputProps) {
  const { t } = useTranslation(['proposal', 'common']);
  const { label, helper, isRequired, value, onChange, disabled, exampleText, errorMessage } = props;
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
          <Input
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </LabelWrapper>
      </GridItem>
    </Grid>
  );
}
