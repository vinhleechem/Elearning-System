import CartItem from "./CartItem";
import type { CartItemProps } from "../../types/cartItem";

const CartItemList = () => {
  const cartItems: CartItemProps[] = [
    {
      id: 1,
      title: "Tâm lý học Xã hội - Social Psychology 101",
      author: "Mindfulness Life",
      reviews: 131,
      rating: 4.8,
      price: 279000,
      oldPrice: 399000,
      image: "https://img-c.udemycdn.com/course/240x135/6698605_61eb_3.jpg",
      tag: "Mới",
      duration: 5,
      lesson: 29,
    },
    {
      id: 2,
      title: "AWS Cloud for beginner (Vietnamese)",
      author: "Linh Nguyen",
      reviews: 1111,
      rating: 4.8,
      price: 319000,
      oldPrice: 1919000,
      image: "https://img-c.udemycdn.com/course/480x270/6727737_4dd9_8.jpg",
      tag: "Bán chạy nhất",
      duration: 25.5,
      lesson: 354,
    },
  ];
  return (
    <div className="mr-5 flex-[2]">
      <p className="mb-2 font-semibold">0 khóa học trong giỏ hàng</p>
      {cartItems.map((cartItem) => (
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
        />
      ))}
    </div>
  );
};

export default CartItemList;
