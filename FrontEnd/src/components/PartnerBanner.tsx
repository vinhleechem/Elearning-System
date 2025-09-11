import React from "react";

const logos = [
  "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcjEB2JNAGJvCvdHgBQXZIr-3yon57qICVOQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFJP7X_crOPPYfdGyvHw8KhkxswWPubv8P4w&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkNGxH7RkY__JetwBJUPqfL9m4iBd-jFpvGA&s",
  "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQljl-fsEJnz7WDuB2YSRxJWr1UrJWHCg3VkA&s",
  "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
];

const PartnerBanner = () => {
  return (
    <div style={{ textAlign: "center", margin: "40px 0" }}>
      <h2 style={{ fontWeight: 600, marginBottom: "20px" }}>
        Được hơn 17.000 công ty và hàng triệu học viên trên khắp thế giới tin
        dùng
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
          alignItems: "center",
          justifyItems: "center",
          margin: "0 auto",
        }}
      >
        {logos.map((logo, i) => (
          <img
            key={i}
            src={logo}
            alt="partner logo"
            style={{ height: "40px", objectFit: "contain" }}
          />
        ))}
      </div>
    </div>
  );
};

export default PartnerBanner;
