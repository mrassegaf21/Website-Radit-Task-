
import "./style.css";

import type { TaskFormData, Priority } from "./types";

import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  setTasks,
} from "./task";

import {
  saveTasks,
  loadTasks,
} from "./storage";

// Konfigurasi aplikasi dari .env
const APP_NAME = import.meta.env.VITE_APP_NAME || "RADIT TASK DASHBOARD";
const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

// Elemen utama
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Elemen aplikasi tidak ditemukan!");
}

// Memuat data dari Local Storage
setTasks(loadTasks());

let currentFilter: "Semua" | "Belum Selesai" | "Selesai" = "Semua";
let editingTaskId: string | null = null;
let searchQuery = "";

// Format tanggal
function formatDate(date: string): string {
  if (!date) return "-";

  return new Date(date + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Menghindari HTML injection dari input pengguna
function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

// Menyimpan perubahan tugas
function persistTasks(): void {
  saveTasks(getTasks());
}

// Menghitung statistik
function renderStats(): string {
  const tasks = getTasks();

  const total = tasks.length;
  const completed = tasks.filter(
    (task) => task.status === "Selesai"
  ).length;
  const pending = total - completed;

  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  return `
    <section class="stats-grid">
      <article class="stat-card">
        <div class="stat-icon burgundy">▤</div>
        <div>
          <p>Total Tugas</p>
          <h2>${total}</h2>
          <span>Seluruh tugas kuliah</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon orange">◷</div>
        <div>
          <p>Belum Selesai</p>
          <h2>${pending}</h2>
          <span>Perlu dikerjakan</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon green">✓</div>
        <div>
          <p>Selesai</p>
          <h2>${completed}</h2>
          <span>Berhasil diselesaikan</span>
        </div>
      </article>

      <article class="stat-card progress-card">
        <div class="stat-icon purple">%</div>
        <div>
          <p>Progres Tugas</p>
          <h2>${percentage}%</h2>
          <span>Penyelesaian tugas</span>
        </div>
      </article>
    </section>
  `;
}

// Menampilkan daftar tugas
function renderTasks(): string {
  const tasks = getTasks();
  const query = searchQuery.trim().toLowerCase();

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      currentFilter === "Semua" || task.status === currentFilter;

    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.subject.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  if (filteredTasks.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">▤</div>
        <h3>${query ? "Tugas tidak ditemukan" : "Belum ada tugas"}</h3>
        <p>
          ${
            query
              ? "Coba gunakan kata kunci pencarian yang berbeda."
              : "Tambahkan tugas kuliah pertamamu untuk mulai mengelola aktivitas akademik."
          }
        </p>
        ${
          query
            ? ""
            : `<button class="btn-primary" id="empty-add-btn">
                + Tambah Tugas
              </button>`
        }
      </div>
    `;
  }

  return `
    <div class="task-list">
      ${filteredTasks.map((task) => `
        <article class="task-item ${task.status === "Selesai" ? "completed-task" : ""}">
          <div class="task-check">
            <button
              class="check-btn ${task.status === "Selesai" ? "checked" : ""}"
              data-action="toggle"
              data-id="${task.id}"
              aria-label="Ubah status tugas"
            >${task.status === "Selesai" ? "✓" : ""}</button>
          </div>

          <div class="task-content">
            <h3>${escapeHTML(task.title)}</h3>
            <p>${escapeHTML(task.description || "Tidak ada deskripsi")}</p>

            <div class="task-meta">
              <span class="subject-tag">${escapeHTML(task.subject)}</span>
              <span>◷ ${formatDate(task.deadline)}</span>
            </div>
          </div>

          <div class="task-side">
            <span class="priority-tag priority-${task.priority.toLowerCase()}">
              ${task.priority}
            </span>

            <span class="status-tag ${task.status === "Selesai" ? "status-done" : "status-pending"}">
              ${task.status}
            </span>

            <div class="task-actions">
              <button data-action="edit" data-id="${task.id}" aria-label="Edit tugas">✎</button>
              <button data-action="delete" data-id="${task.id}" aria-label="Hapus tugas">⌫</button>
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

// Form tambah dan edit tugas
function renderModal(): string {
  if (!editingTaskId) return "";

  const task = getTasks().find(
    (item) => item.id === editingTaskId
  );

  const title = task ? task.title : "";
  const description = task ? task.description : "";
  const subject = task ? task.subject : "";
  const deadline = task ? task.deadline : "";
  const priority = task ? task.priority : "Sedang";

  return `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <div>
            <h2>${task ? "Edit Tugas" : "Tambah Tugas Baru"}</h2>
            <p>Lengkapi informasi tugas kuliahmu.</p>
          </div>
          <button class="modal-close" id="close-modal">×</button>
        </div>

        <form id="task-form">
          <label>Nama Tugas *</label>
          <input
            name="title"
            type="text"
            placeholder="Contoh: Tugas Pemrograman Web"
            value="${escapeHTML(title)}"
            required
            maxlength="100"
          />

          <label>Mata Kuliah *</label>
          <input
            name="subject"
            type="text"
            placeholder="Contoh: Pengembangan Aplikasi Web"
            value="${escapeHTML(subject)}"
            required
            maxlength="80"
          />

          <label>Deskripsi</label>
          <textarea
            name="description"
            placeholder="Tambahkan detail tugas..."
            rows="3"
            maxlength="500"
          >${escapeHTML(description)}</textarea>

          <label>Deadline *</label>
          <input
            name="deadline"
            type="date"
            value="${escapeHTML(deadline)}"
            required
          />

          <label>Prioritas</label>
          <select name="priority">
            <option value="Rendah" ${priority === "Rendah" ? "selected" : ""}>Rendah</option>
            <option value="Sedang" ${priority === "Sedang" ? "selected" : ""}>Sedang</option>
            <option value="Tinggi" ${priority === "Tinggi" ? "selected" : ""}>Tinggi</option>
          </select>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" id="cancel-modal">
              Batal
            </button>
            <button type="submit" class="btn-primary">
              ${task ? "Simpan Perubahan" : "Simpan Tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Filter tugas
function renderFilters(): string {
  const filters = ["Semua", "Belum Selesai", "Selesai"];

  return `
    <div class="filter-group">
      ${filters.map((filter) => `
        <button
          class="filter-btn ${currentFilter === filter ? "active" : ""}"
          data-filter="${filter}"
        >${filter}</button>
      `).join("")}
    </div>
  `;
}

// Render seluruh aplikasi
function renderApp(): void {
  app!.innerHTML = `
    <div class="app-layout">

      <aside class="sidebar">
        <div class="brand">
          <div class="brand-logo">R</div>
          <div>
            <h2>RADIT TASK</h2>
            <span>Academic Manager</span>
          </div>
        </div>

        <div class="sidebar-label">MENU UTAMA</div>

        <nav class="sidebar-nav">
          <a href="#" class="nav-item active">
            <span>▦</span> Dashboard
          </a>
          <a href="#tasks-section" class="nav-item">
            <span>☷</span> Daftar Tugas
          </a>
        </nav>

        <div class="sidebar-bottom">
          <div class="profile-card">
            <div class="profile-avatar">RA</div>
            <div>
              <strong>M. Radit Assegaf</strong>
              <span>Mahasiswa Informatika</span>
            </div>
          </div>
          <p>Version ${APP_VERSION}</p>
        </div>
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div>
            <span class="breadcrumb">Workspace / Dashboard</span>
            <h1>Dashboard</h1>
          </div>

          <div class="topbar-right">
            <span class="date-label">${new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            })}</span>
            <div class="top-avatar">RA</div>
          </div>
        </header>

        <section class="welcome-section">
          <div>
            <span class="welcome-label">ACADEMIC WORKSPACE</span>
            <h2>Halo, Radit! 👋</h2>
            <p>Atur tugas kuliahmu dan selesaikan satu per satu.</p>
          </div>

          <button class="btn-primary" id="add-task-btn">
            + Tambah Tugas
          </button>
        </section>

        ${renderStats()}

        <section class="tasks-section" id="tasks-section">
          <div class="section-heading">
            <div>
              <h2>Daftar Tugas</h2>
              <p>Pantau dan kelola semua tugas kuliahmu.</p>
            </div>
            ${renderFilters()}
          </div>

          <div class="search-container">
            <input
              type="text"
              id="task-search"
              placeholder="Cari nama tugas atau mata kuliah..."
              value="${escapeHTML(searchQuery)}"
            />
          </div>

          ${renderTasks()}
        </section>

        <footer class="footer">
          <p>© ${new Date().getFullYear()} ${APP_NAME}. Built for better productivity.</p>
          <span>Academic Task Manager</span>
        </footer>
      </main>

    </div>

    ${renderModal()}
  `;

  attachEvents();
}

// Menghubungkan event tombol
function attachEvents(): void {
  document.getElementById("add-task-btn")?.addEventListener("click", () => {
    editingTaskId = "new";
    renderApp();
  });

  document.getElementById("empty-add-btn")?.addEventListener("click", () => {
    editingTaskId = "new";
    renderApp();
  });

  document.getElementById("close-modal")?.addEventListener("click", closeModal);
  document.getElementById("cancel-modal")?.addEventListener("click", closeModal);

  document.getElementById("modal-overlay")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeModal();
  });

  // Event pencarian tugas
  document.getElementById("task-search")?.addEventListener("input", (event) => {
    const input = event.currentTarget as HTMLInputElement;

    searchQuery = input.value;

    const cursorPosition = input.selectionStart ?? searchQuery.length;

    renderApp();

    const newSearchInput = document.getElementById(
      "task-search"
    ) as HTMLInputElement | null;

    if (newSearchInput) {
      newSearchInput.focus();
      newSearchInput.setSelectionRange(cursorPosition, cursorPosition);
    }
  });

  // Event filter tugas
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter as typeof currentFilter;
      renderApp();
    });
  });

  // Event aksi tugas
  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const action = button.dataset.action;

      if (!id) return;

      if (action === "toggle") {
        toggleTaskStatus(id);
        persistTasks();
        renderApp();
      }

      if (action === "delete") {
        const confirmed = confirm("Yakin ingin menghapus tugas ini?");

        if (confirmed) {
          deleteTask(id);
          persistTasks();
          renderApp();
        }
      }

      if (action === "edit") {
        editingTaskId = id;
        renderApp();
      }
    });
  });

  // Event form tambah dan edit tugas
  document.getElementById("task-form")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const data: TaskFormData = {
      title: String(formData.get("title") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      deadline: String(formData.get("deadline") || ""),
      priority: String(formData.get("priority") || "Sedang") as Priority,
    };

    if (!data.title || !data.subject || !data.deadline) {
      alert("Mohon lengkapi informasi wajib!");
      return;
    }

    if (editingTaskId === "new") {
      addTask(data);
    } else if (editingTaskId) {
      updateTask(editingTaskId, data);
    }

    persistTasks();
    closeModal();
  });
}

// Menutup modal
function closeModal(): void {
  editingTaskId = null;
  renderApp();
}

// Jalankan aplikasi
renderApp();
