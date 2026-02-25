import axios from 'axios';

import { env } from '@/config';
import { LOG_LEVELS } from '@/constants';
import logger from '@/lib/logger';

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    logger.group(
      `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      LOG_LEVELS.ERROR,
      () => {
        logger.debug('Base URL:', config.baseURL);
        logger.debug('Headers:', config.headers);
        if (config.data) logger.debug('Body:', config.data);
        if (config.params) logger.debug('Params:', config.params);
      },
    );
    return config;
  },
  (error) => {
    logger.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    logger.group(
      `[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
      LOG_LEVELS.DEBUG,
      () => {
        logger.debug('Headers:', response.headers);
        logger.debug('Data:', response.data);
      },
    );
    return response;
  },
  (error) => {
    if (error.response) {
      logger.group(
        `[API Response Error] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        LOG_LEVELS.ERROR,
        () => {
          logger.error('Headers:', error.response.headers);
          logger.error('Data:', error.response.data);
        },
      );
    } else {
      logger.error('[API Response Error]', error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
