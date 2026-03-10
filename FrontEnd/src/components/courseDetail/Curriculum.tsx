import React, { useState, useEffect } from "react";
import type { SectionItem, LectureItem } from "../../types/courseDetail";

interface Props {
  sections: SectionItem[];
  totalDuration?: string;
}

const parseDurationToSeconds = (s?: string) => {
  if (!s) return 0;
  const parts = s.split(":").map((p) => Number(p));
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
};

const formatSecondsToHM = (secs: number) => {
  if (!secs) return "0 phút";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const formatSecondsToMinText = (secs: number) => {
  if (!secs) return "0 phút";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h} giờ ${m} phút`;
  return `${m} phút`;
};

const getSectionDurationBytes = (section: SectionItem) => {
  const secs = (section.lectures || []).reduce((sum, l: LectureItem) => sum + parseDurationToSeconds(l.duration), 0);
  return formatSecondsToMinText(secs);
};

const Curriculum: React.FC<Props> = ({ sections = [] }) => {
  const [expanded, setExpanded] = useState<number[]>([]);

  useEffect(() => {
    if (sections.length > 0) {
      setExpanded([Number(sections[0].id)]);
    }
  }, [sections]);

  const totalLectures = sections.reduce((sum, s) => sum + (s.lectures?.length || 0), 0);
  const allDurationSecs = sections.reduce(
    (sum, s) =>
      sum +
      (s.lectures || []).reduce(
        (sSum, l) => sSum + parseDurationToSeconds(l.duration),
        0
      ),
    0
  );

  const handleToggle = (panelId: number) => {
    setExpanded((prev) =>
      prev.includes(panelId) ? prev.filter((id) => id !== panelId) : [...prev, panelId]
    );
  };

  if (!sections.length) return null;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Nội dung khóa học
        </h2>
        <span className="text-sm font-medium text-slate-500">
          {sections.length} chương • {totalLectures} bài giảng • {formatSecondsToHM(allDurationSecs)} tổng thời lượng
        </span>
      </div>

      <div className="space-y-3">
        {sections.map((section: SectionItem, index: number) => {
          const isExpanded = expanded.includes(Number(section.id));
          return (
            <div
              key={section.id}
              className={`border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden transition-all duration-300 ${isExpanded ? "shadow-sm" : ""}`}
            >
              <button
                onClick={() => handleToggle(Number(section.id))}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Phần {index + 1}: {section.title}
                  </span>
                </div>
                <span className="text-xs text-slate-500 shrink-0 ml-4">
                  {section.lectures?.length || 0} bài học • {getSectionDurationBytes(section)}
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="p-4 bg-white dark:bg-slate-900 space-y-3">
                    {(section.lectures || []).length === 0 ? (
                      <div className="text-sm text-slate-500 italic px-8 py-2">
                        Chưa có bài giảng nào trong phần này.
                      </div>
                    ) : (
                      (section.lectures || []).map((lecture: LectureItem) => (
                        <div
                          key={lecture.id}
                          className="flex items-center justify-between text-sm group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="material-symbols-outlined text-slate-400 text-sm shrink-0">
                              {lecture.previewable ? "play_circle" : "smart_display"}
                            </span>
                            <span
                              className={`truncate transition-colors ${lecture.previewable
                                  ? "text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                                  : "text-slate-600 dark:text-slate-400"
                                }`}
                            >
                              {lecture.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 pl-4">
                            {lecture.previewable && (
                              <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline text-xs hidden sm:inline-block">
                                Xem thử
                              </span>
                            )}
                            <span className="text-slate-400 tabular-nums">
                              {lecture.duration || ""}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Curriculum;
