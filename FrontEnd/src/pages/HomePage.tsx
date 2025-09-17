import React from "react";
import Header from "../components/layout/Header";
import { Box, Container } from "@mui/material";
import PartnerBanner from "../components/banner/PartnerBanner";
import SliderBanner from "../components/banner/SliderBanner";
import CourseList from "../components/course/CourseList";
import LearningGoal from "../components/LearningGoal";
import Trending from "../components/Trending";
import Footer from "../components/layout/Footer";
import ReportBanner from "../components/banner/ReportBanner";

const HomePage: React.FC = () => {
  return (
    <div>
      <Header />
      <Box>
        <Container maxWidth="xl">
          <SliderBanner />
          <PartnerBanner />
          <CourseList />
        </Container>
      </Box>
      <Box bgcolor={"#F6F7F9"}>
        <Container maxWidth="xl">
          <LearningGoal />
        </Container>
      </Box>
      <Box>
        <Container maxWidth="xl" className="py-5">
          <ReportBanner />
        </Container>
      </Box>
      <Box bgcolor={"#F6F7F9"}>
        <Container maxWidth="xl" className="py-5">
          <Trending />
        </Container>
      </Box>
      <Footer />
    </div>
  );
};

export default HomePage;
