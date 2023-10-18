import { Text, Button } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
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
  const [shownLines, setShownLines] = useState(0);
  const markdownTextContainerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (markdownTextContainerRef && markdownTextContainerRef.current) {
      const divHeight = markdownTextContainerRef.current.offsetHeight;
      const lineHeight = parseInt(markdownTextContainerRef.current.style.lineHeight);
      const lines = divHeight / lineHeight;

      setShownLines(lines);
    }
  }, []);

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
        minWidth="100%"
        ref={markdownTextContainerRef}
      >
        <Markdown
          remarkPlugins={[remarkGfm]}
          className="markdown-body"
        >
          {proposal.description}
        </Markdown>
      </Text>
      {shownLines > 7 && (
        <Button
          marginTop={4}
          paddingLeft={0}
          variant="text"
          onClick={handleToggleCollapse}
        >
          {t(collapsed ? 'showMore' : 'showLess')}
        </Button>
      )}
    </>
  );
}
