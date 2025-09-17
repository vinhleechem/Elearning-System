import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";

const LearningGoal = () => {
  return (
    <div className="py-10">
      <h2 className="text-2xl font-medium">
        Chương trình học tập hướng tới mục tiêu của bạn
      </h2>
      <div className="mt-5 flex">
        <div className="space-y-3">
          <Card sx={{ display: "flex" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: "1 0 auto" }}>
                <Typography component="div" fontWeight={600} fontSize={15}>
                  Đào tạo thực hành
                </Typography>
                <Typography
                  component="div"
                  fontSize={13}
                  sx={{ color: "text.secondary" }}
                >
                  Nâng cao kỹ năng một cách hiệu quả với các bài tập coding, bài
                  kiểm tra thực hành và trắc nghiệm được hỗ trợ bởi AI.
                </Typography>
              </CardContent>
            </Box>
            <CardMedia
              component="img"
              sx={{ width: 120, objectFit: "contain" }}
              image="https://cms-images.udemycdn.com/96883mtakkm8/7kN9RBFSMFNHzsGWsElMPi/dde73f8d1c47e046f035274e78410590/hands-on-practice.png"
              alt="Live from space album cover"
            />
          </Card>
          <Card sx={{ display: "flex" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: "1 0 auto" }}>
                <Typography component="div" fontWeight={600} fontSize={15}>
                  Đào tạo thực hành
                </Typography>
                <Typography
                  component="div"
                  fontSize={13}
                  sx={{ color: "text.secondary" }}
                >
                  Nâng cao kỹ năng một cách hiệu quả với các bài tập coding, bài
                  kiểm tra thực hành và trắc nghiệm được hỗ trợ bởi AI.
                </Typography>
              </CardContent>
            </Box>
            <CardMedia
              component="img"
              sx={{ width: 120, objectFit: "contain" }}
              image="https://cms-images.udemycdn.com/96883mtakkm8/7kN9RBFSMFNHzsGWsElMPi/dde73f8d1c47e046f035274e78410590/hands-on-practice.png"
              alt="Live from space album cover"
            />
          </Card>
          <Card sx={{ display: "flex" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: "1 0 auto" }}>
                <Typography component="div" fontWeight={600} fontSize={15}>
                  Đào tạo thực hành
                </Typography>
                <Typography
                  component="div"
                  fontSize={13}
                  sx={{ color: "text.secondary" }}
                >
                  Nâng cao kỹ năng một cách hiệu quả với các bài tập coding, bài
                  kiểm tra thực hành và trắc nghiệm được hỗ trợ bởi AI.
                </Typography>
              </CardContent>
            </Box>
            <CardMedia
              component="img"
              sx={{ width: 120, objectFit: "contain" }}
              image="https://cms-images.udemycdn.com/96883mtakkm8/7kN9RBFSMFNHzsGWsElMPi/dde73f8d1c47e046f035274e78410590/hands-on-practice.png"
              alt="Live from space album cover"
            />
          </Card>
          <Card sx={{ display: "flex" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: "1 0 auto" }}>
                <Typography component="div" fontWeight={600} fontSize={15}>
                  Đào tạo thực hành
                </Typography>
                <Typography
                  component="div"
                  fontSize={13}
                  sx={{ color: "text.secondary" }}
                >
                  Nâng cao kỹ năng một cách hiệu quả với các bài tập coding, bài
                  kiểm tra thực hành và trắc nghiệm được hỗ trợ bởi AI.
                </Typography>
              </CardContent>
            </Box>
            <CardMedia
              component="img"
              sx={{ width: 120, objectFit: "contain" }}
              image="https://cms-images.udemycdn.com/96883mtakkm8/7kN9RBFSMFNHzsGWsElMPi/dde73f8d1c47e046f035274e78410590/hands-on-practice.png"
              alt="Live from space album cover"
            />
          </Card>
        </div>
        <div className="">
          <img
            src="https://cms-images.udemycdn.com/96883mtakkm8/4kbyXne3Slx9Sfz4nTBqdf/8ac2b75db1a118f15e2fb5dfe2bb4567/desktop-hands-on-learning-2x.png"
            alt=""
            width={500}
          />
        </div>
      </div>
    </div>
  );
};

export default LearningGoal;
