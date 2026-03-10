interface CourseHeroProps {
  data: {
    title: string;
    description: string;
    rating: number;
    reviewCount: number;
    studentCount: number;
    lastUpdated: string;
    language: string;
    instructor: {
      name: string;
      avatar: string;
    };
    categories: string[];
    price?: number;
    originalPrice?: number;
    badges?: string[];
  };
}

export default function CourseHero({ data }: CourseHeroProps) {
  if (!data) return null;

  const displayRating = data.reviewCount > 0 ? data.rating : 0;

  return (
    <section className="space-y-5">
      {/* Badge */}
      <div>
        {data.badges && data.badges.length > 0 ? (
          data.badges.map((badge, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider"
            >
              {badge}
            </div>
          ))
        ) : (
          <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            Best Seller
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-slate-900 dark:text-white">
        {data.title}
      </h1>

      {/* Description */}
      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
        {data.description}
      </p>

      {/* Meta info row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
        {/* Instructor */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
            <img
              className="w-full h-full object-cover"
              src={
                data.instructor?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(data.instructor?.name || "GV")}&background=2463eb&color=fff`
              }
              alt={data.instructor?.name}
            />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
              Giảng viên
            </p>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {data.instructor?.name}
            </p>
          </div>
        </div>

        <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* Rating */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <span>{displayRating.toFixed(1)}</span>
            <div className="flex text-sm gap-px">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined text-sm transition-all duration-300 ${star <= Math.round(displayRating)
                    ? "fill-1 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                    : "text-slate-300"
                    }`}
                >
                  star
                </span>
              ))}
            </div>
            <span className="text-slate-500 text-sm font-normal">
              {data.reviewCount > 0
                ? `(${data.reviewCount.toLocaleString()}+ đánh giá)`
                : "(Chưa có đánh giá nào)"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {data.studentCount > 0
              ? `Hơn ${data.studentCount.toLocaleString()} học viên đã tham gia`
              : "Chưa có học viên nào tham gia"}
          </p>
        </div>

        <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* Last updated */}
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span className="material-symbols-outlined text-base">update</span>
          Cập nhật: {data.lastUpdated}
        </div>
      </div>
    </section>
  );
}
