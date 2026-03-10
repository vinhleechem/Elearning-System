import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PurchasedCourseCard from "../../components/learning/PurchasedCourseCard";
import type { PurchasedCourse } from "../../types/purchasedCourse";
import { httpClient } from "../../service/httpClient";
import { useToast } from "../../hooks/useToast";

interface EnrollmentResponse {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  courseImage: string;
  instructorName: string;
  progress: number;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  slug: string;
}

const MyLearningPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<number>(
    (location.state as any)?.tab ?? 0,
  );
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useToast();

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  const fetchMyEnrollments = async () => {
    try {
      setLoading(true);
      const response = await httpClient<EnrollmentResponse[]>("/enrollments");
      if (response.data) {
        const mappedCourses: PurchasedCourse[] = response.data.map((item) => ({
          id: item.courseId,
          title: item.courseTitle,
          instructor: item.instructorName || "Unknown Instructor",
          image: item.courseImage,
          progress: item.progress,
          totalLectures: item.totalLessons || 0,
          completedLectures: item.completedLessons || 0,
          totalDuration: 0, // Not available in API yet
          lastAccessed: item.enrolledAt,
          slug: item.slug,
          rating: 0, // Not available
        }));
        setPurchasedCourses(mappedCourses);
      }
    } catch (error) {
      console.error("Failed to fetch enrollments", error);
      enqueueSnackbar("Không thể tải danh sách khóa học", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 2) {
      // Tab "Danh sách mong ước"
      navigate("/my-courses/wishlist");
    }
  };

  const getFilteredCourses = () => {
    switch (activeTab) {
      case 0:
      case 1:
        return purchasedCourses;
      default:
        return purchasedCourses;
    }
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header Banner */}
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
                onClick={() => handleTabChange(idx)}
                className={`pb-4 text-base font-bold whitespace-nowrap transition-colors relative ${activeTab === idx
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                {tab}
                {activeTab === idx && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-sm" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Streak Widget (Only on 'All Courses' tab) */}
            {activeTab === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      Bắt đầu một chuỗi hàng tuần
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">
                      Hãy thực hiện từng mục tiêu học tập của bạn.
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        0 Tuần
                      </span>
                      <div className="mt-2 w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center text-xl font-black text-slate-900 dark:text-white">
                        0
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        <span className="text-slate-900 dark:text-white font-bold">0</span>/30 phút khóa học
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        <span className="text-slate-900 dark:text-white font-bold">1</span>/1 lượt truy cập
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <PurchasedCourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">
                  sentiment_dissatisfied
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Chưa có khóa học nào
                </h3>
                <p className="text-slate-500 mb-6">
                  Hãy khám phá các khóa học và bắt đầu học ngay!
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Khám phá khóa học
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearningPage;
