
import type { Task, TaskFormData, TaskStatus } from "./types";

// Menyimpan daftar tugas
let tasks: Task[] = [];

// Mengambil seluruh tugas
export function getTasks(): Task[] {
  return tasks;
}

// Menambahkan tugas baru
export function addTask(formData: TaskFormData): Task {
  const newTask: Task = {
    id: crypto.randomUUID(),
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    deadline: formData.deadline,
    priority: formData.priority,
    status: "Belum Selesai",
    createdAt: Date.now(),
  };

  tasks.push(newTask);
  return newTask;
}

// Mengedit tugas
export function updateTask(
  id: string,
  formData: TaskFormData
): boolean {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) return false;

  tasks[index] = {
    ...tasks[index],
    ...formData,
  };

  return true;
}

// Menghapus tugas
export function deleteTask(id: string): boolean {
  const initialLength = tasks.length;

  tasks = tasks.filter((task) => task.id !== id);

  return tasks.length < initialLength;
}

// Mengubah status tugas
export function toggleTaskStatus(id: string): boolean {
  const task = tasks.find((item) => item.id === id);

  if (!task) return false;

  const newStatus: TaskStatus =
    task.status === "Selesai"
      ? "Belum Selesai"
      : "Selesai";

  task.status = newStatus;

  return true;
}

// Mengganti seluruh daftar tugas
export function setTasks(newTasks: Task[]): void {
  tasks = newTasks;
}
