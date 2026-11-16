# DOL Render

Kumpulan template dokumen berbasis **HTML & CSS** siap cetak (_print-ready_) dan _helper script_ JavaScript untuk menghasilkan surat serta dokumen pengadaan resmi secara otomatis. Proyek ini bekerja berdampingan dengan layanan **[DOL Numbering Service](https://github.com/anggapriyadi/dol-numbering.git)** untuk pengisian nomor dokumen dan diorkestrasi melalui workflow otomatisasi **n8n**.

---

## 🚀 Fitur Utama

- **Multi-Template Dokumen**: Menyediakan format standar untuk **SPPH**, **PO**, **PKS**, dan **SPK**.
- **Print-Ready Layout (A4)**: Ukuran kertas, margin, tipografi, dan pemisah halaman (_page break_) diatur menggunakan CSS `@page` agar rapi saat dikonversi menjadi PDF.
- **Dynamic Table Generator (SPPH)**: Dilengkapi script JavaScript untuk node **Code** di n8n guna memecah daftar item barang menjadi baris tabel HTML (`<tr>`) secara otomatis.
- **Dynamic Placeholders**: Menggunakan variabel template (seperti `{{nomor_dokumen}}`) yang mudah disuntikkan oleh node **n8n**.
- **Data Anonim & Aman**: Menggunakan identitas perusahaan dan pejabat fiktif sebagai _default_ agar aman dipublikasikan di repositori GitHub.

---

## 📂 Struktur Proyek

```text
dol-render/
├── templates/
│   ├── template_spph.html               # Template Surat Permintaan Penawaran Harga (SPPH)
│   ├── template_po.html                 # Template Purchase Order (PO)
│   ├── template_spk.html                # Template Surat Perintah Kerja (SPK)
│   └── template_pks.html                # Template Perjanjian Kerja Sama (PKS) (On-Going)
├── scripts/
│   └── boq_items_table.js   # Script node Code n8n untuk generate baris tabel barang SPPH
└── README.md                   # Dokumentasi proyek
```

---

## 📋 Daftar Variabel Template (Placeholders)

Setiap template HTML menerima variabel dinamis yang dipasok dari database, script _helper_, dan respons API **DOL Numbering Service**.

| Variabel              | Sumber Data                    | Keterangan                                                  | Contoh Nilai                        |
| :-------------------- | :----------------------------- | :---------------------------------------------------------- | :---------------------------------- |
| `{{nomor_dokumen}}`   | API `dol-numbering`            | Nomor surat resmi yang digenerate                           | `001/22/BIS-04/BUT/2026`            |
| `{{doc_type}}`        | API `dol-numbering`            | Jenis dokumen (`SPPH`, `PO`, `PKS`, `SPK`)                  | `SPPH`                              |
| `{{tanggal_surat}}`   | Workflow `n8n`                 | Tanggal penerbitan dokumen                                  | `16 November 2026`                  |
| `{{nama_pekerjaan}}`  | Database / CRM                 | Judul atau deskripsi pekerjaan                              | `Pengadaan Server Utama`            |
| `{{vendor_code}}`     | Database / CRM                 | Kode unik vendor tujuan                                     | `VND-001`                           |
| `{{nama_vendor}}`     | Database / CRM                 | Nama perusahaan mitra/vendor                                | `PT Mitra Teknologi Nusantara`      |
| `{{alamat_vendor}}`   | Database / CRM                 | Alamat lengkap vendor                                       | `Jl. Gatot Subroto No. 45, Jakarta` |
| `{{html_table_rows}}` | Script `generate-spph-rows.js` | Baris tabel HTML (`<tr>...</tr>`) khusus daftar barang SPPH | `<tr><td>1</td>...</tr>`            |
| `{{company_name}}`    | Konfigurasi `n8n`              | Nama perusahaan penerbit _(gunakan dummy di repo)_          | `PT Contoh Nusantara Sejahtera`     |
| `{{manager_name}}`    | Konfigurasi `n8n`              | Nama pejabat penandatangan _(gunakan dummy di repo)_        | `Budi Santoso, S.T.`                |
| `{{manager_title}}`   | Konfigurasi `n8n`              | Jabatan pejabat penandatangan                               | `Procurement Manager`               |

---

## 🧩 Helper Script n8n (Tabel Barang SPPH)

Untuk dokumen **SPPH** yang memiliki daftar item barang lebih dari satu (dipisahkan dengan tanda koma), gunakan script `scripts/boq_items_table.js` pada node **Code** di n8n sebelum proses _render_ HTML.

### Input yang Dibutuhkan (`$input.first().json.fields`)

- `field_deskripsi_barang`: Daftar nama/spesifikasi barang dipisahkan koma (contoh: `"Server Rack, Kabel LAN, Switch 24 Port"`).
- `field_quantity`: Daftar jumlah barang dipisahkan koma (contoh: `"2, 10, 1"`).
- `field_satuan`: Daftar satuan barang dipisahkan koma (contoh: `"Unit, Roll, Unit"`).

_(Catatan: Pastikan input deskripsi barang tidak mengandung tanda koma di dalam satu nama item agar pemisahan baris tetap akurat)._

### Output yang Dihasilkan

Script akan menghasilkan objek JSON dengan properti `html_table_rows` berisi rangkaian tag `<tr>...</tr>` yang siap disuntikkan ke dalam elemen `<tbody>{{html_table_rows}}</tbody>` pada file `templates/spph.html`.

---

## 🔄 Alur Kerja & Integrasi dengan n8n

Template dan script di repositori ini dirancang untuk digunakan dalam alur otomatisasi berikut:

1. **Trigger & Ambil Data**: Workflow **n8n** menerima pemicu (_trigger_) dari form atau CRM beserta detail pekerjaan, vendor, dan daftar barang.
2. **Generate Nomor Dokumen**: Node **HTTP Request** memanggil endpoint `POST /generate-number` pada service **[DOL Numbering Service](https://github.com)** untuk mendapatkan `nomor_dokumen`.
3. **Generate Baris Tabel (Khusus SPPH)**: Node **Code** menjalankan `boq_items_table.js` untuk mengubah string daftar barang menjadi `html_table_rows`.
4. **Render HTML**: Node **HTML** atau **Code** di n8n memuat template dari folder `templates/` dan mengganti seluruh variabel `{{...}}` dengan data aktual.
5. **Konversi ke PDF**: Hasil HTML yang sudah terisi dikirim ke layanan konversi PDF (seperti **Gotenberg**, **Puppeteer**, atau **PDFShift**) untuk menghasilkan file PDF siap kirim.

---

## 🛡️ Catatan Keamanan & Privasi

- **Tidak Memerlukan `.env`**: Karena repositori ini hanya berisi template HTML statis dan script logika murni, file `.env` tidak diperlukan.
- **Data Anonim di Repositori**: Seluruh nama perusahaan, kop surat, nama manajer, dan tanda tangan pada file HTML di repositori ini menggunakan data fiktif (_placeholder_).
- **Pengisian Data Asli**: Masukkan nama perusahaan, alamat kantor, nama manajer, dan gambar tanda tangan asli secara lokal hanya di dalam workflow **n8n** saat runtime.
