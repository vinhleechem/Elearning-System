import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "@mui/material";
import CourseList from "../components/course/CourseList";
import SliderBanner from "../components/banner/SliderBanner";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import confetti from "canvas-confetti";

const HomePage: React.FC = () => {
    useEffect(() => {
        // Confetti effect on page load
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Left side
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });

            // Right side
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen overflow-x-hidden relative">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16 pb-24 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                <Container maxWidth="xl" className="relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-lg">
                                <TrendingUpIcon className="text-xl" />
                                <span>Nền tảng học tập #1 Việt Nam</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                                    Học tập thông minh
                                </span>
                                <br />
                                <span className="text-gray-900">Thành công vượt trội</span>
                            </h1>

                            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                                Khám phá hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng đầu.
                                Nâng cao kỹ năng, thay đổi sự nghiệp của bạn ngay hôm nay.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/courses">
                                    <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 w-full sm:w-auto">
                                        <span className="flex items-center justify-center gap-2">
                                            Khám phá ngay
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className="group px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 w-full sm:w-auto">
                                        <span className="flex items-center justify-center gap-2">
                                            <PlayCircleFilledWhiteIcon className="text-blue-600" />
                                            Xem demo
                                        </span>
                                    </button>
                                </Link>
                            </div>

                            {/* Social Proof */}
                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <img
                                            key={i}
                                            className="w-12 h-12 rounded-full border-4 border-white shadow-md"
                                            src={`https://i.pravatar.cc/100?img=${i}`}
                                            alt={`Student ${i}`}
                                        />
                                    ))}
                                    <div className="w-12 h-12 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        +5k
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium mt-1">
                                        <span className="font-bold text-gray-900">5,000+</span> học viên hài lòng
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Hero Image/Slider */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20"></div>
                            <div className="relative bg-white p-3 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
                                <SliderBanner />
                            </div>

                            {/* Floating Stats Cards */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-float">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                        <EmojiEventsIcon className="text-white text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">500+</p>
                                        <p className="text-sm text-gray-500">Khóa học</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-float animation-delay-2000">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                                        <PeopleIcon className="text-white text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">10k+</p>
                                        <p className="text-sm text-gray-500">Học viên</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Trust Badges */}
            <section className="py-12 bg-white border-y border-gray-100">
                <Container maxWidth="xl">
                    <p className="text-center text-sm text-gray-500 uppercase tracking-wider font-semibold mb-8">
                        Được tin tưởng bởi các tổ chức hàng đầu
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-8" alt="Google" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="h-10" alt="Apple" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" className="h-8" alt="Amazon" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" className="h-10" alt="IBM" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg" className="h-10" alt="VW" />
                    </div>
                </Container>
            </section>

            {/* Popular Courses Section */}
            <section className="py-10 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                <Container maxWidth="xl" className="relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-700">Khóa học được yêu thích nhất</span>
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                Khóa học nổi bật
                            </span>
                        </h2>

                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Được bình chọn và đánh giá cao nhất bởi cộng đồng học viên.
                            Cập nhật kiến thức mới nhất mỗi ngày.
                        </p>

                        <Link
                            to="/courses"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 font-semibold text-lg group transition-colors"
                        >
                            <span>Xem tất cả khóa học</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>

                    {/* Course List */}
                    <div className="relative">
                        <CourseList />
                    </div>
                </Container>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <Container maxWidth="xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                            Tại sao chọn chúng tôi?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Trải nghiệm học tập đẳng cấp với công nghệ hiện đại
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="group p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <SchoolIcon className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Giảng viên chuyên nghiệp</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Học từ các chuyên gia hàng đầu với kinh nghiệm thực tế tại các tập đoàn lớn
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <CheckCircleIcon className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Chứng chỉ uy tín</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Nhận chứng chỉ được công nhận để thăng tiến trong sự nghiệp của bạn
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <PeopleIcon className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Cộng đồng sôi động</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Kết nối và học hỏi cùng hàng ngàn học viên đam mê trên toàn quốc
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Office Location Section */}
            <section className="py-16 bg-white">
                <Container maxWidth="xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                            Ghé thăm văn phòng của chúng tôi
                        </h2>
                        <p className="text-lg text-gray-600">
                            Chúng tôi luôn sẵn sàng chào đón bạn tại trụ sở chính
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Map */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                            <div className="relative bg-white p-1.5 rounded-xl shadow-lg">
                                <iframe
                                    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Trường+Đại+học+FPT+TP.+HCM&zoom=15"
                                    width="100%"
                                    height="320"
                                    style={{ border: 0, borderRadius: '8px' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Office Location"
                                ></iframe>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Địa chỉ văn phòng</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Lô E2a-7, Đường D1, Khu Công nghệ cao<br />
                                            P. Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Liên hệ</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            <span className="block">📞 Hotline: (028) 3864 5124</span>
                                            <span className="block">📧 contact@elearning.edu.vn</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <Container maxWidth="xl" className="relative z-10">
                    <div className="text-center text-white">
                        <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                            Bắt đầu hành trình của bạn
                        </h2>
                        <p className="text-xl lg:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
                            Tham gia cùng hàng ngàn học viên đã thay đổi cuộc đời họ
                        </p>
                        <Link to="/register">
                            <button className="px-12 py-5 bg-white text-purple-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl hover:bg-gray-50 transition-all transform hover:-translate-y-1 hover:scale-105">
                                Đăng ký miễn phí ngay
                            </button>
                        </Link>
                        <p className="mt-6 text-sm text-blue-100">
                            ✓ Không cần thẻ tín dụng  ✓ Hủy bất cứ lúc nào  ✓ Truy cập ngay lập tức
                        </p>
                    </div>
                </Container>
            </section>
        </div>
    );
};

export default HomePage;
