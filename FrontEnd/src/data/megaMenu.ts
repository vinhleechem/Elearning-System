export interface MegaMenuColumn {
  title: string;
  items: string[];
}

export interface MegaMenuTopic {
  label: string;
  columns: MegaMenuColumn[];
}

export const megaMenuPrimaryTitle = "Khám phá theo mục tiêu";

const aiColumns: MegaMenuColumn[] = [
  {
    title: "Kiến thức căn bản về AI",
    items: [
      "AI dành cho Chuyên gia",
      "AI dành cho Nhà phát triển",
      "AI dành cho Nhà sáng tạo",
    ],
  },
  {
    title: "Các chủ đề phổ biến",
    items: [
      "Kỹ thuật tạo lệnh",
      "Large Language Models (LLM)",
      "AI tạo sinh (GenAI)",
      "AI Agents & Agentic AI",
    ],
  },
];

const certificationColumns: MegaMenuColumn[] = [
  {
    title: "Chứng chỉ hàng đầu",
    items: [
      "AWS Certified Solutions Architect",
      "Google Professional Cloud Architect",
      "PMI PMP",
      "Microsoft Azure Fundamentals",
    ],
  },
  {
    title: "Lộ trình học",
    items: [
      "Cloud & DevOps",
      "Data & AI",
      "Security",
      "Product Management",
    ],
  },
];

const genericColumns: MegaMenuColumn[] = [
  {
    title: "Nội dung nổi bật",
    items: [
      "Khóa học bán chạy",
      "Khóa học mới",
      "Khóa học miễn phí",
      "Khóa học được đề xuất",
    ],
  },
  {
    title: "Khám phá thêm",
    items: [
      "Gói đăng ký doanh nghiệp",
      "Lộ trình cá nhân",
      "Series workshop",
      "Cộng đồng học viên",
    ],
  },
];

export const megaMenuTopics: MegaMenuTopic[] = [
  {
    label: "Học AI",
    columns: aiColumns,
  },
  {
    label: "Luyện thi chứng chỉ",
    columns: certificationColumns,
  },
  {
    label: "Phát triển",
    columns: genericColumns,
  },
  {
    label: "Kinh doanh",
    columns: genericColumns,
  },
  {
    label: "Tài chính & Kế toán",
    columns: genericColumns,
  },
  {
    label: "CNTT & Phần mềm",
    columns: genericColumns,
  },
  {
    label: "Năng suất văn phòng",
    columns: genericColumns,
  },
  {
    label: "Phát triển cá nhân",
    columns: genericColumns,
  },
  {
    label: "Thiết kế",
    columns: genericColumns,
  },
  {
    label: "Marketing",
    columns: genericColumns,
  },
  {
    label: "Phong cách sống",
    columns: genericColumns,
  },
  {
    label: "Nhiếp ảnh & Video",
    columns: genericColumns,
  },
  {
    label: "Sức khỏe & Thể dục",
    columns: genericColumns,
  },
  {
    label: "Âm nhạc",
    columns: genericColumns,
  },
  {
    label: "Giảng dạy & Học thuật",
    columns: genericColumns,
  },
];

