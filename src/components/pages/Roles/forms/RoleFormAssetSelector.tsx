import {
  FormControl,
  Menu,
  MenuButton,
  Button,
  Flex,
  Text,
  Icon,
  MenuList,
  Divider,
  MenuItem,
  Image,
} from '@chakra-ui/react';
import { CaretDown, CheckCircle } from '@phosphor-icons/react';
import { useFormikContext, Field, FieldProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CARD_SHADOW } from '../../../../constants/common';
import { useFractal } from '../../../../providers/App/AppProvider';
import { BigIntValuePair } from '../../../../types';
import { formatUSD } from '../../../../utils';
import { MOCK_MORALIS_ETH_ADDRESS } from '../../../../utils/address';
import { BigIntInput } from '../../../ui/forms/BigIntInput';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { EaseOutComponent } from '../../../ui/utils/EaseOutComponent';
import { RoleFormValues } from '../types';

export function AssetSelector() {
  const { t } = useTranslation(['roles', 'treasury', 'modals']);
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const fungibleAssetsWithBalance = assetsFungible.filter(
    asset =>
      parseFloat(asset.balance) > 0 &&
      asset.tokenAddress.toLowerCase() !== MOCK_MORALIS_ETH_ADDRESS.toLowerCase(), // Can't stream native token
  );
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  const selectedAsset = values.roleEditing?.vesting?.asset;
  return (
    <>
      <FormControl my="0.5rem">
        <Field name="roleEditing.vesting.asset">
          {({ field }: FieldProps<string, RoleFormValues>) => (
            <Menu
              placement="bottom-end"
              offset={[0, 8]}
            >
              <>
                <MenuButton
                  as={Button}
                  variant="unstyled"
                  bgColor="transparent"
                  p={0}
                  sx={{
                    '&:hover': {
                      'vesting-menu-asset': {
                        color: 'lilac--1',
                        bg: 'white-alpha-04',
                      },
                    },
                  }}
                >
                  <Flex
                    alignItems="center"
                    gap={2}
                  >
                    <Flex
                      gap={2}
                      alignItems="center"
                      border="1px solid"
                      borderColor="neutral-3"
                      borderRadius="9999px"
                      w="fit-content"
                      px="1rem"
                      className="vesting-menu-asset"
                      py="0.5rem"
                    >
                      <Image
                        src={selectedAsset?.logo}
                        fallbackSrc="/images/coin-icon-default.svg"
                        boxSize="2rem"
                      />
                      <Text
                        textStyle="label-base"
                        color="white-0"
                      >
                        {selectedAsset?.symbol ?? t('selectLabel', { ns: 'modals' })}
                      </Text>
                    </Flex>
                    <Icon
                      as={CaretDown}
                      boxSize="1.5rem"
                    />
                  </Flex>
                </MenuButton>
                <MenuList
                  zIndex={1}
                  bg="linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.04) 100%), #221D25"
                  py="1rem"
                  boxShadow={CARD_SHADOW}
                  borderRadius="0.5rem"
                  px="0.25rem"
                  w={{ base: '300px', md: '428px' }}
                >
                  <EaseOutComponent>
                    <Text
                      textStyle="display-lg"
                      px="1rem"
                    >
                      {t('titleAssets', { ns: 'treasury' })}
                    </Text>
                    <Divider
                      variant="darker"
                      my="1rem"
                    />
                    {fungibleAssetsWithBalance.map((asset, index) => {
                      const isSelected = selectedAsset?.address === asset.tokenAddress;
                      return (
                        <MenuItem
                          key={index}
                          p="1rem"
                          _hover={{ bg: 'neutral-4' }}
                          display="flex"
                          alignItems="center"
                          gap={2}
                          justifyContent="space-between"
                          w="full"
                          onClick={() => {
                            setFieldValue(field.name, {
                              address: fungibleAssetsWithBalance[index].tokenAddress,
                              symbol: fungibleAssetsWithBalance[index].symbol,
                              logo: fungibleAssetsWithBalance[index].logo,
                              balance: fungibleAssetsWithBalance[index].balance,
                              balanceFormatted: fungibleAssetsWithBalance[index].balanceFormatted,
                              decimals: fungibleAssetsWithBalance[index].decimals,
                            });
                          }}
                        >
                          <Flex
                            alignItems="center"
                            gap="1rem"
                          >
                            <Image
                              src={asset.logo ?? asset.thumbnail}
                              fallbackSrc="/images/coin-icon-default.svg"
                              boxSize="2rem"
                            />
                            <Flex flexDir="column">
                              <Text
                                textStyle="label-base"
                                color="white-0"
                              >
                                {asset.symbol}
                              </Text>
                              <Flex
                                alignItems="center"
                                gap={2}
                              >
                                <Text
                                  textStyle="button-base"
                                  color="neutral-7"
                                >
                                  {asset.balanceFormatted}
                                </Text>
                                <Text
                                  textStyle="button-base"
                                  color="neutral-7"
                                >
                                  {asset.symbol}
                                </Text>
                                {asset.usdValue && (
                                  <>
                                    <Text
                                      textStyle="button-base"
                                      color="neutral-7"
                                    >
                                      {'•'}
                                    </Text>
                                    <Text
                                      textStyle="button-base"
                                      color="neutral-7"
                                    >
                                      {formatUSD(asset.usdValue)}
                                    </Text>
                                  </>
                                )}
                              </Flex>
                            </Flex>
                          </Flex>
                          {isSelected && (
                            <Icon
                              as={CheckCircle}
                              boxSize="1.5rem"
                              color="lilac-0"
                            />
                          )}
                        </MenuItem>
                      );
                    })}
                  </EaseOutComponent>
                </MenuList>
              </>
            </Menu>
          )}
        </Field>
      </FormControl>
      <FormControl my="1rem">
        <Field name="roleEditing.vesting.amount">
          {({
            field,
            meta,
            form: { setFieldTouched },
          }: FieldProps<BigIntValuePair, RoleFormValues>) => {
            return (
              <LabelWrapper
                label={t('totalAmount')}
                errorMessage={meta.error}
              >
                <BigIntInput
                  isDisabled={!values?.roleEditing?.vesting?.asset}
                  value={field.value?.bigintValue}
                  onChange={valuePair => {
                    setFieldValue(field.name, valuePair, true);
                  }}
                  onBlur={() => {
                    setFieldTouched(field.name, true);
                  }}
                />
              </LabelWrapper>
            );
          }}
        </Field>
      </FormControl>
    </>
  );
}
