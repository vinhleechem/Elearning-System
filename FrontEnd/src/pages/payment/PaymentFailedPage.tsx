import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PaymentFailedPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const navigate = useNavigate();
    const playerRef = useRef<Player>(null);

    // Play lottie animation
    const handlePlay = () => {
        playerRef.current?.play();
    };

    return (
        <Container maxWidth="sm" className="flex min-h-screen flex-col items-center justify-center py-10">
            <div className="w-full rounded-2xl bg-white p-8 text-center shadow-lg">
                <div className="mb-6 flex justify-center">
                    {/* Lottie for error ex: https://lottiefiles.com/animations/error-42862 */}
                    <Player
                        ref={playerRef}
                        autoplay
                        keepLastFrame
                        src="https://lottie.host/e2c05086-f089-408c-905c-59e51c88e938/sK2Y2e1t6P.json"
                        style={{ height: '150px', width: '150px' }}
                        onEvent={(event) => {
                            if (event === 'load') handlePlay();
                        }}
                    />
                </div>

                <h1 className="mb-2 text-3xl font-bold text-red-600">Thanh toán thất bại!</h1>
                <p className="mb-6 text-gray-600">
                    Giao dịch cho đơn hàng <strong>#{orderId}</strong> không thành công. Vui lòng thử lại.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => navigate("/payment/checkout")}
                        className="w-full py-3 text-lg"
                    >
                        Thử lại
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

export default PaymentFailedPage;
