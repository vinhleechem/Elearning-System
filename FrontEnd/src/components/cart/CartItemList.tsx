import CartItem from "./CartItem";
import type { CartItemProps } from "../../types/cartItem";

interface CartItemListProps {
  items: CartItemProps[];
  onRemove: (id: number) => void;
}

const CartItemList: React.FC<CartItemListProps> = ({ items, onRemove }) => {
  return (
    <div className="mr-5 flex-[2]">
      <p className="mb-2 font-semibold">{items.length} khóa học trong giỏ hàng</p>
      {items.map((cartItem) => (
        <CartItem
          id={cartItem.id}
          key={cartItem.id}
          title={cartItem.title}
          author={cartItem.author}
          rating={cartItem.rating}
          reviews={cartItem.reviews}
          price={cartItem.price}
          oldPrice={cartItem.oldPrice}
          image={cartItem.image}
          tag={cartItem.tag}
          duration={cartItem.duration}
          lesson={cartItem.lesson}
          onRemove={() => onRemove(cartItem.id)}
        />
      ))}
    </div>
  );
};

export default CartItemList;
