export interface CartItemProps {
  id: number;
  title: string;
  author: string;
  reviews: number;
  rating: number;
  price: number;
  oldPrice?: number | null;
  image?: string;
  tag?: string;
  duration: number;
  lesson: number;
}
