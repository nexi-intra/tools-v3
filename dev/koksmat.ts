// koksmat.ts

import fs from "fs";
import path from "path";

interface KoksmatOptions {
  retentionMinutes: number;
}

interface LogEntry {
  timestamp: string;
  correlationId?: string;
  moduleType: string;
  level: string;
  message: string;
  error?: any;
}

class Koksmat {
  private static instance: Koksmat;
  private retentionMinutes: number;
  private logFilePath: string;

  // Private constructor to prevent direct instantiation
  private constructor(options: KoksmatOptions) {
    this.retentionMinutes = options.retentionMinutes;
    this.logFilePath = path.join(process.cwd(), "koksmat.log");
    this.setupLogRotation();
  }

  // Static method to get the singleton instance
  public static getInstance(options: KoksmatOptions): Koksmat {
    if (!Koksmat.instance) {
      Koksmat.instance = new Koksmat(options);
    }
    return Koksmat.instance;
  }

  private setupLogRotation() {
    // Placeholder for log rotation logic
    // Implement your log rotation mechanism here if needed
  }

  private writeLog(entry: LogEntry) {
    const logMessage = JSON.stringify(entry);
    fs.appendFile(this.logFilePath, logMessage + "\n", (err) => {
      if (err) {
        console.error("Failed to write log entry:", err);
      }
    });
  }

  info(correlationId: string | undefined, moduleType: string, message: string) {
    const entry: LogEntry = {
      moduleType: moduleType.toUpperCase(),
      timestamp: new Date().toISOString(),

      correlationId,
      level: "INFO",
      message,
    };
    this.writeLog(entry);
  }

  error(
    correlationId: string | undefined,
    moduleType: string,
    message: string,
    error: any
  ) {
    const entry: LogEntry = {
      moduleType: moduleType.toUpperCase(),
      timestamp: new Date().toISOString(),
      correlationId,
      level: "ERROR",
      message,
      error: error?.stack || error,
    };
    this.writeLog(entry);
  }

  warning(
    correlationId: string | undefined,
    moduleType: string,
    message: string
  ) {
    const entry: LogEntry = {
      moduleType: moduleType.toUpperCase(),
      timestamp: new Date().toISOString(),
      correlationId,
      level: "WARNING",
      message,
    };
    this.writeLog(entry);
  }

  verbose(
    correlationId: string | undefined,
    moduleType: string,
    message: string
  ) {
    const entry: LogEntry = {
      moduleType: moduleType.toUpperCase(),
      timestamp: new Date().toISOString(),
      correlationId,
      level: "VERBOSE",
      message,
    };
    this.writeLog(entry);
  }

  // Add any other logging methods as needed
}

//export default Koksmat;

export function getKoksmat() {
  return Koksmat.getInstance({ retentionMinutes: 120 });
}
