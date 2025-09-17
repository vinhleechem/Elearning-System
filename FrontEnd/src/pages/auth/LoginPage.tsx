import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import TextInput from "../../components/form/TextInput";
import { Box, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { QrCode2Outlined } from "@mui/icons-material";
import SocialAuth from "../../components/SocialAuth";
import FormField from "../../components/form/FormField";

const LoginPage = () => {
  const navigate = useNavigate();
  const formSchema = yup.object().shape({
    email: yup
      .string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email is not valid",
      )
      .required(),
    password: yup.string().required(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({ resolver: yupResolver(formSchema) });
  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        className="mb-6 pt-7"
      >
        <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>

        <Button
          variant="outlined"
          color="warning"
          startIcon={<QrCode2Outlined />}
          sx={{
            textTransform: "none",
            borderColor: "#A435F0",
            color: "#A435F0",
            bgcolor: "#F3E8FF",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#E9D5FF",
              borderColor: "#A435F0",
            },
          }}
          onClick={() => {
            navigate("/login/qr");
          }}
        >
          Đăng nhập với mã QR
        </Button>
      </Box>
      <form>
        <FormField
          name="email"
          label="Email"
          control={control}
          Component={TextInput}
          error={errors["email"]}
        />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
          mt={2}
        >
          <p className="text-sm font-bold text-dark-100">Password</p>
          <Link
            to="/forgot-password"
            className="text-sm text-primary-main hover:underline"
          >
            Forgot Password?
          </Link>
        </Box>
        <FormField
          name="password"
          label=""
          control={control}
          Component={TextInput}
          type="password"
          error={errors.password}
        />

        <Button fullWidth variant="contained" type="submit" className="!mt-5">
          Sign up
        </Button>
      </form>
      <p className="mt-4">
        New on our platform?{" "}
        <Link to="/register" className="text-primary-main">
          Create an account
        </Link>{" "}
      </p>
      <SocialAuth />
    </div>
  );
};

export default LoginPage;
