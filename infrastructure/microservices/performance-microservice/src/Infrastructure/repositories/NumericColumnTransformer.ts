import { ValueTransformer } from "typeorm";

export const numericColumnTransformer: ValueTransformer = {
  to: (value: number): number => value,
  from: (value: string | number): number => {
    if (typeof value === "number") {
      return value;
    }

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  },
};
