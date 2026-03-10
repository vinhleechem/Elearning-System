import type { ReviewItem } from "../../types/courseDetail";

const Reviews: React.FC<{ items: ReviewItem[] }> = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      {items.map((r) => (
        <div
          key={r.id}
          className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
              {r.user
                .split(" ")
                .slice(-2)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {r.user}
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`material-symbols-outlined text-xs transition-all duration-300 ${star <= Math.round(r.rating)
                      ? "fill-1 text-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]"
                      : "text-slate-300"
                      }`}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
            <span className="text-xs text-slate-400 ml-auto shrink-0">
              {r.date}
            </span>
          </div>

          {/* Comment */}
          {r.comment && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
              "{r.comment}"
            </p>
          )}

          {/* Helpful */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            Hữu ích?
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">thumb_up</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reviews;
