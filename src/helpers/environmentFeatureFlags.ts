import {
  IFeatureFlags,
  FeatureFlagKeys,
  FeatureFlagKey,
  FEATURE_FLAG_VALUES,
  FeatureFlagValue,
} from './featureFlags';

export class EnvironmentFeatureFlags implements IFeatureFlags {
  flags: { [key: string]: FeatureFlagValue | undefined } = {};

  private keyToEnvVar = (key: FeatureFlagKey): string => {
    return `VITE_APP_${key.toUpperCase()}`;
  };

  private keyToQueryParam = (key: FeatureFlagKey): string => {
    return key.toLowerCase();
  };

  constructor(featureFlags: FeatureFlagKeys) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Check all feature flags
    featureFlags.forEach(featureFlag => {
      const envValue = import.meta.env[this.keyToEnvVar(featureFlag)]?.toLowerCase();
      if (envValue === FEATURE_FLAG_VALUES.ON || envValue === FEATURE_FLAG_VALUES.OFF) {
        this.set(featureFlag, envValue);
      }
      const queryParam = urlParams.get(this.keyToQueryParam(featureFlag))?.toLowerCase();
      if (queryParam === FEATURE_FLAG_VALUES.ON || queryParam === FEATURE_FLAG_VALUES.OFF) {
        this.set(featureFlag, queryParam);
      }

      console.log({ featureFlag, envValue, queryParam });
    });
  }

  set(key: FeatureFlagKey, value: FeatureFlagValue): void {
    this.flags[key] = value;
  }

  get(key: FeatureFlagKey) {
    return this.flags[key];
  }
}
