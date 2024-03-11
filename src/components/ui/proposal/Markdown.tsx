import { Text, Button } from '@chakra-ui/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import removeMd from 'remove-markdown';
import '../../../assets/css/Markdown.css';

function CustomMarkdownImage({ src, alt }: { src?: string; alt?: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt || ''}
      onError={() => setError(true)}
    />
  );
}

const MarkdownComponents: Components = {
  img: image => {
    return (
      <CustomMarkdownImage
        src={image.src}
        alt={image.alt || ''}
      />
    );
  },
};

interface IMarkdown {
  truncate?: boolean;
  collapsedLines?: number;
  content: string;
}

export default function Markdown({ truncate, content, collapsedLines = 6 }: IMarkdown) {
  const { t } = useTranslation('common');
  const [collapsed, setCollapsed] = useState(true);
  const [totalLines, setTotalLines] = useState(0);
  const [totalLinesError, setTotalLinesError] = useState(false);
  const markdownTextContainerRef = useRef<HTMLParagraphElement>(null);
  const plainText = removeMd(content);

  useEffect(() => {
    if (
      markdownTextContainerRef &&
      markdownTextContainerRef.current &&
      document &&
      document.defaultView
    ) {
      const divHeight = markdownTextContainerRef.current.scrollHeight;
      const lineHeight = parseInt(
        document.defaultView.getComputedStyle(markdownTextContainerRef.current, null).lineHeight,
      );
      console.log(lineHeight);
      if (isNaN(lineHeight)) {
        setCollapsed(false);
        setTotalLinesError(true);
      } else {
        const lines = divHeight / lineHeight;
        setTotalLines(lines);
        setTotalLinesError(false);
      }
    }
  }, [content]);

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
        {plainText}
      </Text>
    );
  }

  return (
    <>
      <Text
        noOfLines={collapsed ? collapsedLines : undefined}
        ref={markdownTextContainerRef}
        maxWidth="100%"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          urlTransform={handleTransformURI}
          components={MarkdownComponents}
          className="markdown-body"
        >
          {content}
        </ReactMarkdown>
      </Text>

      {totalLines > collapsedLines && !totalLinesError && (
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
