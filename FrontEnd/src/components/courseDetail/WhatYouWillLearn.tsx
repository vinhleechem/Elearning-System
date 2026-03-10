import { useState } from "react";

interface Props {
  items: string[];
}

const WhatYouWillLearn: React.FC<Props> = ({ items }) => {
  const [expanded, setExpanded] = useState(false);
  const initialLimit = 8;
  const visible = expanded ? items : items.slice(0, initialLimit);

  if (!items || items.length === 0) return null;

  return (
    <section className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        Bạn sẽ học được gì?
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {visible.map((item, index) => (
          <div key={index} className="flex gap-3">
            <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">
              check_circle
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {item.replace(/^[•\-\.\s]+/, "")}
            </span>
          </div>
        ))}
      </div>

      {items.length > initialLimit && (
        <button
          onClick={() => setExpanded((s) => !s)}
          className="mt-6 text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm"
        >
          {expanded ? "Ẩn bớt" : "Xem thêm"}
          <span
            className={`material-symbols-outlined transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            expand_more
          </span>
        </button>
      )}
    </section>
  );
};

export default WhatYouWillLearn;
