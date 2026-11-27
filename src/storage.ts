
import type { Task, ApiResponse } from "./types";

const STORAGE_KEY = "radit-task-data";

// Generic Function
export function createResponse<T>(
  success: boolean,
  message: string,
  data: T
): ApiResponse<T> {
  return {
    success,
    message,
    data,
  };
}

// Menyimpan tugas ke Local Storage
export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );
}

// Mengambil tugas dari Local Storage
export function loadTasks(): Task[] {
  const storedData = localStorage.getItem(STORAGE_KEY);

  if (!storedData) return [];

  try {
    const parsedData: unknown = JSON.parse(storedData);

    if (!Array.isArray(parsedData)) return [];

    return parsedData as Task[];
  } catch (error) {
    console.error("Gagal membaca data tugas:", error);
    return [];
  }
}

// Menghapus seluruh data tugas
export function clearTasks(): void {
  localStorage.removeItem(STORAGE_KEY);
}
