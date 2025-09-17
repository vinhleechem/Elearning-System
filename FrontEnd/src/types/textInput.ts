import type { TextFieldProps } from "@mui/material";
import type React from "react";

export interface TextInputProps
  extends Omit<
    TextFieldProps,
    "onChange" | "value" | "name" | "type" | "error"
  > {
  //nhận event của loại React.ChangeEven<HTMLInutElement>
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  name: string;
  type?: "text" | "password" | "email" | "number";
  error?: boolean;
}
