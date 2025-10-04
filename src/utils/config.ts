import Constants from 'expo-constants';

interface Config {
  apiUrl: string;
  apiKey: string;
  nodeEnv: string;
}

const getConfig = (): Config => {
  const extra = Constants.expoConfig?.extra || {};

  return {
    apiUrl: extra.apiUrl || 'https://api.example.com',
    apiKey: extra.apiKey || '',
    nodeEnv: extra.nodeEnv || 'development',
  };
};

export const config = getConfig();
