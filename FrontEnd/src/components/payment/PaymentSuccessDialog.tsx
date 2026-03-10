import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  orderId?: string | null;
}

const PaymentSuccessDialog = ({
  open,
  onClose,
  orderId,
}: PaymentSuccessDialogProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    // Burst confetti from center-top
    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        origin: { y: 0.35 },
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, [open]);

  const handleGoToLearning = () => {
    onClose();
    navigate("/my-courses/learning");
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          zIndex: 1300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          animation: "psDialogFadeIn 0.25s ease",
        }}
      >
        {/* Card */}
        <div
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "480px",
            overflow: "hidden",
            boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
            animation: "psDialogSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Top gradient bar */}
          <div
            style={{
              height: "6px",
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #d946ef)",
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Đóng"
            style={{
              position: "absolute",
              top: "18px",
              right: "18px",
              background: "rgba(0,0,0,0.05)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
              zIndex: 10,
            }}
            onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "rgba(0,0,0,0.12)")
            }
            onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "rgba(0,0,0,0.05)")
            }
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="#555"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Body */}
          <div style={{ padding: "40px 40px 36px", textAlign: "center" }}>
            {/* Success icon with ring animation */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "28px",
              }}
            >
              <div style={{ position: "relative", width: "96px", height: "96px" }}>
                {/* Pulsing rings */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                    animation: "psRingPulse 2s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: "-12px",
                    borderRadius: "50%",
                    border: "2px solid rgba(99,102,241,0.25)",
                    animation: "psRingExpand 2s ease-in-out infinite 0.3s",
                  }}
                />
                {/* Circle */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                    animation: "psIconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
                  }}
                >
                  {/* Checkmark SVG */}
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    fill="none"
                    style={{ animation: "psCheckDraw 0.4s ease 0.4s both" }}
                  >
                    <path
                      d="M10 22l9 9L34 14"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 40,
                        strokeDashoffset: 40,
                        animation: "psCheckStroke 0.45s ease 0.5s forwards",
                      }}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Heading */}
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "28px",
                fontWeight: 800,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #d946ef 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
              }}
            >
              Thanh toán thành công! 🎉
            </h2>

            {/* Subtitle */}
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "15px",
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              Chúc mừng bạn! Thanh toán đã được ghi nhận.
              <br />
              Khóa học đã được mở khóa và sẵn sàng để học.
            </p>

            {/* Order badge */}
            {orderId && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: "999px",
                  padding: "5px 14px",
                  fontSize: "13px",
                  color: "#6366f1",
                  fontWeight: 600,
                  margin: "16px 0 0",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Mã đơn hàng: #{orderId}
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, #e5e7eb, transparent)",
                margin: "28px 0",
              }}
            />

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Primary CTA */}
              <button
                onClick={handleGoToLearning}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 6px 24px rgba(99,102,241,0.35)",
                  transition: "all 0.2s ease",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.transform = "translateY(-2px)";
                  btn.style.boxShadow = "0 10px 32px rgba(99,102,241,0.45)";
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.transform = "translateY(0)";
                  btn.style.boxShadow = "0 6px 24px rgba(99,102,241,0.35)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Vào học ngay
              </button>

              {/* Secondary CTA */}
              <button
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "13px 24px",
                  borderRadius: "14px",
                  border: "1.5px solid #e5e7eb",
                  background: "#fff",
                  color: "#374151",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.borderColor = "#d1d5db";
                  btn.style.background = "#f9fafb";
                  btn.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.borderColor = "#e5e7eb";
                  btn.style.background = "#fff";
                  btn.style.transform = "translateY(0)";
                }}
              >
                Tiếp tục xem trang chủ
              </button>
            </div>
          </div>

          {/* Bottom footer strip */}
          <div
            style={{
              background: "#f9fafb",
              borderTop: "1px solid #f3f4f6",
              padding: "12px 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
              Giao dịch được bảo mật và mã hóa
            </span>
          </div>
        </div>
      </div>

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes psDialogFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes psDialogSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes psRingPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.6; }
        }
        @keyframes psRingExpand {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes psIconPop {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes psCheckStroke {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </>
  );
};

export default PaymentSuccessDialog;
