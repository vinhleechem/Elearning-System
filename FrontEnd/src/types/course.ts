export interface CourseProps {
  title: string;
  teacher: string;
  reviews: number;
  rating: number;
  price: number;
  oldPrice?: number | null;
  image?: string;
  tag?: string;
}
