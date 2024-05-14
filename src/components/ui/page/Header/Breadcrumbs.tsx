import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
export type Crumb = {
  terminus: string;
  path: string;
};
interface BreadcrumbsProps {
  links: Crumb[];
}

export default function Breadcrumbs({ links }: BreadcrumbsProps) {
  return (
    <Breadcrumb
      display="flex"
      alignItems="center"
      color="neutral-7"
      w={{ base: 'min-content', sm: 'initial' }}
      listProps={{ flexWrap: 'wrap' }}
    >
      {links.map(({ terminus: title, path }, i) => {
        const isCurrentPage = i === links.length - 1;
        const crumbText = (
          <Text
            maxWidth="250px"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            textStyle="helper-text-base"
            color={isCurrentPage ? 'neutral-7' : 'neutral-6'}
          >
            {title}
          </Text>
        );

        return (
          <BreadcrumbItem
            key={path}
            isCurrentPage={isCurrentPage}
            color="neutral-7"
            textStyle="helper-text-base"
          >
            {isCurrentPage ? (
              crumbText
            ) : (
              <BreadcrumbLink
                as={Link}
                to={path}
                display="flex"
                alignItems="center"
                _hover={{ textDecoration: 'none', color: 'neutral-7' }} // Guessed. Probaby incorrect, couldn't find on figma
              >
                {crumbText}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
}
