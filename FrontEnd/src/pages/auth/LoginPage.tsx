import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import TextInput from "../../components/form/TextInput";
import { Alert, Box, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { QrCode2Outlined } from "@mui/icons-material";
import SocialAuth from "../../components/SocialAuth";
import FormField from "../../components/form/FormField";
import { useAuthStore } from "../../store/authStore";

type LoginFormValues = {
  email: string;
  password: string;
};

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
  } = useForm<LoginFormValues>({ resolver: yupResolver(formSchema) });

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      const isAdmin = useAuthStore.getState().hasRole("ADMIN");
      navigate(isAdmin ? "/admin/dashboard" : "/");
    } catch {
      // lỗi đã được set trong store
    }
  };
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
            borderColor: "#3b82f6",
            color: "#3b82f6",
            bgcolor: "#eff6ff",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#dbeafe",
              borderColor: "#3b82f6",
            },
          }}
          onClick={() => {
            navigate("/login-qr");
          }}
        >
          Đăng nhập với mã QR
        </Button>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
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

        <Button
          fullWidth
          variant="contained"
          type="submit"
          className="!mt-5"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
      {error && (
        <Alert severity="error" className="mt-4">
          {error}
        </Alert>
      )}
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
