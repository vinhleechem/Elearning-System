import { Container } from "@mui/material";
import Header from "../components/layout/Header";
import CartItemList from "../components/cart/CartItemList";
import CartSummary from "../components/cart/CartSummary";

const CartPage = () => {
  return (
    <div>
      <Header />
      <Container maxWidth="xl">
        <h1 className="my-6 text-5xl font-bold">Giỏ hàng</h1>
        <div className="flex justify-between">
          <CartItemList />
          <CartSummary />
        </div>
      </Container>
    </div>
  );
};

export default CartPage;
