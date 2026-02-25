import type { LOG_LEVELS } from '@/constants';

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
