import { Avatar, Flex, Text } from '@chakra-ui/react';
import { VEllipsis } from '@decent-org/fractal-ui';
import { logError } from '../../helpers/errorLogging';
import { ProposalTemplate } from '../../types/createProposalTemplate';
import ContentBox from '../ui/containers/ContentBox';
import { OptionMenu } from '../ui/menus/OptionMenu';

type ProposalTemplateCardProps = {
  proposalTemplate: ProposalTemplate;
};

export default function ProposalTemplateCard({
  proposalTemplate: { title, description },
}: ProposalTemplateCardProps) {
  const manageTemplateOptions = [
    {
      optionKey: 'optionRemoveTemplate',
      onClick: () => logError('Removing Proposal Template not yet implemented. Sorry dude :('),
    },
  ];

  return (
    <ContentBox maxWidth="420px">
      <Flex justifyContent="space-between">
        <Avatar
          size="lg"
          w="50px"
          h="50px"
          name={title}
          borderRadius="4px"
          getInitials={(_title: string) => _title.slice(0, 2)}
        />
        <OptionMenu
          trigger={
            <VEllipsis
              boxSize="1.5rem"
              mt="0.25rem"
            />
          }
          titleKey="titleManageProposalTemplate"
          options={manageTemplateOptions}
          namespace="menu"
        />
      </Flex>
      <Text
        textStyle="text-lg-mono-regular"
        color="grayscale.100"
        marginTop="2rem"
        marginBottom="0.5rem"
      >
        {title}
      </Text>
      <Text
        textStyle="text-sm-mono-regular"
        color="grayscale.100"
      >
        {description}
      </Text>
    </ContentBox>
  );
}
