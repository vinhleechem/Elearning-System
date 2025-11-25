import { Box, Button, Checkbox, FormControlLabel } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SocialAuth from "../../components/SocialAuth";
import { useForm } from "react-hook-form";
import TextInput from "../../components/form/TextInput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormField from "../../components/form/FormField";
const RegisterPage = () => {
  const formSchema = yup.object().shape({
    fullName: yup.string().required(),
    email: yup
      .string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email is not valid",
      )
      .required(),
    password: yup.string().required(),
    confirmPassword: yup.string().required(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(formSchema) });

  const navigate = useNavigate();

  const onSubmit = (values: any) => {
    // TODO: call register API
    console.log('register', values);
    navigate('/');
  };

  return (
    <div>
      <div>
        <h2 className="mb-6 mt-6 text-2xl font-bold text-gray-900">
          Đăng kí với email
        </h2>
        <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
          <FormField
            name="fullName"
            label="Full Name"
            control={control}
            Component={TextInput}
            error={errors["fullName"]}
          />
          <FormField
            name="email"
            label="Email"
            control={control}
            Component={TextInput}
            error={errors["email"]}
          />
          <Box display={"flex"} alignItems={"center"} gap={2}>
            <FormField
              name="password"
              label="Password"
              control={control}
              Component={TextInput}
              type="password"
              error={errors.password}
            />
            <FormField
              name="confirmPassword"
              label="Confirm Password"
              control={control}
              Component={TextInput}
              type="confirmPassword"
              error={errors.confirmPassword}
            />
          </Box>

          <Button fullWidth variant="contained" type="submit" className="!mt-5">
            Đăng ký
          </Button>
        </form>
        <p className="mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-main">
            Sign in instead
          </Link>
        </p>
        <FormControlLabel
          control={<Checkbox name="offers" />}
          label="Gửi cho tôi các ưu đãi đặc biệt, đề xuất cá nhân hóa và bí quyết học tập."
          className="py-5 !text-xs"
          slotProps={{
            typography: { sx: { fontSize: "13px" } }, // chỉnh trực tiếp Typography label
          }}
        />
        <SocialAuth />
      </div>
    </div>
  );
};

export default RegisterPage;
