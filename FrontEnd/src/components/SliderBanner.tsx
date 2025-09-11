import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const swiperStyles = `
  .banner-container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }
  .swiper-button-prev,
  .swiper-button-next {
    color: #ffffff; 
    background: rgba(0, 0, 0, 0.5); 
    width: 40px;
    height: 40px;
    border-radius: 50%; 
    transition: all 0.3s ease; 
  }
  .swiper-button-prev:hover,
  .swiper-button-next:hover {
    background: rgba(0, 0, 0, 0.8); 
    transform: scale(1.1);
  }
  .swiper-button-prev {
    left: 10px; 
  }
  .swiper-button-next {
    right: 10px; 
  }
  .swiper-button-prev:after,
  .swiper-button-next:after {
    font-size: 20px; 
  }
  @media (max-width: 640px) {
    .swiper-button-prev,
    .swiper-button-next {
      width: 30px;
      height: 30px;
      font-size: 16px;
    }
  }
`;

const SliderBanner = () => {
  const bannerImages: string[] = [
    "https://s.udemycdn.com/browse_components/billboard/fallback_banner_image_udlite.jpg",
    "https://img-c.udemycdn.com/notices/home_carousel_slide/image/1df98eed-29ab-4ee2-a1ec-81f6f2281e9a.png",
    "https://www.acpcomputer.com/wp-content/uploads/2024/03/ACP-Udemy-banner-1.png",
  ];

  return (
    <div className="banner-container">
      <style>{swiperStyles}</style>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        speed={600}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 10 },
          768: { slidesPerView: 1, spaceBetween: 20 },
        }}
      >
        {bannerImages.map((src, index) => (
          <SwiperSlide key={index}>
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              style={{
                width: "100%",
                height: "400px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SliderBanner;
