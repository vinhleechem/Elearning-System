import type { Control, FieldError } from "react-hook-form";

export interface FormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  label: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>;
  type?: string;
  error?: FieldError;
}
