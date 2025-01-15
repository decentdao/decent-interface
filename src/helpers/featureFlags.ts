export const FEATURE_FLAG_ENVIRONMENT_VARIABLES = {
  devMode: 'VITE_APP_FLAG_DEV',
  demoMode: 'VITE_APP_FLAG_DEMO',
  yellingMode: 'VITE_APP_FLAG_YELLING',
} as const;

export const FEATURE_FLAG_VALUES = {
  ON: 'on',
  OFF: 'off',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAG_ENVIRONMENT_VARIABLES;
type FeatureFlagValuesTypes = typeof FEATURE_FLAG_VALUES;
export type FeatureFlagValue = FeatureFlagValuesTypes[keyof FeatureFlagValuesTypes];

export interface IFeatureFlags {
  set(key: FeatureFlag, value: FeatureFlagValue): void; // set from URL params
  get(key: FeatureFlag): FeatureFlagValue | undefined;
}

export class FeatureFlags {
  static instance?: IFeatureFlags;
}

/*
  Convenience function to check if a feature is enabled when we use the feature flags as a boolean value.
  Although boolean is the most common use case, the feature flags can be used for any value, including number, string, enum or even object.
  In this current implementation, we restrict the feature flags to be used as a string "on" or "off".
  */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FeatureFlags.instance?.get(feature) === FEATURE_FLAG_VALUES.ON;
};
