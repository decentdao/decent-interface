import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  Flex,
  Icon,
  AccordionPanel,
  Text,
} from '@chakra-ui/react';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { getAddress, Hex } from 'viem';
import NoDataCard from '../../ui/containers/NoDataCard';
import RoleTerm from './RoleTerm';
import { RoleFormTermStatus } from './types';

type RoleTermDetailProp = {
  nominee: string;
  termEndDate: Date;
  termNumber: number;
};

type CurrentTermProp = RoleTermDetailProp & { termStatus: 'active' | 'inactive' };

function RoleTermRenderer({
  roleTerm,
  termStatus,
  displayLightContainer,
  hatId,
}: {
  hatId: Hex | undefined;
  roleTerm?: RoleTermDetailProp;
  termStatus: RoleFormTermStatus;
  displayLightContainer?: boolean;
}) {
  if (!roleTerm?.nominee || !roleTerm?.termEndDate || !hatId) {
    return null;
  }
  return (
    <RoleTerm
      hatId={hatId}
      termNominatedWearer={getAddress(roleTerm.nominee)}
      termEndDate={roleTerm.termEndDate}
      termStatus={termStatus}
      termNumber={roleTerm.termNumber}
      displayLightContainer={displayLightContainer}
    />
  );
}

function RoleTermExpiredTerms({
  hatId,
  roleTerms,
}: {
  hatId: Hex | undefined;
  roleTerms?: RoleTermDetailProp[];
}) {
  const { t } = useTranslation('roles');
  if (!roleTerms?.length) {
    return null;
  }
  return (
    <Box
      borderRadius="0.5rem"
      boxShadow="layeredShadowBorder"
    >
      <Accordion allowToggle>
        <AccordionItem
          borderTop="none"
          borderBottom="none"
          borderTopRadius="0.5rem"
          borderBottomRadius="0.5rem"
        >
          {({ isExpanded }) => (
            <>
              <AccordionButton
                borderTopRadius="0.5rem"
                borderBottomRadius="0.5rem"
                p="1rem"
              >
                <Flex
                  alignItems="center"
                  gap={2}
                >
                  <Icon
                    as={!isExpanded ? CaretDown : CaretRight}
                    boxSize="1.25rem"
                    color="lilac-0"
                  />
                  <Text
                    textStyle="button-base"
                    color="lilac-0"
                  >
                    {t('showPreviousTerms')}
                  </Text>
                </Flex>
              </AccordionButton>
              <Flex
                flexDir="column"
                gap={4}
              >
                {roleTerms.map((term, index) => {
                  return (
                    <AccordionPanel
                      key={index}
                      px="1rem"
                    >
                      <RoleTermRenderer
                        key={index}
                        hatId={hatId}
                        roleTerm={term}
                        termStatus={RoleFormTermStatus.Expired}
                        displayLightContainer
                      />
                    </AccordionPanel>
                  );
                })}
              </Flex>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </Box>
  );
}

export default function RoleTermDetails({
  hatId,
  currentTerm,
  nextTerm,
  expiredTerms,
}: {
  hatId: Hex | undefined;
  nextTerm: RoleTermDetailProp | undefined;
  currentTerm: CurrentTermProp | undefined;
  expiredTerms: RoleTermDetailProp[];
}) {
  return (
    <Flex
      flexDir="column"
      gap={4}
    >
      {!currentTerm && (
        <NoDataCard
          translationNameSpace="roles"
          emptyText="noActiveTerms"
          emptyTextNotProposer="noActiveTermsNotProposer"
        />
      )}
      <RoleTermRenderer
        hatId={hatId}
        roleTerm={nextTerm}
        termStatus={nextTerm ? RoleFormTermStatus.Queued : RoleFormTermStatus.Pending}
      />
      <RoleTermRenderer
        hatId={hatId}
        roleTerm={currentTerm}
        termStatus={currentTerm ? RoleFormTermStatus.Current : RoleFormTermStatus.Pending}
      />
      <RoleTermExpiredTerms
        roleTerms={expiredTerms}
        hatId={hatId}
      />
    </Flex>
  );
}
