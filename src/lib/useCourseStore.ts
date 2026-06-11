import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LessonPayload {
  id: string;
  title: string;
  explanation: string;
  videoLink?: string;
  worksheetUrl?: string;
  pdf_url?: string;
  worksheetName?: string;
  quizzes?: any[];
  quiz?: any[];
}

export interface ModulePayload {
  id: string;
  title: string;
  description: string;
  duration: string;
  objectives: string[];
  lessons: LessonPayload[];
}

export interface CoursePayload {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  techStack: string[];
  weeks: ModulePayload[]; // UI calls it weeks or modules
  totalHours: number;
  weeklyAllocation: number;
  slackUrl: string;
  organizerUrl: string;
  status: 'draft' | 'published';
  createdAt: string;
}

interface CourseStoreState {
  courses: CoursePayload[];
  saveDraft: (courseData: Omit<CoursePayload, 'id' | 'status' | 'createdAt'> & { id?: string }) => void;
  publishCourse: (courseData: Omit<CoursePayload, 'id' | 'status' | 'createdAt'> & { id?: string }) => void;
  deleteCourse: (id: string) => void;
}

export const useCourseStore = create<CourseStoreState>()(
  persist(
    (set) => ({
      courses: [],
      
      saveDraft: (courseData) => set((state) => {
        const id = courseData.id || `course-${Date.now()}`;
        const newCourse: CoursePayload = {
          ...courseData,
          id,
          status: 'draft',
          createdAt: new Date().toISOString(),
        };
        const filtered = state.courses.filter(c => c.id !== id);
        return { courses: [...filtered, newCourse] };
      }),

      publishCourse: (courseData) => set((state) => {
        const id = courseData.id || `course-${Date.now()}`;
        const newCourse: CoursePayload = {
          ...courseData,
          id,
          status: 'published',
          createdAt: new Date().toISOString(),
        };
        const filtered = state.courses.filter(c => c.id !== id);
        return { courses: [...filtered, newCourse] };
      }),

      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter(c => c.id !== id)
      }))
    }),
    {
      name: 'mentozy_courses_state',
    }
  )
);
