import Button from "../ui/Button";

const ReportBanner = () => {
  return (
    <div className="flex items-center">
      <div className="space-y-5">
        <h2 className="text-xl font-semibold">
          AI dành cho Nhà lãnh đạo doanh nghiệp
        </h2>
        <p className="text-xs">
          Xây dựng thói quen AI cho bạn và đội nhóm của bạn để có được các kỹ
          năng thực hành giúp bạn lãnh đạo hiệu quả.
        </p>
        <Button>Bắt đầu học</Button>
      </div>
      <div className="">
        <img
          src="https://cms-images.udemycdn.com/96883mtakkm8/32egVZ5YRgjxrz5mr45EwO/2328193d64d64dd0ab01b6019791da22/ai_for_business_leaders_photo__1_.png"
          alt=""
        />
      </div>
    </div>
  );
};

export default ReportBanner;
