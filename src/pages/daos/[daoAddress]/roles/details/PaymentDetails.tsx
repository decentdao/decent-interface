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
import { SablierVesting } from '../../../../../components/pages/Roles/types';

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

export default function PaymentDetails({ vesting }: { vesting?: SablierVesting }) {
  const { t } = useTranslation('roles');

  if (!vesting) {
    return null;
  }

  return (
    <Accordion
      allowToggle
      allowMultiple
    >
      {vesting && (
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
                        src={vesting.asset.logo}
                        fallbackSrc="/images/coin-icon-default.svg"
                        alt={vesting.asset.symbol}
                        w="2rem"
                        h="2rem"
                      />
                      <Box>
                        <Text textStyle="body-base">
                          {vesting.amount.value} {vesting.asset.symbol}
                        </Text>
                        <Text
                          color="neutral-7"
                          textStyle="button-small"
                        >
                          {vesting.amount.value}
                        </Text>
                      </Box>
                    </Flex>
                  </AccordionItemRow>
                  <AccordionItemRow
                    title={t('starting')}
                    value={vesting.scheduleFixedDate?.startDate?.toDateString()}
                  />
                  <AccordionItemRow
                    title={t('ending')}
                    value={vesting.scheduleFixedDate?.startDate?.toDateString()}
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
