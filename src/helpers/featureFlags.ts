export enum FeatureFlag {
  developmentMode = 'VITE_APP_FLAG_DEVELOPMENT_MODE',
  demoMode = 'VITE_APP_FLAG_DEMO_MODE',
  configDemo = 'VITE_APP_FLAG_CONFIG_DEMO',
}

export interface IFeatureFlags {
  set(key: FeatureFlag, value: any): void; // set from URL params
  get(key: FeatureFlag): any;
}

export class FeatureFlags {
  static instance?: IFeatureFlags;
}

/*
  Convenience function to check if a feature is enabled when we use the feature flags as a boolean value.
  Although boolean is the most common use case, the feature flags can be used for any value, including number, string, enum or even object.
  */
export const isFeatureEnabled = (feature: FeatureFlag) => {
  return FeatureFlags.instance?.get(feature) === 'ON';
};
