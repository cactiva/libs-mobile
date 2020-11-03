type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

type Validation =
  | "required"
  | [operator: "required", errorMessage: string]
  | [operator: "=" | "!=", value: any, errorMessage?: string]
  | ((value: any) => [isValid: boolean, errorMessage: string]);

export function Validator<T>(
  model: T,
  opt: PartialRecord<keyof T, Validation | Validation[]>
) {}
