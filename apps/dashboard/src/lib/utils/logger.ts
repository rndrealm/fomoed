export const logger = {
  // Logs informational messages
  info: (message: string, ...optionalParams: unknown[]) => {
    console.log(`[INFO]: ${message}`, ...optionalParams);
  },
  // Logs warning messages
  warn: (message: string, ...optionalParams: unknown[]) => {
    console.warn(`[WARN]: ${message}`, ...optionalParams);
  },
  // Logs error messages
  error: (message: string, ...optionalParams: unknown[]) => {
    console.error(`[ERROR]: ${message}`, ...optionalParams);
  },
  serialize: (obj: any) => {
    return JSON.stringify(obj, null, 2);
  },
};
