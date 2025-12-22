export interface CourseProps {
  id: number;
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
  isPurchased?: boolean;
}

export interface CourseDetailProps {
  id: number;
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
  isPurchased?: boolean;
}
