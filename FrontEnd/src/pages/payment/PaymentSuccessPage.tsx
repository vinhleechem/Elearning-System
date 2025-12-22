import { useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const navigate = useNavigate();
    const playerRef = useRef<Player>(null);
    const { clearCart } = useCartStore();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    // Play lottie animation
    const handlePlay = () => {
        playerRef.current?.play();
    };

    return (
        <Container maxWidth="sm" className="flex min-h-screen flex-col items-center justify-center py-10">
            <div className="w-full rounded-2xl bg-white p-8 text-center shadow-lg">
                <div className="mb-6 flex justify-center">
                    <Player
                        ref={playerRef}
                        autoplay
                        keepLastFrame
                        src="https://lottie.host/80516bd0-349f-4315-9c87-872f03f7e034/00c76x89yZ.json"
                        style={{ height: '200px', width: '200px' }}
                        onEvent={(event) => {
                            if (event === 'load') handlePlay();
                        }}
                    />
                </div>

                <h1 className="mb-2 text-3xl font-bold text-green-600">Thanh toán thành công!</h1>
                <p className="mb-6 text-gray-600">
                    Cảm ơn bạn đã mua khóa học. Đơn hàng <strong>#{orderId}</strong> của bạn đã được xác nhận.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => navigate("/my-courses/learning")}
                        className="w-full py-3 text-lg"
                    >
                        Vào học ngay
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate("/")}
                        className="w-full"
                    >
                        Về trang chủ
                    </Button>
                </div>
            </div>
        </Container>
    );
};

export default PaymentSuccessPage;
