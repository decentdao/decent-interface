/**
 * Inspiration taken from:
 * - https://www.flightcontrol.dev/blog/add-type-safety-to-formiks-field-component
 * - https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgVwM4FMBi0TANYDCEAdjOgB7wC+cAZlBCHAES077MDcAUNwPR84AWhGix48XAAqATQAKAUTgARBZgCSAOXVT1AeU0BlYRNNnzFsbxgBPMOmnoouYgEMANlLsOAvNzgBcAA+cKgwUMDEAOb+gSHEyCAARk6xASFJwFGRMGnBcEkQEO7orsR58cju7hUoxAAm6LSR6PW1hugwADxlNgB8tcquZNbecOqoAILENl1SfXA+dXjEEADuxHAUZA2o0nkA-HAA2njoNhC00gC6W5TouyfE6ABuTtd5gXBHtB4Yn4EAFxwcLIdB5YG-dwYHj8ABUcP8cJU6HQYDgzzCrTgZxse0ucDKcByTl+AGMHGtgDAABZweoQeCoGykVzkJFIuAAAQornAJU5tnsIMWcAASugycgoKhgG8ANLnPS0LoIVzAhBJDVk4FhCLRKhUBYCRYLADkrjN+QtADoklaQrakjayWakXxuBRILAQWMJVKZXL0IqbMqunkpAAaPJyKBNYDkO47ep7PWRKKi55vKDRhZLKRJh4pxzOSIeLz2Q4Y16pL7AibTWbzQuPUHgr5HLO1oFwCMt4u9Y4fDtwAAGABIELH4+QqDbJwlkk4qKP8v7pbKFUqVVJjouUlBrpGx5Pp81Z-OEPvl6OBnXEACvsd5cTNriCQWAGShcLp67A44zwTW5tiLPY9xrQ9Hy+QIjhfEJ10DLdQx3Z8jzgeU7xg7CAmBCcpzjc850neUVzXSUNyDEMw13eV0PwoCLxIlc+h4bCqFOc4Pzgb802ia5YW4IUHDkVwZXQdRSDmftU1-aI82kGSTwQSJaCccZSCU68oDIo5JPgYEuygXg+ARTkAHFOhBGkHGEuACVcassXqOAwAYexYBsOAqVpelGVCFkYDZDk4GRAAhVxZTJDx3C82kHEibMMHsq5R0Qzdg23UcQuRHlyD5MABVC31hXgJZlFRMBYwgDzbArdBVXVRAtUQHUf31KJDSoY8nRdM1jUEHwFj4mJQo9L1oHgOyKrRarapserwwCKNYjkJT0qo7c5j6aNloLJYFHIMl3GQRo5mPZAGnjZ56h27gFLW0DHnw1T1MY4iVOINSoHFdAwhXWIjkYpT3yuKQpCrCUwnWiikMylCuk0EhNCqdxXCSEo5l3Rjrj6LCRxmqr3KcOrvER5HUfRzHwcAwjgJ236wnxntRPE-SuihmAFie4ttOgo4keIFHqiphqaZx7n7keAAKV6fsmKAoFcBbvAASiHaCAiOTmlPw7SPrllE0R1nm9g25CwwVpWVfsPoAZwmCjkJuaSZthqreV+rj0JznmYd4EPbdzW4EMyDoND7MIWrSPcLgR6peLUHpAhkdxeHHsjMEk1LHMOAAFVUFcKIHEAPg3AEXdwBYAkAXg3AG6dkwc4bxvRFGYVDAKkpsFLPBDDJGyQEcpYEFiIv0F1OSojYwl6nqONUFQDU8jJakbDHjrJ4CGkIDQdAUaXKBDMSA916n+pqWAEgPBd2BgD+4F-WgeouhG49tNY2IqEnzekkyW-2vTIdJ7FyulAA4wJmD9xKMwfIrB0AQPQFwWIhc0ZQBXhiQ+6lKjVEnmwCAGoChiVXumOAHEBLDySGSUBiB6RNEIdEY8UQaTAEoUgAAVngdwtCMwkOIZPEAqw8FgAAI77z-tETgP5kDMLgC8NY5BOHEKHDw7gH9eBkhINDJAGAYCYBvu4eoAA1DwYJgTQCyGWdwHRtG6IMUYhwNA-ABG3p3XAhASBkEoF0Nu-IsDsG7r3WBrg+jS1VpPbgajiDQy0To9AejDEnV8HALoIYYYBgytRFUXjCo+K7j3PugSgmxGaDE+owIQy7WkbY4EztiaeUWpkjuvjckBOPCGO6ARUCbyqDY9wwB6jDHQJQwoxRSjlFVqaB8AQ4wwGlJsUx2Q3AWM6NE2JtjpZFL0ceF4tjjwdK3isnpfSyAhOUbCE09TwRROsXEsE0tmCuGnrPVANp7mnxgOfBZV83l-RtKgRgO9EhOGAGSa58DjwAEYABMABmEJcATS9DgEAwFZJ7JJBYZKeAgBQcm4Jc4pILblfx-qgZgx5jjMCiHydMJKWCoG9DAYl1xYXwsVsrOA2LcX7JucwQlN8nkQupcwWlk1iVMsEJERoiZIiEhZV5dlSyrmrO5RAb+vKbT8uPIKulIrxEmnFRQV80rrZspxfKvFiqgGNCgAKuBzBRWiIzJdd5xqOXdK5Rapw1LLqNGaDdO1NU3kX3cK5GpthnWms5egW5SCxI2GpQkaodr41owxg4NyNVXZhqsWa+JtyR4Cqhbak1WaI25oeX9Ylx4kBL1sGAnB1LOkYF3geYEULjwvLPoGz5vK8E4OBAAFmIcQ1WRblmusjawIoNoC2VvwSI5gSRXAAC8oFUGHS6-FdzyE2gYcAG0AAGalrD2G1qKCutd4ax3SzNHwiAPzpn7rNDOmRci4BmhwVaVdsJ12KtWMQQ6wAwjpkmDAX8SRkBkGpZCmFOrBC-ruABt50RCQgYiGBsg1kGBrD2E4BgP1sXcCAA
 */

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
    ? Rest extends RecursiveKeyOf<NonNullable<TT[Prefix]>>
      ? DeepPropertyType<NonNullable<TT[Prefix]>, Rest>
      : ParseInt<Rest> extends number
        ? NonNullable<TT[Prefix]> extends (infer ArrayType)[]
          ? Rest extends `${number}.${infer DeepRest extends RecursiveKeyOf<ArrayType>}`
            ? DeepPropertyType<ArrayType, DeepRest>
            : ArrayType
          : never
        : never
    : never
  : P extends keyof TT
    ? TT[P]
    : never;

type DeepKeysPrefix<T, TPrefix> = TPrefix extends keyof T & (number | string)
  ? `${TPrefix}.${DeepKeys<T[TPrefix]> & string}`
  : never;

type DeepKeys<T> = unknown extends T
  ? string
  : T extends readonly any[]
    ? DeepKeysPrefix<T, keyof T>
    : T extends object
      ? (keyof T & string) | DeepKeysPrefix<T, keyof T & string>
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

function useTypesafeFormikContext<
  T extends Record<string, unknown>,
>(): TypesafeFormikContextReturnType<T> {
  const context = useContext(TypesafeFormikContext);
  if (context === undefined) {
    throw new Error('useTypesafeFormikContext must be used within a TypesafeFormikProvider');
  }

  // @ts-expect-error
  return context as TypesafeFormikContextReturnType<T>;
}

function makeForm<Values extends Record<string, unknown>>({
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

export { makeForm, useTypesafeFormikContext };
