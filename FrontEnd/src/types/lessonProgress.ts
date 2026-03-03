export interface LessonProgress {
  progressId?: number;
  enrollmentId: number;
  lessonId: number;
  isCompleted: boolean;
  completedAt?: string;
  timeSpentSeconds?: number;
  lastPositionSeconds?: number;
}

