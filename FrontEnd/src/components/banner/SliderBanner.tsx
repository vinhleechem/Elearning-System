import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const swiperStyles = `
  .banner-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden; /* Ensure content doesn't spill out */
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
    "/images/banners/banner1.png",
    "/images/banners/banner2.png",
    "/images/banners/banner3.png",
    "/images/banners/banner4.png",
    "/images/banners/banner5.png",
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
                objectFit: "fill",
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
