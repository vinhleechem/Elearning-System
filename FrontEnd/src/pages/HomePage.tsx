import React from "react";
import Header from "../components/Header";
import { Container } from "@mui/material";
import PartnerBanner from "../components/PartnerBanner";
import SliderBanner from "../components/SliderBanner";
import CourseList from "../components/CourseList";

const HomePage: React.FC = () => {
  return (
    <div>
      <Header />
      <Container maxWidth="xl" className="mt-3">
        <SliderBanner />
        <PartnerBanner />
        <CourseList />
      </Container>
    </div>
  );
};

export default HomePage;
