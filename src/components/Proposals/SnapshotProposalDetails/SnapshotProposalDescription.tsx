import { Text, Button } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SnapshotProposal } from '../../../types';
import '../../../assets/css/SnapshotProposalMarkdown.css';

interface ISnapshotProposalDescription {
  truncate?: boolean;
  proposal: SnapshotProposal;
}

export default function SnapshotProposalDescription({
  truncate,
  proposal,
}: ISnapshotProposalDescription) {
  const { t } = useTranslation('common');
  const [collapsed, setCollapsed] = useState(true);

  const handleToggleCollapse = () => {
    setCollapsed(prevState => !prevState);
  };

  if (truncate) {
    return (
      <Text
        noOfLines={2}
        fontWeight={400}
      >
        {proposal.description}
      </Text>
    );
  }

  return (
    <>
      <Text
        noOfLines={collapsed ? 6 : undefined}
        maxWidth="100%"
      >
        <Markdown
          remarkPlugins={[remarkGfm]}
          className="markdown-body"
        >
          {proposal.description}
        </Markdown>
      </Text>
      <Button
        marginTop={4}
        paddingLeft={0}
        variant="text"
        onClick={handleToggleCollapse}
      >
        {t(collapsed ? 'showMore' : 'showLess')}
      </Button>
    </>
  );
}
