import { Container } from "@mui/material";
import Header from "../components/layout/Header";
import PaymentPanel from "../components/payment/PaymentPanel";
import OrderSummaryPanel from "../components/order/OrderSummaryPanel";
import CheckoutItemList from "../components/checkout/CheckoutItemList";

const CheckoutPage = () => {
  return (
    <div>
      <Header checkoutMode />
      <Container maxWidth="lg">
        <div className="flex h-screen">
          <div className="flex-[2] p-6">
            <PaymentPanel />
            <CheckoutItemList />
          </div>
          <OrderSummaryPanel />
        </div>
      </Container>
    </div>
  );
};

export default CheckoutPage;
