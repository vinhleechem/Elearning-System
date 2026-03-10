import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../libs/utils";
import { useWishlist } from "../hooks";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { items: wishlistCourses, toggleWishlist } = useWishlist();

  const handleRemoveFromWishlist = (courseId: number) => {
    toggleWishlist(courseId);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 2) return; // already on wishlist page
    navigate("/my-courses/learning", { state: { tab: newValue } });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header Banner - Sync with MyLearningPage */}
      <div className="bg-slate-900 border-b border-white/10 dark:border-white/5 pt-12 pb-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h1 className="text-4xl font-black text-white mb-6">Học tập</h1>
          <div className="flex overflow-x-auto hide-scrollbar gap-8 border-b-2 border-transparent">
            {[
              "Tất cả khóa học",
              "Danh sách của tôi",
              "Danh sách mong ước",
              "Chứng chỉ",
              "Đã lưu trữ",
              "Công cụ học tập",
            ].map((tab, idx) => (
              <button
                key={idx}
                onClick={(e) => handleTabChange(e, idx)}
                className={`pb-4 text-base font-bold whitespace-nowrap transition-colors relative ${idx === 2
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                {tab}
                {idx === 2 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-sm" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {wishlistCourses.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">
              favorite
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Danh sách mong ước đang trống
            </h3>
            <p className="text-slate-500 mb-6 font-medium">
              Khám phá các khóa học hấp dẫn và thêm vào danh sách mong ước ngay!
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistCourses.map((course) => (
              <div
                key={course.courseId}
                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col h-full relative"
              >
                {/* Heart Icon to Remove */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveFromWishlist(course.courseId);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white hover:bg-rose-50 rounded-full shadow-md flex items-center justify-center z-10 transition-colors"
                  aria-label="Xóa khỏi danh sách mong ước"
                >
                  <span className="material-symbols-outlined text-[18px] text-rose-500 fill-1">
                    favorite
                  </span>
                </button>

                {/* Course Thumbnail */}
                <Link
                  to={`/course/${course.courseSlug}`}
                  className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800 block"
                >
                  <img
                    src={course.courseImage || ""}
                    alt={course.courseTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                </Link>

                {/* Info block */}
                <Link
                  to={`/course/${course.courseSlug}`}
                  className="p-4 flex flex-col flex-1"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[40px] leading-snug text-sm group-hover:text-primary transition-colors">
                    {course.courseTitle}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 mb-2 font-medium">
                    {course.instructorName || "Giảng viên"}
                  </p>

                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs font-black text-[#b4690e]">
                      {course.rating?.toFixed(1) || "0.0"}
                    </span>
                    <div className="flex items-center gap-[1px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`material-symbols-outlined text-[14px] ${star <= Math.round(course.rating || 0)
                              ? "text-amber-500 fill-1"
                              : "text-slate-300"
                            }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto mt-2 flex flex-col items-start gap-0.5">
                    <span className="font-black text-lg text-slate-900 dark:text-white leading-none">
                      {formatCurrency(course.discountPrice || course.price)}
                    </span>
                    {course.discountPrice && (
                      <span className="text-xs text-slate-400 line-through font-medium">
                        {formatCurrency(course.price)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
