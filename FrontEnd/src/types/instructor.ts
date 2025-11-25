export interface Instructor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  experience: string;
  totalStudents: number;
  totalReviews: number;
  rating: number;
  specialization: string[];
  courses: Course[];
  socialLinks?: {
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  students: number;
  rating: number;
  price: number;
  originalPrice?: number;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  bestseller?: boolean;
  new?: boolean;
}

export interface InstructorStats {
  totalStudents: number;
  totalCourses: number;
  totalReviews: number;
  averageRating: number;
}
