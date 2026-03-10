import React from "react";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate } from "react-router-dom";
import { useCart, useWishlist } from "../../hooks";
import { useState, useEffect } from "react";
import { formatDate } from "../../libs/dateUtils";
import { formatCurrency } from "../../libs/utils";

interface Props {
  courseId: number;
  price: number;
  oldPrice?: number | null;
  ctaDisabled?: boolean;
  isPurchased?: boolean;
  purchasedAt?: string;
  thumbnailUrl?: string;
  promotionName?: string;
  promotionType?: string;
  discountPercentage?: number;
  promotionEndDate?: string;
}

const PurchaseSidebar: React.FC<Props> = ({
  courseId,
  price,
  oldPrice,
  ctaDisabled,
  isPurchased,
  purchasedAt,
  thumbnailUrl,
  discountPercentage,
  promotionEndDate,
}) => {
  const { checkAndAddToCart, isInCart, goToCheckout } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(courseId);
  const inCart = isInCart(courseId);

  const handleWishlistClick = () => toggleWishlist(courseId);
  const handleAddToCart = () => checkAndAddToCart(courseId);
  const handleBuyNow = async () => {
    await checkAndAddToCart(courseId);
    goToCheckout();
  };
  const handleGoToCourse = () => navigate(`/course/${courseId}/learn`);

  const formattedDate = purchasedAt ? formatDate(purchasedAt) : "";

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!promotionEndDate) return;
    const calculate = () => {
      const diff = new Date(promotionEndDate).getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      } else {
        setTimeLeft(null);
      }
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [promotionEndDate]);

  const courseIncludes = [
    { icon: "videocam", text: "9.5 giờ video bài giảng" },
    { icon: "description", text: "Bài viết chuyên sâu" },
    { icon: "download", text: "Tài liệu tải xuống" },
    { icon: "all_inclusive", text: "Quyền truy cập vĩnh viễn" },
    { icon: "workspace_premium", text: "Chứng chỉ hoàn thành" },
  ];

  // Compute discount percent for display
  const discountPct =
    discountPercentage ??
    (oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Video Thumbnail */}
      <div className="aspect-video relative group cursor-pointer">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="Course preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-primary">
            <SchoolIcon sx={{ fontSize: 48 }} />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-white text-4xl fill-1">
              play_arrow
            </span>
          </div>
        </div>
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <span className="text-white text-xs font-bold bg-black/40 px-3 py-1 rounded">
            Xem trước khóa học
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {isPurchased ? (
          /* ── Already purchased ── */
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl">
              <span className="material-symbols-outlined shrink-0">check_circle</span>
              <p className="text-sm font-medium leading-relaxed">
                Bạn đã mua khóa học này vào{" "}
                <strong>{formattedDate}</strong>
              </p>
            </div>
            <button
              onClick={handleGoToCourse}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Chuyển đến khóa học
            </button>
          </div>
        ) : (
          /* ── Purchase flow ── */
          <>
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {formatCurrency(price)}
              </span>
              {oldPrice && (
                <span className="text-slate-400 line-through text-sm">
                  {formatCurrency(oldPrice)}
                </span>
              )}
              {discountPct && (
                <span className="text-primary font-bold text-sm">
                  Giảm {discountPct}%
                </span>
              )}
            </div>

            {/* Countdown */}
            {timeLeft && (
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm font-bold bg-rose-50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
                <span className="material-symbols-outlined text-base">timer</span>
                Còn lại {timeLeft.hours}h {timeLeft.minutes}m với giá này!
              </div>
            )}

            {/* CTA buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                disabled={ctaDisabled}
                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                Mua ngay
              </button>
              <div className="flex gap-3">
                <button
                  disabled={ctaDisabled}
                  onClick={handleAddToCart}
                  className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white text-sm disabled:opacity-50"
                >
                  {inCart ? "Đã có trong giỏ" : "Thêm vào giỏ hàng"}
                </button>
                <button
                  onClick={handleWishlistClick}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors ${inWishlist
                      ? "border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-500/10"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-rose-300 hover:text-rose-500"
                    }`}
                >
                  <span className={`material-symbols-outlined ${inWishlist ? "fill-1" : ""}`}>
                    favorite
                  </span>
                </button>
              </div>
            </div>

            {/* Guarantee */}
            <p className="text-sm font-medium text-center text-slate-500 italic">
              Đảm bảo hoàn tiền trong 30 ngày
            </p>
          </>
        )}

        {/* Course includes */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">
            Khóa học bao gồm:
          </h4>
          {courseIncludes.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
            >
              <span className="material-symbols-outlined text-primary text-lg">
                {item.icon}
              </span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Business promo card */}
      <div className="mx-6 mb-6 bg-gradient-to-br from-primary to-blue-700 rounded-xl p-5 text-white shadow-lg shadow-blue-500/20">
        <h4 className="font-black text-lg mb-1">Dành cho Doanh Nghiệp?</h4>
        <p className="text-sm text-blue-100 mb-4 leading-relaxed">
          Đào tạo đội ngũ của bạn với các kỹ năng tiên tiến nhất để dẫn đầu thị trường.
        </p>
        <button className="w-full py-2 bg-white text-primary font-bold rounded-lg text-sm hover:bg-blue-50 transition-colors">
          Xem gói Business
        </button>
      </div>
    </div>
  );
};

export default PurchaseSidebar;
