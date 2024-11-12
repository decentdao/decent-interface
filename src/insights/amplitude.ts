import * as amplitude from '@amplitude/analytics-browser';

export const initAmplitude = () => {
  const amplitudeApiKey = import.meta.env.VITE_APP_AMPLITUDE_API_KEY;

  if (amplitudeApiKey === '') {
    return;
  }

  amplitude.init(amplitudeApiKey, {
    defaultTracking: true,
  });
};
