import CheckoutItem from "./CheckoutItem";

const CheckoutItemList = () => {
  return (
    <>
      <p className="py-3">
        <span className="font-bold">Thông tin đặt hàng</span> (6 khóa học)
      </p>
      <div>
        <CheckoutItem
          id={1}
          price={100000}
          oldPrice={10000}
          image="https://img-c.udemycdn.com/course/100x100/1360780_1421_6.jpg"
          title="Practice Java by Building Projects"
        />
        <CheckoutItem
          id={1}
          price={100000}
          image="https://img-c.udemycdn.com/course/100x100/1360780_1421_6.jpg"
          title="Practice Java by Building Projects"
        />
        <CheckoutItem
          id={1}
          price={100000}
          image="https://img-c.udemycdn.com/course/100x100/1360780_1421_6.jpg"
          title="Practice Java by Building Projects"
        />
      </div>
    </>
  );
};

export default CheckoutItemList;
