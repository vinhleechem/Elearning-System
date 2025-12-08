export interface InstructorInfo {
  name: string;
  title?: string;
  avatarUrl?: string;
  bioHtml?: string;
  headline?: string;
  stats?: {
    rating: number;
    reviews: number;
    students: number;
    courses: number;
  };
}

export interface ReviewItem {
  id: string | number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface LectureItem {
  id: string;
  title: string;
  previewable?: boolean;
  duration?: string;
}

export interface SectionItem {
  id: string | number;
  title: string;
  lectures: LectureItem[];
}

export interface ReviewsSummary {
  average: number;
  count: number;
  distribution?: number[]; // counts for [5,4,3,2,1]
}

export interface CourseDetail {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  badges?: string[];
  categoryPath?: string[];
  rating: number;
  // number of reviews is represented by reviewsSummary.count
  students?: number;
  lastUpdated?: string;
  language?: string;
  captions?: string[];
  whatYouWillLearn: string[];
  sections: SectionItem[];
  requirements?: string[];
  descriptionHtml?: string;
  instructor: InstructorInfo;
  previewUrl?: string;
  price: number;
  oldPrice?: number | null;
  isPurchasable?: boolean;
  reviewsSummary: ReviewsSummary;
  reviews: ReviewItem[];
  related: Array<{
    id: string;
    slug: string;
    title: string;
    image: string;
    price: number;
    rating: number;
  }>;
}
