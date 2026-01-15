import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { CircularProgress, Box } from "@mui/material";

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const navigate = useNavigate();
    const { clearCart } = useCartStore();

    useEffect(() => {
        // Clear cart immediately
        clearCart();

        // Redirect to Home with params to trigger popup
        const timer = setTimeout(() => {
            navigate(`/?payment_success=true${orderId ? `&orderId=${orderId}` : ''}`, { replace: true });
        }, 800);

        return () => clearTimeout(timer);
    }, [clearCart, navigate, orderId]);

    return (
        <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
        </Box>
    );
};

export default PaymentSuccessPage;
