import Course from "./Course";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

const CourseList = () => {
  const courses = [
    {
      id: 1,
      title: "Java Spring RESTful APIs - Xây Dựng Backend với Spring Boot",
      teacher: "Hỏi Dân IT với Eric",
      rating: 4.8,
      reviews: 143,
      price: 1799000,
      oldPrice: null,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Bán chạy nhất",
    },
    {
      id: 2,
      title: "Thành Thạo ChatGPT trong Công Việc Mua Hàng",
      teacher: "Zenson Tran",
      rating: 5.0,
      reviews: 13,
      price: 279000,
      oldPrice: 659000,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Hot",
    },
    {
      id: 3,
      title: "Thành Thạo ChatGPT trong Công Việc Mua Hàng",
      teacher: "Zenson Tran",
      rating: 4.0,
      reviews: 13,
      price: 279000,
      oldPrice: 659000,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Mới nhất",
    },
    {
      id: 4,
      title: "Thành Thạo ChatGPT trong Công Việc Mua Hàng",
      teacher: "Zenson Tran",
      rating: 4.0,
      reviews: 13,
      price: 279000,
      oldPrice: 659000,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Mới nhất",
    },
    {
      id: 5,
      title: "Thành Thạo ChatGPT trong Công Việc Mua Hàng",
      teacher: "Zenson Tran",
      rating: 4.0,
      reviews: 13,
      price: 279000,
      oldPrice: 659000,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Mới nhất",
    },
    {
      id: 6,
      title: "Thành Thạo ChatGPT trong Công Việc Mua Hàng",
      teacher: "Zenson Tran",
      rating: 4.0,
      reviews: 13,
      price: 279000,
      oldPrice: 659000,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Mới nhất",
    },
  ];

  return (
    <>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        slidesPerView={4}
        style={{ padding: "20px 0" }}
      >
        {courses.map((course) => (
          <SwiperSlide key={course.id}>
            <Course
              title={course.title}
              teacher={course.teacher}
              rating={course.rating}
              reviews={course.reviews}
              price={course.price}
              oldPrice={course.oldPrice}
              image={course.image}
              tag={course.tag}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default CourseList;
