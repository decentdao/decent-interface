import {
  Show,
  Flex,
  Icon,
  IconButton,
  Text,
  Box,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Grid,
} from '@chakra-ui/react';
import { PencilLine, CaretRight, CaretDown } from '@phosphor-icons/react';
import { useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AvatarAndRoleName } from '../../../../../components/pages/Roles/RoleCard';
import DraggableDrawer from '../../../../../components/ui/containers/DraggableDrawer';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { mockHats, mockPayroll } from '../../../../../mocks/roles';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/useRolesState';

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

export default function RoleDetails() {
  const [open, setOpen] = useState(true);
  const {
    node: { daoAddress },
  } = useFractal();
  const { t } = useTranslation('roles');
  const { hatsTree } = useRolesState();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (!daoAddress) return null;
  const hatIndex = searchParams.get('hatIndex')
    ? parseInt(searchParams.get('hatIndex') as string)
    : -1;
  const hat = mockHats[0];
  const roleHat = hatsTree?.roleHats[hatIndex];
  //   if (hat === undefined) return null; @todo - uncomment

  const handleEditRoleClick = () => {
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, hatIndex));
    setOpen(false);
  };

  const handleDrawerClose = () => {
    navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress));
    setOpen(false);
  };

  return (
    <>
      <Show below="md">
        <DraggableDrawer
          isOpen={open}
          onOpen={() => setOpen(true)}
          onClose={handleDrawerClose}
          headerContent={
            <Flex
              justifyContent="space-between"
              mx="-0.5rem"
            >
              <AvatarAndRoleName
                wearerAddress={hat.wearer}
                name={hat.name}
              />
              <Flex
                alignItems="center"
                gap="1rem"
              >
                <IconButton
                  variant="tertiary"
                  aria-label="Edit Role"
                  onClick={handleEditRoleClick}
                  size="icon-sm"
                  icon={
                    <Icon
                      as={PencilLine}
                      color="lilac-0"
                      aria-hidden
                      weight="fill"
                    />
                  }
                />
              </Flex>
            </Flex>
          }
        >
          <Box
            px="1rem"
            mb="1rem"
          >
            <Text
              color="neutral-7"
              textStyle="button-small"
            >
              {t('roleDescription')}
            </Text>
            <Text textStyle="body-base">{hat.description}</Text>
          </Box>
          <Box
            px="1rem"
            mb="1.5rem"
          >
            <Accordion
              allowToggle
              allowMultiple
            >
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
                              src={mockPayroll.asset.iconUri}
                              fallbackSrc="/images/coin-icon-default.svg"
                              alt={mockPayroll.asset.symbol}
                              w="2rem"
                              h="2rem"
                            />
                            <Box>
                              <Text textStyle="body-base">
                                {mockPayroll.payrollAmount} {mockPayroll.asset.symbol}
                              </Text>
                              <Text
                                color="neutral-7"
                                textStyle="button-small"
                              >
                                {mockPayroll.payrollAmountUSD}
                              </Text>
                            </Box>
                          </Flex>
                        </AccordionItemRow>
                        <AccordionItemRow
                          title={t('frequency')}
                          value={mockPayroll.payrollSchedule}
                        />
                        <AccordionItemRow
                          title={t('starting')}
                          value={mockPayroll.payrollStartDate}
                        />
                        <AccordionItemRow
                          title={t('ending')}
                          value={mockPayroll.payrollEndDate}
                        />
                      </AccordionPanel>
                    </>
                  );
                }}
              </AccordionItem>
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
                              src={mockPayroll.asset.iconUri}
                              fallbackSrc="/images/coin-icon-default.svg"
                              alt={mockPayroll.asset.symbol}
                              w="2rem"
                              h="2rem"
                            />
                            <Box>
                              <Text textStyle="body-base">
                                {mockPayroll.payrollAmount} {mockPayroll.asset.symbol}
                              </Text>
                              <Text
                                color="neutral-7"
                                textStyle="button-small"
                              >
                                {mockPayroll.payrollAmountUSD}
                              </Text>
                            </Box>
                          </Flex>
                        </AccordionItemRow>
                        <AccordionItemRow
                          title={t('frequency')}
                          value={mockPayroll.payrollSchedule}
                        />
                        <AccordionItemRow
                          title={t('starting')}
                          value={mockPayroll.payrollStartDate}
                        />
                        <AccordionItemRow
                          title={t('ending')}
                          value={mockPayroll.payrollEndDate}
                        />
                      </AccordionPanel>
                    </>
                  );
                }}
              </AccordionItem>
            </Accordion>
          </Box>
        </DraggableDrawer>
      </Show>
      <Show above="md">{/* @todo - show hat details side modal */}</Show>
    </>
  );
}
