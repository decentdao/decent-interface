import camelCase from 'lodash.camelcase';

export const camelCaseKeys = <T extends {}>(obj: T): T =>
  Object.keys(obj).reduce(
    (ccObj, field) => ({
      ...ccObj,
      [camelCase(field)]: obj[field as keyof typeof obj],
    }),
    {} as T,
  );
