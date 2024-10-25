import {
  GenericFieldHTMLAttributes,
  Formik,
  FormikConfig,
  FormikProps,
  FormikValues,
  Field,
  FieldConfig,
  FieldProps,
  FieldArray,
  FieldArrayConfig,
  FieldArrayRenderProps,
} from 'formik';
import { createContext, useContext, ReactNode } from 'react';

// -------------------- OVERRIDDEN SETTERS ------------------------------------

type FormikSetters = 'setFieldValue' | 'setFieldTouched' | 'setFieldError' | 'setStatus';
type OverriddenFormikSetters<T> = {
  setFieldValue: <Key extends RecursiveKeyOf<T>>(
    field: Key,
    value: DeepPropertyType<T, Key>,
    shouldValidate?: boolean,
  ) => void;
  setFieldTouched: <Key extends RecursiveKeyOf<T>>(field: Key, touched: boolean) => void;
  setFieldError: <Key extends RecursiveKeyOf<T>>(field: Key, error: string) => void;
  setStatus: <Key extends RecursiveKeyOf<T>>(field: Key) => void;
};

// -------------------- GENERICS ---------------------------------------------

type TerminalType = string | number | bigint | boolean | null | undefined | Set<any> | Date;

type IsAny<T> = unknown extends T ? ([keyof T] extends [never] ? false : true) : false;

type RecursiveKeyOf<T, Prefix extends string = never> = T extends TerminalType
  ? never
  : IsAny<T> extends true
    ? never
    : T extends any[]
      ? `${Prefix}.${number}` | RecursiveKeyOf<T[number], `${Prefix}.${number}`>
      : {
          [K in keyof T & string]: [Prefix] extends [never]
            ? K | RecursiveKeyOf<T[K], K>
            : `${Prefix}.${K}` | RecursiveKeyOf<T[K], `${Prefix}.${K}`>;
        }[keyof T & string];

type ParseInt<T extends string> = T extends `${infer Int extends number}` ? Int : never;

type DeepPropertyType<
  T,
  P extends RecursiveKeyOf<T>,
  TT = Exclude<T, undefined>,
> = P extends `${infer Prefix}.${infer Rest}`
  ? Prefix extends keyof TT
    ? Rest extends RecursiveKeyOf<TT[Prefix]>
      ? DeepPropertyType<TT[Prefix], Rest>
      : ParseInt<Rest> extends number
        ? TT[Prefix] extends (infer ArrayType)[]
          ? Rest extends `${number}.${infer DeepRest extends RecursiveKeyOf<ArrayType>}`
            ? DeepPropertyType<ArrayType, DeepRest>
            : ArrayType
          : never
        : never
    : never
  : P extends keyof TT
    ? TT[P]
    : never;

type ObjectKeys<T> = {
  [K in keyof T]: T[K] extends object ? K : never;
}[keyof T];

type DeepKeysPrefix<T, TPrefix> = TPrefix extends keyof T & (number | string)
  ? `${TPrefix}.${DeepKeys<T[TPrefix]> & string}`
  : never;

type DeepKeys<T> = unknown extends T
  ? string
  : T extends readonly any[]
    ? DeepKeysPrefix<T, keyof T>
    : T extends object
      ? Exclude<keyof T, ObjectKeys<T>> | DeepKeysPrefix<T, keyof T>
      : never;

type DeepValue<T, TProp> =
  T extends Record<string | number, any>
    ? TProp extends `${infer TBranch}.${infer TDeepProp}`
      ? DeepValue<T[TBranch], TDeepProp>
      : T[TProp & string]
    : never;

// -------------------- FORMIK ---------------------------------------------

type ValidationFunction<Values> = (
  values: Values,
) => Promise<Record<string, any>> | Record<string, any>;

type TypesafeFormikProps<Values> = Omit<FormikProps<Values>, FormikSetters> &
  OverriddenFormikSetters<Values>;

type TypesafeFormikConfig<Values> = Omit<FormikConfig<Values>, 'children'> & {
  children?: ((props: TypesafeFormikProps<Values>) => React.ReactNode) | React.ReactNode;
};

type TypesafeFormikFormComponent<FormValues extends Record<string, unknown>> = React.FC<
  TypesafeFormikConfig<FormValues> & {
    initialValues?: FormValues;
  }
>;

function typesafeFormikFactory<Values extends Record<string, unknown>>(
  validate: ValidationFunction<Values>,
): TypesafeFormikFormComponent<Values> {
  return function CustomFormik({
    children,
    ...props
  }: TypesafeFormikConfig<Values> & { initialValues?: Values }) {
    return (
      <Formik<Values>
        validate={validate}
        {...props}
      >
        {form => children && typeof children === 'function' && children(form)}
      </Formik>
    );
  };
}

// -------------------- FIELD ---------------------------------------------

type TypesafeFieldProps<Value, FormValues extends FormikValues> = Omit<
  FieldProps<Value, FormValues>,
  'form'
> & {
  form: Omit<FieldProps<Value, FormValues>['form'], FormikSetters> &
    OverriddenFormikSetters<FormValues>;
};

type TypesafeFieldAttributes<
  FormValues extends FormikValues,
  Name extends DeepKeys<FormValues> = DeepKeys<FormValues>,
> = Omit<GenericFieldHTMLAttributes, 'children'> &
  Omit<FieldConfig, 'name' | 'component' | 'as' | 'render' | 'children'> & {
    children: (
      props: TypesafeFieldProps<DeepValue<FormValues, Name>, FormValues>,
    ) => React.ReactElement;
    name: Name;
  };

type TypesafeFieldComponent<FormValues extends Record<string, unknown>> = <
  N extends DeepKeys<FormValues>,
>(
  props: TypesafeFieldAttributes<FormValues, N>,
) => JSX.Element;

function typesafeFieldFactory<
  FormValues extends FormikValues,
  Name extends DeepKeys<FormValues> = DeepKeys<FormValues>,
>() {
  return function CustomField<N extends Name>(props: TypesafeFieldAttributes<FormValues, N>) {
    return <Field {...props} />;
  };
}

// -------------------- FIELD ARRAY ---------------------------------------------

type TypesafeFieldArrayProps<Value, FormValues extends FormikValues> = Omit<
  FieldArrayRenderProps,
  'form'
> & {
  form: Omit<FieldProps<Value, FormValues>['form'], FormikSetters> &
    OverriddenFormikSetters<FormValues>;
};

type TypesafeFieldArrayAttributes<
  FormValues extends FormikValues,
  Name extends DeepKeys<FormValues> = DeepKeys<FormValues>,
> = Omit<GenericFieldHTMLAttributes, 'children'> &
  Omit<FieldArrayConfig, 'name' | 'component' | 'as' | 'render' | 'children'> & {
    children: (
      props: TypesafeFieldArrayProps<DeepValue<FormValues, Name>, FormValues>,
    ) => React.ReactElement;
    name: Name;
  };

type TypesafeFieldArrayComponent<FormValues extends Record<string, unknown>> = <
  N extends DeepKeys<FormValues>,
>(
  props: TypesafeFieldArrayAttributes<FormValues, N>,
) => JSX.Element;

function typesafeFieldArrayFactory<
  FormValues extends FormikValues,
  Name extends DeepKeys<FormValues> = DeepKeys<FormValues>,
>() {
  return function CustomFieldArray<N extends Name>(
    props: TypesafeFieldArrayAttributes<FormValues, N>,
  ) {
    return <FieldArray {...props} />;
  };
}

// -------------------- CONTEXT ---------------------------------------------

interface TypesafeFormikContextInputType<T extends Record<string, unknown>> {
  formik: TypesafeFormikProps<T>;
}

interface TypesafeFormikContextReturnType<T extends Record<string, unknown>> {
  formik: TypesafeFormikProps<T>;
  Field: TypesafeFieldComponent<T>;
  FieldArray: TypesafeFieldArrayComponent<T>;
}

function createTypesafeFormikContext<T extends Record<string, unknown>>() {
  return createContext<TypesafeFormikContextInputType<T> | undefined>(undefined);
}

const TypesafeFormikContext = createTypesafeFormikContext<Record<string, unknown>>();

function TypesafeFormikProvider<T extends Record<string, unknown>>({
  children,
  formik,
}: {
  children: ReactNode;
  formik: TypesafeFormikProps<T>;
}) {
  return (
    <TypesafeFormikContext.Provider
      value={{ formik } as TypesafeFormikContextInputType<Record<string, unknown>>}
    >
      {children}
    </TypesafeFormikContext.Provider>
  );
}

// -------------------- ENTRY POINT ---------------------------------------------

export function useTypesafeFormikContext<
  T extends Record<string, unknown>,
>(): TypesafeFormikContextReturnType<T> {
  const context = useContext(TypesafeFormikContext);
  if (context === undefined) {
    throw new Error('useTypesafeFormikContext must be used within a TypesafeFormikProvider');
  }
  return context as TypesafeFormikContextReturnType<T>;
}

export function makeForm<Values extends Record<string, unknown>>({
  validate,
}: {
  validate: ValidationFunction<Values>;
}): {
  Formik: TypesafeFormikFormComponent<Values>;
  Field: TypesafeFieldComponent<Values>;
  FieldArray: TypesafeFieldArrayComponent<Values>;
} {
  const FormikComponent = typesafeFormikFactory(validate);

  function WrappedFormik({
    children,
    ...props
  }: TypesafeFormikConfig<Values> & { initialValues?: Values }) {
    return (
      <FormikComponent {...props}>
        {formikProps => (
          <TypesafeFormikProvider formik={formikProps}>
            {typeof children === 'function' ? children(formikProps) : children}
          </TypesafeFormikProvider>
        )}
      </FormikComponent>
    );
  }

  return {
    Formik: WrappedFormik,
    Field: typesafeFieldFactory<Values>(),
    FieldArray: typesafeFieldArrayFactory<Values>(),
  };
}
