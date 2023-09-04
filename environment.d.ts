declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      LISTEN_PORT: string;
      MOUNTPOINT_PATH: string;
      LIBRARY_DIR: string;
      LOG_INFO: "true" | "false";
      LOG_DEBUG: "true" | "false";
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }
