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
  const [totalLines, setTotalLines] = useState(0);
  const markdownTextContainerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (
      markdownTextContainerRef &&
      markdownTextContainerRef.current &&
      document &&
      document.defaultView
    ) {
      const divHeight = markdownTextContainerRef.current.scrollHeight;
      const lineHeight = parseInt(
        document.defaultView.getComputedStyle(markdownTextContainerRef.current, null).lineHeight
      );
      const lines = divHeight / lineHeight;
      setTotalLines(lines);
    }
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed(prevState => !prevState);
  };

  const handleTransformURI = (uri: string) => {
    if (uri.startsWith('ipfs://')) {
      const hash = uri.split('://')[1];
      const SNAPSHOT_IPFS_BASE_URL = 'https://snapshot.4everland.link/ipfs';
      return `${SNAPSHOT_IPFS_BASE_URL}/${hash}`;
    }

    return uri;
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
          urlTransform={handleTransformURI}
          className="markdown-body"
        >
          {proposal.description}
        </Markdown>
      </Text>
      {totalLines > 6 && (
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
