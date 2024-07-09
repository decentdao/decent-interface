import {
  Flex,
  Text,
  Box,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Grid,
} from '@chakra-ui/react';
import { CaretRight, CaretDown } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SablierPayroll, SablierVesting } from '../../../../../components/pages/Roles/types';

type AccordionItemRowProps = {
  title: string;
  value?: string;
  children?: ReactNode;
};

function AccordionItemRow({ title, value, children }: AccordionItemRowProps) {
  return (
    <Grid
      gap="0.5rem"
      my="0.5rem"
    >
      <Text
        color="neutral-7"
        textStyle="button-small"
      >
        {title}
      </Text>
      {children ?? <Text textStyle="body-base">{value}</Text>}
    </Grid>
  );
}

export default function PayrollAndVesting({
  payrollData,
  vestingData,
}: {
  payrollData?: SablierPayroll;
  vestingData?: SablierVesting;
}) {
  const { t } = useTranslation('roles');

  if (!payrollData && !vestingData) {
    return null;
  }

  return (
    <Accordion
      allowToggle
      allowMultiple
    >
      {payrollData && (
        <AccordionItem
          borderTop="none"
          borderBottom="none"
          padding="1rem"
          bg="neutral-3"
          borderRadius="0.5rem"
        >
          {({ isExpanded }) => {
            return (
              <>
                <AccordionButton
                  p={0}
                  textStyle="display-lg"
                  color="lilac-0"
                  gap="0.5rem"
                >
                  {isExpanded ? <CaretDown /> : <CaretRight />}
                  {t('payroll')}
                </AccordionButton>
                <AccordionPanel>
                  <AccordionItemRow title={t('amount')}>
                    <Flex
                      gap="0.75rem"
                      alignItems="center"
                    >
                      <Image
                        src={payrollData.asset.iconUri}
                        fallbackSrc="/images/coin-icon-default.svg"
                        alt={payrollData.asset.symbol}
                        w="2rem"
                        h="2rem"
                      />
                      <Box>
                        <Text textStyle="body-base">
                          {payrollData.payrollAmount} {payrollData.asset.symbol}
                        </Text>
                        <Text
                          color="neutral-7"
                          textStyle="button-small"
                        >
                          {payrollData.payrollAmountUSD}
                        </Text>
                      </Box>
                    </Flex>
                  </AccordionItemRow>
                  <AccordionItemRow
                    title={t('frequency')}
                    value={payrollData.payrollSchedule}
                  />
                  <AccordionItemRow
                    title={t('starting')}
                    value={payrollData.payrollStartDate}
                  />
                  <AccordionItemRow
                    title={t('ending')}
                    value={payrollData.payrollEndDate}
                  />
                </AccordionPanel>
              </>
            );
          }}
        </AccordionItem>
      )}
      {vestingData && (
        <AccordionItem
          borderTop="none"
          borderBottom="none"
          padding="1rem"
          bg="neutral-3"
          borderRadius="0.5rem"
          mt="0.5rem"
        >
          {({ isExpanded }) => {
            return (
              <>
                <AccordionButton
                  p={0}
                  textStyle="display-lg"
                  color="lilac-0"
                  gap="0.5rem"
                >
                  {isExpanded ? <CaretDown /> : <CaretRight />}
                  {t('vesting')}
                </AccordionButton>
                <AccordionPanel>
                  <AccordionItemRow title={t('amount')}>
                    <Flex
                      gap="0.75rem"
                      alignItems="center"
                    >
                      <Image
                        src={vestingData.asset.iconUri}
                        fallbackSrc="/images/coin-icon-default.svg"
                        alt={vestingData.asset.symbol}
                        w="2rem"
                        h="2rem"
                      />
                      <Box>
                        <Text textStyle="body-base">
                          {vestingData.vestingAmount} {vestingData.asset.symbol}
                        </Text>
                        <Text
                          color="neutral-7"
                          textStyle="button-small"
                        >
                          {vestingData.vestingAmountUSD}
                        </Text>
                      </Box>
                    </Flex>
                  </AccordionItemRow>
                  <AccordionItemRow
                    title={t('frequency')}
                    value={vestingData.vestingSchedule}
                  />
                  <AccordionItemRow
                    title={t('starting')}
                    value={vestingData.vestingStartDate}
                  />
                  <AccordionItemRow
                    title={t('ending')}
                    value={vestingData.vestingEndDate}
                  />
                </AccordionPanel>
              </>
            );
          }}
        </AccordionItem>
      )}
    </Accordion>
  );
}
