export type UserLoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type UserResponse = {
  userId: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  providerId?: string;
  provider?: string;
  roles?: string[];
  status?: "ACTIVE" | "LOCKED"; // User status from backend

  // Thông tin cơ bản của User
  phone?: string;
  address?: string;
  dateOfBirth?: string; // ISO date string
  bio?: string;

  // Thông tin giảng viên (chỉ set khi user là INSTRUCTOR)
  instructorId?: number;
  instructorHeadline?: string;
  instructorBiography?: string;
  instructorWebsite?: string;
  instructorLinkedin?: string;
  instructorTwitter?: string;
  instructorYoutube?: string;
  instructorTotalStudents?: number;
  instructorTotalCourses?: number;
};

export type UserLoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

