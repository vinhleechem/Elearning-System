import type { InstructorInfo } from "../../types/courseDetail";

interface Props {
  instructor: InstructorInfo;
}

const Instructor: React.FC<Props> = ({ instructor }) => {
  return (
    <section className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        Giảng viên
      </h2>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar + stats */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg ring-4 ring-primary/10">
            <img
              className="w-full h-full object-cover"
              src={
                instructor.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name || "GV")}&background=2463eb&color=fff&size=200`
              }
              alt={instructor.name}
            />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
              <span className="material-symbols-outlined text-xs fill-1">star</span>
              {instructor.stats?.rating?.toFixed(1) || "5.0"} Rating
            </div>
            <div className="text-xs text-slate-500">{(instructor.stats?.students || 0).toLocaleString()} Học viên</div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3 flex-1">
          <div>
            <h3 className="text-xl font-black text-primary cursor-pointer hover:underline">
              {instructor.name}
            </h3>
            <p className="text-slate-500 font-medium text-sm mt-0.5">
              {instructor.title || "Chuyên gia / Giảng viên"}
            </p>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Với nhiều năm kinh nghiệm trong lĩnh vực chuyên môn, giảng viên
            đã giúp hàng nghìn học viên nắm vững kiến thức và kỹ năng thực
            tế, áp dụng trực tiếp vào công việc và phát triển sự nghiệp.
          </p>
          <div className="flex gap-3 pt-1">
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400"
            >
              <span className="material-symbols-outlined text-lg">language</span>
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-600 dark:text-slate-400"
            >
              <span className="material-symbols-outlined text-lg">link</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Instructor;
