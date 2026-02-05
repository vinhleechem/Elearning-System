export const UserStatus = {
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  PENDING: "PENDING",
} as const;

export type UserStatusType = typeof UserStatus[keyof typeof UserStatus];

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
  status?: "ACTIVE" | "LOCKED";

  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;

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
