import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const swiperStyles = `
  .banner-container {
    max-width: 1200px;
    margin: 10px auto;
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
    "/images/home/360_F_465465254_1pN9MGrA831idD6zIBL7q8rnZZpUCQTy.jpg",
    "/images/home/430582ec-bd67-465d-b81f-c9b67d8df0fe.png",
    "/images/home/ae26411d-ece1-443b-93a0-05550bfe8c54.png",
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
