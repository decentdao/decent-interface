import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type Crumb = {
  title: string;
  path: string;
  icon?: ReactNode;
};
interface IBreadcrumbs {
  links: Crumb[];
}

export default function Breadcrumbs({ links }: IBreadcrumbs) {
  return (
    <Breadcrumb
      display="flex"
      alignItems="center"
      color="chocolate.200"
    >
      {links.map(({ title, path, icon }, i) => {
        const isCurrentPage = i === links.length - 1;
        return (
          <BreadcrumbItem
            key={path}
            isCurrentPage={isCurrentPage}
          >
            <BreadcrumbLink
              as={Link}
              to={path}
              display="flex"
              alignItems="center"
              cursor={isCurrentPage ? 'not-allowed' : 'pointer'}
              pointerEvents={isCurrentPage ? 'unset' : 'auto'}
            >
              {icon}
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
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
}
