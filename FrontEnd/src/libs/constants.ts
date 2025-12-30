import type { MenuItemProps } from "../types/common/menu";

/* Header */
export const leftPages = ["Khám phá"];
export const rightPages = ["Udemy Business", "Giảng dạy trên Udemy"];

/* 
  FilterBar 
 */
export const relatedFilter: MenuItemProps[] = [
  { id: 0, label: "Liên quan nhất" },
  { id: 1, label: "Có xếp hạng cao nhất" },
  { id: 2, label: "Đánh giá nhiều nhất" },
  { id: 3, label: "Mới nhất" },
];
export const settingsFilter: MenuItemProps[] = [
  { id: 0, label: "Học tập" },
  { id: 1, label: "Giỏ hàng của tôi" },
  { id: 2, label: "Mong muốn" },
  { id: 3, label: "Bảng điều khiển của giáo viên" },
  { id: 4, label: "Giỏ hàng của tôi" },
  { id: 5, label: "Thông báo" },
  { id: 6, label: "Tin nhắn" },
  { id: 6, label: "Cài đặt tài khoản" },
];
/* 
  TAG_STYLE Courses
*/
export const TAGS_STYLE: Record<string, { bg: string; text: string }> = {
  "Bán chạy nhất": { bg: "#ecfdf5", text: "#0d9488" },
  "Mới nhất": { bg: "#bbe7d3", text: "#0F2F1F" },
  "Giảm giá": { bg: "#fee2e2", text: "#b91c1c" },
  Hot: { bg: "#fef3c7", text: "#b45309" },
  // Promotion tags
  BLACK_FRIDAY: { bg: "#1a1a1a", text: "#ffd700" },
  FLASH_SALE: { bg: "#ff4757", text: "#ffffff" },
  NEW_YEAR: { bg: "#e74c3c", text: "#ffffff" },
  SEASONAL: { bg: "#3498db", text: "#ffffff" },
  CLEARANCE: { bg: "#9b59b6", text: "#ffffff" },
  SPECIAL_EVENT: { bg: "#f39c12", text: "#ffffff" },
};

export const trendingData = [
  {
    title: "ChatGPT là một kỹ năng hàng đầu",
    items: [{ name: "Xem các khóa học về ChatGPT", students: 4989588 }],
    button: "Hiển thị tất cả các kỹ năng thịnh hành",
  },
  {
    title: "Phát triển/Lập trình",
    items: [
      { name: "Python", students: 49205255 },
      { name: "Phát triển web", students: 14282765 },
      { name: "Khoa học dữ liệu", students: 8092541 },
    ],
  },
  {
    title: "Phát triển/Lập trình",
    items: [
      { name: "Python", students: 49205255 },
      { name: "Phát triển web", students: 14282765 },
      { name: "Khoa học dữ liệu", students: 8092541 },
    ],
  },
  {
    title: "Phát triển/Lập trình",
    items: [
      { name: "Python", students: 49205255 },
      { name: "Phát triển web", students: 14282765 },
      { name: "Khoa học dữ liệu", students: 8092541 },
    ],
  },

  // ... thêm các cột khác
];

interface FooterLink {
  label: string;
  path: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: "Chứng chỉ theo Tổ chức phát hành",
    links: [
      { label: "Chứng chỉ Amazon Web Services (AWS)", path: "#" },
      { label: "Chứng chỉ Six Sigma", path: "#" },
      { label: "Chứng chỉ Microsoft", path: "#" },
      { label: "Chứng chỉ Cisco", path: "#" },
      { label: "Chứng chỉ Tableau", path: "#" },
      { label: "Xem tất cả chứng chỉ", path: "#" },
    ],
  },
  {
    title: "Phát triển web",
    links: [
      { label: "Phát triển web", path: "#" },
      { label: "JavaScript", path: "#" },
      { label: "React JS", path: "#" },
      { label: "Angular", path: "#" },
      { label: "Java", path: "#" },
    ],
  },
  {
    title: "Chứng chỉ CNTT",
    links: [
      { label: "Amazon AWS", path: "#" },
      { label: "AWS Certified Cloud Practitioner", path: "#" },
      { label: "AZ-900: Microsoft Azure Fundamentals", path: "#" },
      { label: "AWS Solutions Architect – Associate", path: "#" },
      { label: "Kubernetes", path: "#" },
    ],
  },
  {
    title: "Chứng chỉ CNTT1",
    links: [
      { label: "Amazon AWS", path: "#" },
      { label: "AWS Certified Cloud Practitioner", path: "#" },
      { label: "AZ-900: Microsoft Azure Fundamentals", path: "#" },
      { label: "AWS Solutions Architect – Associate", path: "#" },
      { label: "Kubernetes", path: "#" },
    ],
  },
  {
    title: "Chứng chỉ CNTT2",
    links: [
      { label: "Amazon AWS", path: "#" },
      { label: "AWS Certified Cloud Practitioner", path: "#" },
      { label: "AZ-900: Microsoft Azure Fundamentals", path: "#" },
      { label: "AWS Solutions Architect – Associate", path: "#" },
      { label: "Kubernetes", path: "#" },
    ],
  },
  {
    title: "Chứng chỉ CNTT3",
    links: [
      { label: "Amazon AWS", path: "#" },
      { label: "AWS Certified Cloud Practitioner", path: "#" },
      { label: "AZ-900: Microsoft Azure Fundamentals", path: "#" },
      { label: "AWS Solutions Architect – Associate", path: "#" },
      { label: "Kubernetes", path: "#" },
    ],
  },
  // 👉 Thêm các cột khác tương tự
];
