
/* =====================================
   RADIT TASK - TYPE DEFINITIONS
===================================== */

// Primitive Types
export type TaskId = string;
export type TaskTitle = string;
export type TaskDescription = string;
export type SubjectName = string;
export type TaskDate = string;

export type TaskStatus = "Belum Selesai" | "Selesai";

// Union Type
export type Priority = "Rendah" | "Sedang" | "Tinggi";

// Interface
export interface Task {
  id: TaskId;
  title: TaskTitle;
  description: TaskDescription;
  subject: SubjectName;
  deadline: TaskDate;
  status: TaskStatus;
  priority: Priority;
  createdAt: number;
}

// Interface untuk konfigurasi aplikasi
export interface AppConfig {
  appName: string;
  appVersion: string;
  appDescription: string;
}

// Generic Interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Form input tugas
export interface TaskFormData {
  title: string;
  description: string;
  subject: string;
  deadline: string;
  priority: Priority;
}
