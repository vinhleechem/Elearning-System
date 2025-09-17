import type { CartItemProps } from "./cartItem";

export type CheckoutItemProps = Pick<
  CartItemProps,
  "id" | "title" | "image" | "price" | "oldPrice"
>;
