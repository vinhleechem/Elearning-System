export interface PurchasedCourse {
  id: number;
  title: string;
  instructor: string;
  image: string;
  progress: number; // 0-100
  totalLectures: number;
  completedLectures: number;
  totalDuration: number; // in hours
  lastAccessed?: string;
  rating?: number;
  slug: string;
}

