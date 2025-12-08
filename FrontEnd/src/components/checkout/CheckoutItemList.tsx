import { useEffect } from "react";
import { useCartStore } from "../../store/cartStore";
import CheckoutItem from "./CheckoutItem";

const CheckoutItemList = () => {
  const { items, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <>
      <p className="py-3">
        <span className="font-bold">Thông tin đặt hàng</span> ({items.length} khóa học)
      </p>
      <div>
        {items.map((item) => (
          <CheckoutItem
            key={item.courseId}
            id={item.courseId}
            price={item.discountPrice ?? item.price}
            oldPrice={item.discountPrice ? item.price : undefined}
            image={item.courseImage}
            title={item.courseTitle}
          />
        ))}
      </div>
    </>
  );
};

export default CheckoutItemList;
