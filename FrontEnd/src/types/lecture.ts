export interface Lecture {
  id: number;
  title: string;
  duration: number; // in seconds
  isCompleted: boolean;
  videoUrl?: string;
  resources?: LectureResource[];
  description?: string;
}

export interface LectureResource {
  id: number;
  title: string;
  type: "video" | "pdf" | "file" | "link";
  url: string;
  size?: string;
}

export interface Section {
  id: number;
  title: string;
  lectures: Lecture[];
  totalDuration: number; // in seconds
  completedLectures: number;
}

export interface CourseLearning {
  id: number;
  title: string;
  instructor: string;
  rating: number;
  totalStudents: number;
  lastUpdated: string;
  sections: Section[];
  currentLectureId?: number;
}

