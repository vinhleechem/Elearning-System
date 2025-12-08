import { Container } from "@mui/material";
import PaymentPanel from "../components/payment/PaymentPanel";
import OrderSummaryPanel from "../components/order/OrderSummaryPanel";
import CheckoutItemList from "../components/checkout/CheckoutItemList";

const CheckoutPage = () => {
  return (
    <div>
      <Container maxWidth="lg">
        <div className="flex min-h-screen">
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
