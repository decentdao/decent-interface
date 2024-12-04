import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address } from 'viem';
import { NEUTRAL_2_82_TRANSPARENT } from '../../../../constants/common';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { EaseOutComponent } from '../../utils/EaseOutComponent';

export function CreateProposalMenu({ safeAddress }: { safeAddress: Address }) {
  const { t } = useTranslation('proposal');

  const { addressPrefix } = useNetworkConfig();

  const navigate = useNavigate();

  return (
    <Box>
      <Menu
        placement="bottom-end"
        offset={[0, 4]}
      >
        {({ isOpen }) => (
          <Fragment>
            <MenuButton
              as={Button}
              variant="secondary"
              border="1px solid transparent"
              borderRadius="0.75rem"
              _hover={{ bg: 'neutral-2' }}
              _active={{
                color: 'lilac-0',
                border: '1px solid',
                borderColor: 'neutral-3',
                bg: 'neutral-2',
              }}
            >
              <Flex
                alignItems="center"
                gap={2}
              >
                <Text>{t('createProposal')}</Text>
                <Icon
                  as={CaretDown}
                  boxSize="1.5rem"
                />
              </Flex>
            </MenuButton>
            {isOpen && (
              <EaseOutComponent>
                <MenuList>
                  <Box
                    backdropFilter="auto"
                    bg={NEUTRAL_2_82_TRANSPARENT}
                    backdropBlur="10px"
                    border="1px solid"
                    borderColor="neutral-3"
                    className="scroll-dark"
                    maxHeight="20rem"
                    overflowY="auto"
                    rounded="0.75rem"
                    py="0.25rem"
                  >
                    <Box px="0.15rem">
                      <MenuItem
                        as={Button}
                        variant="tertiary"
                        h="2.5rem"
                        onClick={() =>
                          navigate(DAO_ROUTES.proposalNew.relative(addressPrefix, safeAddress))
                        }
                        noOfLines={1}
                        display="flex"
                        alignItems="center"
                        justifyContent="flex-start"
                        rounded="0.75rem"
                        gap={2}
                      >
                        <Flex flexDir="column">
                          <Text>{t('createFromScratch')}</Text>
                        </Flex>
                      </MenuItem>
                    </Box>
                    <Divider my="0.25rem" />
                    <Box px="0.15rem">
                      <MenuItem
                        as={Button}
                        variant="tertiary"
                        h="2.5rem"
                        onClick={() =>
                          navigate(
                            DAO_ROUTES.proposalTemplates.relative(addressPrefix, safeAddress),
                          )
                        }
                        noOfLines={1}
                        display="flex"
                        alignItems="center"
                        justifyContent="flex-start"
                        rounded="0.75rem"
                        gap={2}
                      >
                        <Flex flexDir="column">
                          <Text>{t('browseTemplates')}</Text>
                        </Flex>
                      </MenuItem>
                    </Box>
                  </Box>
                </MenuList>
              </EaseOutComponent>
            )}
          </Fragment>
        )}
      </Menu>
    </Box>
  );
}
