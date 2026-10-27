# React + TypeScript + Vite

## Authentication API

Set `VITE_API_URL` to the backend API base URL. Login and logout use `login`
and `logout` relative to that URL by default. If the backend uses different
routes, set `VITE_AUTH_LOGIN_ENDPOINT` and `VITE_AUTH_LOGOUT_ENDPOINT` in `.env`;
each value can be a relative path or a complete URL. The login response should
include the account role (`mahasiswa`, `dosen`, or `admin`/`staff`) and may include
a bearer token and user profile fields.

## Admin KRS API

The admin dashboard sends the Sanctum bearer token returned by login with KRS
and academic-management requests. `VITE_API_URL` should include the API prefix
(for example, `http://localhost:8000/api`).

The KRS setup screen uses these admin routes:

- `GET /admin/academic-data` to load departments, lecturers, and courses.
- `POST /admin/matkul` to create a course with `kode_matkul`, `nama_matkul`,
  `sks`, and `jurusan_id`. The admin form reloads `/admin/academic-data` after
  successful creation to refresh the course lists.
- `GET /admin/krs/periods` and `POST /admin/krs/periods` to list and create
  academic periods. Period creation sends `academic_year_start`, `term`
  (`ganjil` or `genap`), `is_active`, and `registration_open`.
- `PATCH /admin/krs/periods/{id}` to open or close KRS registration by sending
  `{"registration_open": true}` or `{"registration_open": false}`.
- `GET /admin/krs/packages`, `POST /admin/krs/packages`, and
  `PUT /admin/krs/packages/{id}` to list, create, and replace department
  semester packages. Create/update sends `jurusan_id`, `semester` (1–8),
  `name`, and `matkul_ids`.
- `POST /admin/academic-classes` to create class offerings. The payload includes
  `tahun_ajaran` in `YYYY/YYYY` format and `term` (`ganjil` or `genap`) along
  with course, lecturer, class, and schedule fields.
- `PATCH /admin/academic-classes/{id}/offering` to assign or correct an
  existing class offering's `tahun_ajaran` and `term`.

The admin dashboard requires a valid admin-role bearer token for these routes.

## Student Academic Routes

The student sidebar uses the authenticated student's Sanctum bearer token for
these routes:

- `GET /krs/options` to load the student's required semester package and the
  class sections available for each required course.
- `GET /krs` to show the current KRS selection.
- `PUT /krs` to submit or replace the selection using
  `{"kelas_ids": [12, 18]}`. The frontend requires one selected class section
  for each course in the required package before submitting.
- `GET /tasks/{mahasiswaId}` to show assignments and deadlines. The login
  response must include `mahasiswa.id` or `mahasiswa_id` so the frontend can
  call this endpoint without a hard-coded student ID.
- `GET /schedules` to show the student's class schedule.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```


## 🚀 API Endpoints

**Base URL:** `https://student-academic-api-ydu4.onrender.com`

---

### 📖 Dokumentasi API Interactive
Dokumentasi Swagger/Scramble bawaan backend dapat diakses secara langsung melalui browser:
* **Interactive API Docs:** `GET /docs/api`
* **OpenAPI Spec (JSON):** `GET /docs/api.json`

---

### 🔐 Authentikasi & Akun (`/api`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `POST` | `/api/login` | Login pengguna (Mahasiswa/Dosen/Admin) |
| `POST` | `/api/logout` | Logout pengguna |
| `POST` | `/api/change-password` | Ubah kata sandi akun |
| `GET`  | `/api/user` | Mengambil data pengguna aktif |

---

### 🎓 Portal Mahasiswa (`/api`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET`  | `/api/mahasiswa/profile` | Lihat profil mahasiswa |
| `PUT`  | `/api/mahasiswa/profile` | Update profil mahasiswa |
| `GET`  | `/api/krs` | Lihat daftar KRS mahasiswa |
| `PUT`  | `/api/krs` | Simpan/Update pilihan KRS |
| `GET`  | `/api/krs/options` | Opsi mata kuliah KRS |
| `GET`  | `/api/tasks` | Daftar tugas mahasiswa |
| `GET`  | `/api/tasks/{mahasiswaId}` | Tugas spesifik mahasiswa |
| `GET`  | `/api/submissions` | Riwayat pengumpulan tugas |
| `POST` | `/api/submissions` | Mengirim/mengumpulkan tugas |

---

### 👨‍🏫 Portal Dosen (`/api/dosen`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET`  | `/api/dosen/departments` | Daftar jurusan diampu dosen |
| `GET`  | `/api/dosen/classes-by-jurusan/{jurusanId}` | Kelas berdasarkan jurusan |
| `GET`  | `/api/dosen/tasks` | Daftar tugas yang dibuat dosen |
| `GET`  | `/api/dosen/tasks/{taskId}/submissions` | Daftar pengumpulan tugas mahasiswa |
| `GET`  | `/api/dosen/absensi/kelas` | Daftar kelas untuk absensi |
| `GET`  | `/api/dosen/absensi/kelas/{kelasId}` | Peserta absensi kelas |
| `POST` | `/api/dosen/absensi/kelas/{kelasId}` | Simpan absensi kelas |
| `GET`  | `/api/dosen/absensi/kelas/{kelasId}/pertemuan` | Pertemuan absensi kelas |

---

### 🛡️ Admin Management (`/api/admin`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET`  | `/api/admin/academic-data` | Ringkasan data akademik |
| `POST` | `/api/admin/academic-classes` | Tambah kelas akademik baru |
| `PATCH`| `/api/admin/academic-classes/{classId}/offering` | Update penawaran kelas |
| `GET`  | `/api/admin/dosen` | Daftar seluruh dosen |
| `POST` | `/api/admin/dosen` | Tambah dosen baru |
| `GET`  | `/api/admin/dosen/{dosenId}` | Detail data dosen |
| `PUT`  | `/api/admin/dosen/{dosenId}` | Update data dosen |
| `DELETE`| `/api/admin/dosen/{dosenId}` | Hapus dosen |
| `GET`  | `/api/admin/jurusan` | Daftar jurusan/departemen |
| `POST` | `/api/admin/jurusan` | Tambah jurusan baru |
| `PUT`  | `/api/admin/jurusan/{id}` | Update jurusan |
| `DELETE`| `/api/admin/jurusan/{id}` | Hapus jurusan |
| `GET`  | `/api/admin/krs/packages` | Paket matkul KRS |
| `POST` | `/api/admin/krs/packages` | Buat paket KRS |
| `PUT`  | `/api/admin/krs/packages/{packageId}` | Update paket KRS |
| `GET`  | `/api/admin/krs/periods` | Periode KRS |
| `POST` | `/api/admin/krs/periods` | Tambah periode KRS |
| `PATCH`| `/api/admin/krs/periods/{periodId}` | Update periode KRS |
| `POST` | `/api/admin/matkul` | Tambah mata kuliah baru |
| `POST` | `/api/admin/users` | Tambah pengguna mahasiswa/staf baru |

---

### 📚 Kelas & Akademik Umum (`/api`)
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET`  | `/api/academic-classes` | Daftar seluruh kelas akademik |
| `GET`  | `/api/academic-classes/{id}` | Detail kelas akademik |
| `GET`  | `/api/academic-classes/by-jurusan/{jurusanId}` | Kelas per jurusan |
| `GET`  | `/api/academic-classes/lecturers/{matkulId}` | Dosen pengampu matkul |
| `GET`  | `/api/matkul` | Daftar mata kuliah |
| `GET`  | `/api/departments` | Daftar departemen |
| `GET`  | `/api/schedules` | Jadwal perkuliahan |
| `POST` | `/api/schedules` | Tambah jadwal perkuliahan |
| `PUT`  | `/api/schedules/{id}` | Update jadwal perkuliahan |
| `DELETE`| `/api/schedules/{id}` | Hapus jadwal perkuliahan |
| `GET`  | `/api/classes/participants` | Peserta kelas |
| `POST` | `/api/classes/participants` | Tambah peserta kelas |
| `DELETE`| `/api/classes/participants/{id}` | Hapus peserta kelas |