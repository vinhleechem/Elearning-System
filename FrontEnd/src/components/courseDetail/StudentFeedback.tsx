import React, { useState } from "react";
import type { ReviewsSummary } from "../../types/courseDetail";
import ReviewModal from "./ReviewModal";

interface Props {
  summary?: ReviewsSummary;
  courseId?: number;
  isPurchased?: boolean;
  onReviewSuccess?: () => void;
}

const StudentFeedback: React.FC<Props> = ({ summary, courseId, isPurchased, onReviewSuccess }) => {
  const [openReviewModal, setOpenReviewModal] = useState(false);
  if (!summary) return null;

  const counts = Array.isArray(summary.distribution) ? summary.distribution : [];
  const total = counts.reduce((a, b) => a + (b || 0), 0) || summary.count || 0;
  const average = summary.average ?? 0;

  // distribution index 0 = 5 stars, 4 = 1 star
  const bars = [5, 4, 3, 2, 1].map((star, i) => ({
    star,
    percent: total ? Math.round(((counts[i] || 0) * 100) / total) : 0,
  }));

  return (
    <section>
      <div className="flex items-center justify-between xl:justify-start gap-8 mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-primary">star</span>
          Phản hồi của học viên
        </h2>
        {isPurchased && courseId && (
          <button
            onClick={() => setOpenReviewModal(true)}
            className="px-5 py-2 whitespace-nowrap bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Viết đánh giá
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Big score */}
        <div className="md:col-span-1 text-center py-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-6xl font-black text-primary mb-2 tracking-tighter">
            {average.toFixed(1)}
          </p>
          <div className="flex justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`material-symbols-outlined transition-all duration-300 ${star <= Math.round(average)
                    ? "fill-1 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                    : "text-slate-300"
                  }`}
              >
                star
              </span>
            ))}
          </div>
          <p className="text-sm font-bold text-slate-500">
            {summary.count > 0 ? `${summary.count} đánh giá` : "Xếp hạng khóa học"}
          </p>
        </div>

        {/* Bar chart */}
        <div className="md:col-span-3 space-y-3 flex flex-col justify-center">
          {bars.map((d) => (
            <div
              key={d.star}
              className="grid items-center gap-4"
              style={{ gridTemplateColumns: "48px 1fr 40px" }}
            >
              <span className="text-sm text-slate-500 font-medium">
                {d.star} sao
              </span>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${d.percent}%` }}
                />
              </div>
              <span className="text-sm text-slate-500 text-right">
                {d.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {isPurchased && courseId && (
        <ReviewModal
          open={openReviewModal}
          onClose={() => setOpenReviewModal(false)}
          courseId={courseId}
          onSuccess={onReviewSuccess}
        />
      )}
    </section>
  );
};

export default StudentFeedback;
