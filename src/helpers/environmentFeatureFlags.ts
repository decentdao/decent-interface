import {
  IFeatureFlags,
  FeatureFlagValue,
  FEATURE_FLAG_ENVIRONMENT_VARIABLES,
  FeatureFlag,
  FEATURE_FLAG_VALUES,
} from './featureFlags';

const envVarToQueryParam = (envVar: string): string => {
  return envVar.replace('VITE_APP_', '').toLowerCase();
};

export class EnvironmentFeatureFlags implements IFeatureFlags {
  urlFlags: { [key: string]: FeatureFlagValue } = {};

  constructor() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Check all feature flags
    (Object.entries(FEATURE_FLAG_ENVIRONMENT_VARIABLES) as Array<[FeatureFlag, string]>).forEach(
      ([key, envVar]) => {
        const queryParam = envVarToQueryParam(envVar);
        const rawValue = urlParams.get(queryParam)?.toLowerCase();
        if (rawValue === FEATURE_FLAG_VALUES.ON || rawValue === FEATURE_FLAG_VALUES.OFF) {
          this.set(key, rawValue);
        }
      },
    );
  }

  set(key: FeatureFlag, value: FeatureFlagValue): void {
    this.urlFlags[key] = value;
  }

  get(key: FeatureFlag): FeatureFlagValue | undefined {
    const envValue = import.meta.env[FEATURE_FLAG_ENVIRONMENT_VARIABLES[key]]?.toLowerCase();
    return (
      this.urlFlags[key] ??
      (envValue === FEATURE_FLAG_VALUES.ON || envValue === FEATURE_FLAG_VALUES.OFF
        ? envValue
        : undefined)
    );
  }
}
