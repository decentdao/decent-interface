import { Link } from '@chakra-ui/next-js';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text } from '@chakra-ui/react';

export type Crumb = {
  title: string;
  path: string;
};
interface IBreadcrumbs {
  links: Crumb[];
}

export default function Breadcrumbs({ links }: IBreadcrumbs) {
  return (
    <Breadcrumb
      color="chocolate.200"
      height="36px"
      display="flex"
      alignItems="center"
      w={{ base: 'min-content', sm: 'initial' }}
    >
      {links.map(({ title, path }, i) => {
        const isCurrentPage = i === links.length - 1;
        const crumbText = (
          <Text
            maxWidth="250px"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            textStyle="text-base-mono-regular"
            color={isCurrentPage ? 'chocolate.200' : 'gold.500'}
          >
            {title}
          </Text>
        );
        return (
          <BreadcrumbItem
            key={path}
            isCurrentPage={isCurrentPage}
          >
            {isCurrentPage ? (
              crumbText
            ) : (
              <BreadcrumbLink
                as={Link}
                href={path}
                display="flex"
                alignItems="center"
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
