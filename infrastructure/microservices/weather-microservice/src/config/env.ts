import dotenv from "dotenv";

dotenv.config();

const normalize = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

export const getOptionalEnv = (key: string): string | undefined => {
  return normalize(process.env[key]);
};

export const requireEnv = (key: string): string => {
  const value = getOptionalEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const requireIntEnv = (key: string): number => {
  const raw = requireEnv(key);
  const value = Number.parseInt(raw, 10);

  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable ${key} must be an integer (got: ${raw})`);
  }

  return value;
};
