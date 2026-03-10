import { useNavigate } from "react-router-dom";

interface Related {
  id: string;
  slug?: string;
  title: string;
  rating: number;
  price: number;
  image: string;
}

interface Props {
  courses?: Related[];
}

const RelatedCourses: React.FC<Props> = ({ courses }) => {
  const navigate = useNavigate();

  if (!courses || courses.length === 0) return null;

  return (
    <section className="mt-16 pb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Khóa học liên quan
        </h2>
        <a
          href="/courses"
          className="text-primary font-bold text-sm hover:underline"
        >
          Xem tất cả
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((c) => (
          <div
            key={c.id}
            onClick={() =>
              navigate(c.slug ? `/courses/${c.slug}` : `/courses/${c.id}`)
            }
            className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={c.image || "https://placehold.co/600x400/e2e8f0/64748b?text=Course"}
                alt={c.title}
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug text-sm">
                {c.title}
              </h3>
              {/* Rating */}
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                {c.rating.toFixed(1)}
                <span className="material-symbols-outlined text-[10px] fill-1">
                  star
                </span>
              </div>
              {/* Price */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-black text-lg text-slate-900 dark:text-white">
                  {c.price ? `${c.price.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedCourses;
