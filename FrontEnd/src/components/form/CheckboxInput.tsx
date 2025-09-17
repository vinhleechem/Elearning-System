import { Checkbox, FormControlLabel } from "@mui/material";
import type { CheckboxInputProps } from "../../types/checkboxInput";

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  name,
  label,
  checked,
  onChange,
  ...props
}) => {
  return (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            name={name}
            checked={checked}
            onChange={onChange}
            {...props}
          />
        }
        label={label || ""}
      />
    </div>
  );
};

export default CheckboxInput;
