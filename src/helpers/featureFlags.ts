export const FEATURE_FLAGS = ['flag_demo', 'flag_dev', 'flag_yelling'] as const;

export const FEATURE_FLAG_VALUES = {
  ON: 'on',
  OFF: 'off',
} as const;

export type FeatureFlagKeys = typeof FEATURE_FLAGS;
export type FeatureFlagKey = (typeof FEATURE_FLAGS)[number];
type FeatureFlagValuesTypes = typeof FEATURE_FLAG_VALUES;
export type FeatureFlagValue = FeatureFlagValuesTypes[keyof FeatureFlagValuesTypes];

export interface IFeatureFlags {
  set(key: FeatureFlagKey, value: FeatureFlagValue): void;
  get(key: FeatureFlagKey): FeatureFlagValue | undefined;
}

export class FeatureFlags {
  static instance?: IFeatureFlags;
}

/*
  Convenience function to check if a feature is enabled when we use the feature flags as a boolean value.
  Although boolean is the most common use case, the feature flags can be used for any value, including number, string, enum or even object.
  In this current implementation, we restrict the feature flags to be used as a string "on" or "off".
  */
export const isFeatureEnabled = (feature: FeatureFlagKey): boolean => {
  return FeatureFlags.instance?.get(feature) === FEATURE_FLAG_VALUES.ON;
};
