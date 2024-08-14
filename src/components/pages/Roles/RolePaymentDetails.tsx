import { Box, Divider, Flex, Grid, GridItem, Icon, Image, Text } from '@chakra-ui/react';
import { Calendar } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { DETAILS_INNER_SHADOW, DETAILS_SHADOW } from '../../../constants/common';
import { DEFAULT_DATE_FORMAT } from '../../../utils';
import { SablierPayment } from './types';

function PaymentDate({ label, date }: { label: string; date: Date }) {
  const { t } = useTranslation(['roles']);
  return (
    <Flex
      flexDir="column"
      gap="0.5rem"
    >
      <Text
        textStyle="label-small"
        color="neutral-7"
      >
        {t(label)}
      </Text>
      <Flex gap="0.25rem">
        <Icon
          boxSize="1rem"
          as={Calendar}
        />
        <Text
          textStyle="label-small"
          color="neutral-7"
        >
          {format(date, DEFAULT_DATE_FORMAT)}
        </Text>
      </Flex>
    </Flex>
  );
}

interface RolePaymentDetailsProps {
  payment: SablierPayment;
}
export function RolePaymentDetails({ payment }: RolePaymentDetailsProps) {
  const { t } = useTranslation(['roles']);
  return (
    <Box
      boxShadow={DETAILS_SHADOW}
      bg="neutral-2"
      borderRadius="0.5rem"
      py="1rem"
      my="0.5rem"
      w="full"
    >
      <Box>
        <Flex
          flexDir="column"
          mx={4}
        >
          <Flex justifyContent="space-between">
            <Text
              textStyle="display-2xl"
              color="white-0"
            >
              52,000
            </Text>
            <Flex
              gap={2}
              alignItems="center"
              border="1px solid"
              borderColor="neutral-4"
              borderRadius="9999px"
              w="fit-content"
              className="payment-menu-asset"
              p="0.5rem"
            >
              <Image
                src={payment.asset.logo}
                fallbackSrc="/images/coin-icon-default.svg"
                boxSize="1.5rem"
              />
              <Text
                textStyle="label-base"
                color="white-0"
              >
                {payment.asset.symbol ?? t('selectLabel', { ns: 'modals' })}
              </Text>
            </Flex>
          </Flex>
          <Flex justifyContent="space-between">
            <Text
              textStyle="label-small"
              color="neutral-7"
            >
              $52,000
            </Text>
            <Flex
              alignItems="center"
              gap="0.5rem"
            >
              <Box
                boxSize="0.75rem"
                borderRadius="100%"
                bg="celery--2"
                border="2px solid"
                borderColor="celery--5"
              />
              <Text
                textStyle="label-small"
                color="white-0"
              >
                1,000 USDC / week
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Box>
      <Divider
        boxShadow={DETAILS_SHADOW}
        border="1px solid"
        borderColor="white-alpha-08"
        my="1rem"
      />
      <Grid
        mx={4}
        templateAreas='"starting dividerOne cliff dividerTwo ending"'
        templateColumns="1fr 24px 1fr 24px 1fr"
      >
        <GridItem area="starting">
          <PaymentDate
            label="Starting"
            date={new Date()}
          />
        </GridItem>
        <GridItem area="dividerOne">
          <Divider
            orientation="vertical"
            border="1px solid"
            borderColor="white-alpha-08"
            boxShadow={DETAILS_INNER_SHADOW}
            w="0"
          />
        </GridItem>
        <GridItem area="cliff">
          <PaymentDate
            label="Cliff"
            date={new Date()}
          />
        </GridItem>
        <GridItem area="dividerTwo">
          <Divider
            orientation="vertical"
            border="1px solid"
            borderColor="white-alpha-08"
            dropShadow={DETAILS_INNER_SHADOW}
            w="0"
          />
        </GridItem>
        <GridItem area="ending">
          <PaymentDate
            label="Ending"
            date={new Date()}
          />
        </GridItem>
      </Grid>
    </Box>
  );
}
