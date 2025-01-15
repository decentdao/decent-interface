import { IFeatureFlags, FeatureFlagKeys, FeatureFlagKey } from './featureFlags';

export class EnvironmentFeatureFlags implements IFeatureFlags {
  urlParams: { [key: string]: any } = {};
  envVars: { [key: string]: any } = {};

  private keyToEnvVar = (key: FeatureFlagKey): string => {
    return `VITE_APP_${key.toUpperCase()}`;
  };

  private keyToQueryParam = (key: FeatureFlagKey): string => {
    return key.toLowerCase();
  };

  constructor(featureFlags: FeatureFlagKeys) {
    const urlParams = new URLSearchParams(window.location.search);
    const envVars = import.meta.env;

    // Check all feature flags
    featureFlags.forEach(featureFlag => {
      const envValue = envVars[this.keyToEnvVar(featureFlag)];
      this.setEnvVar(featureFlag, envValue);

      const queryParam = urlParams.get(this.keyToQueryParam(featureFlag));
      this.setUrlParam(featureFlag, queryParam);

      console.log({ featureFlag, envValue, queryParam });
    });
  }

  setEnvVar(key: FeatureFlagKey, value: any): void {
    this.envVars[key] = value?.toLowerCase();
  }

  getEnvVar(key: FeatureFlagKey) {
    return this.envVars[key];
  }

  setUrlParam(key: FeatureFlagKey, value: any): void {
    this.urlParams[key] = value?.toLowerCase();
  }

  getUrlParam(key: FeatureFlagKey) {
    return this.urlParams[key];
  }

  isFeatureEnabled(key: FeatureFlagKey) {
    const envVar = this.getEnvVar(key);
    const urlParam = this.getUrlParam(key);

    if (urlParam === 'on') return true;
    if (envVar === 'on' && urlParam !== 'off') return true;
    return false;
  }
}
