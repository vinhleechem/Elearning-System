import React from "react";
import type { TextInputProps } from "../../types/textInput";
import { TextField } from "@mui/material";

const TextInput: React.FC<TextInputProps> = ({
  onChange,
  name,
  value = "",
  type = "text",
  error,
  ...props //spread operator de lay tat ca cac props con lai
}) => {
  return (
    <div>
      <TextField
        variant="outlined"
        fullWidth
        slotProps={{
          input: { className: "h-10 px-3" },
          htmlInput: { className: "!p-0" },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: 45, // tăng chiều cao tổng thể
          },
        }}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        error={error}
        {...props}
      />
    </div>
  );
};

export default TextInput;
