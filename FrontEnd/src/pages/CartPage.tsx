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
          {/* <p className="font-semibold">0 khóa học trong giỏ hàng</p>
          <div className="flex flex-col items-center space-y-1 border p-5">
            <img
              src="https://s.udemycdn.com/browse_components/flyout/empty-shopping-cart-v2-2x.jpg"
              alt=""
            />
            <p>
              Giỏ hàng của bạn đang trống. Hãy tiếp tục mua sắm để tìm một khóa
              học!
            </p>
            <Button
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: "primary",
              }}
            >
              Tiếp tục mua sắm
            </Button>
          </div> */}
          <CartSummary />
        </div>
      </Container>
    </div>
  );
};

export default CartPage;
