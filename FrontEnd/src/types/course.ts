export interface CourseProps {
  title: string;
  teacher: string;
  reviews: number;
  rating: number;
  price: number;
  oldPrice?: number | null;
  image?: string;
  tag?: string;
  slug?: string;
  description?: string;
  totalHours?: number | string;
  level?: string;
  updatedAt?: string;
  learningPoints?: string[];
}

export interface CourseDetailProps {
  title: string;
  tag?: string;
  description?: string;
  totalHours?: number | string;
  level?: string;
  updatedAt?: string;
  learningPoints?: string[];
  position: { x: number; y: number };
  side?: "left" | "right";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}
