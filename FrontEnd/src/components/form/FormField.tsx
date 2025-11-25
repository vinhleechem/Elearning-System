import React from "react";
import type { FormFieldProps } from "../../types/formField";
import { Controller } from "react-hook-form";
import { FormHelperText } from "@mui/material";

const FormField: React.FC<FormFieldProps> = ({
  control,
  label,
  name,
  Component,
  type,
  error,
}) => {
  return (
    <div>
      <p className="mb-1 text-sm font-bold text-dark-100">{label}</p>{" "}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, name } }) => {
          return (
            <Component
              onChange={onChange}
              value={value}
              name={name}
              type={type}
              control={control}
              error={error?.message}
              checked={value}
            />
          );
        }}
      />
      {error?.message && (
        <FormHelperText error={true}>{error.message}</FormHelperText>
      )}
    </div>
  );
};

export default FormField;
