import { Link } from "react-router-dom";
import type { PurchasedCourse } from "../../types/purchasedCourse";
import { MoreVert, Star } from "@mui/icons-material";

interface PurchasedCourseCardProps {
  course: PurchasedCourse;
}

const PurchasedCourseCard: React.FC<PurchasedCourseCardProps> = ({
  course,
}) => {
  return (
    <Link
      to={`/course/${course.id}/learn`}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Icon Option Overlay */}
      <button className="absolute top-2 right-2 w-8 h-8 bg-white/50 hover:bg-white backdrop-blur-md rounded-full shadow border border-white/40 flex items-center justify-center z-10 text-slate-700 transition-colors opacity-0 group-hover:opacity-100">
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {/* Image Thumbnail */}
      <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={course.image || ""}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <span className="material-symbols-outlined text-white fill-1">play_arrow</span>
          </div>
        </div>
      </div>

      {/* Course Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug text-sm group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 mb-3 font-medium">
          {course.instructor}
        </p>

        <div className="mt-auto space-y-2">
          {/* Progress / Rating Stats */}
          <div className="flex items-center justify-between text-xs font-bold">
            <span
              className={course.progress === 0 ? "text-primary" : "text-slate-700 dark:text-slate-300"}
            >
              {course.progress === 0
                ? "BẮT ĐẦU NGAY"
                : `Hoàn thành ${Math.round(course.progress)}%`}
            </span>
            {course.rating ? (
              <div className="flex items-center gap-0.5 text-amber-500">
                <span className="material-symbols-outlined text-[14px] fill-1">star</span>
                {course.rating.toFixed(1)}
              </div>
            ) : null}
          </div>

          {/* Custom Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100
                ? "bg-green-500"
                : "bg-gradient-to-r from-primary to-blue-400"
                }`}
              style={{ width: `${course.progress || 0}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PurchasedCourseCard;
