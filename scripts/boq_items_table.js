// Ambil data dari node sebelumnya
const data = $input.first().json.fields || {};

// Konversi ke String secara aman sebelum di-split
const rawDeskripsi = String(data.field_deskripsi_barang || "");
const rawQty = String(data.field_quantity || "");
const rawSatuan = String(data.field_satuan || "");

// Pecah berdasarkan koma
const deskripsiArr = rawDeskripsi ? rawDeskripsi.split(",") : [];
const qtyArr = rawQty ? rawQty.split(",") : [];
const satuanArr = rawSatuan ? rawSatuan.split(",") : [];

let rowsHTML = "";

// Looping untuk membuat baris tabel HTML
deskripsiArr.forEach((deskripsi, index) => {
  rowsHTML += `
    <tr>
      <td class="text-center">${index + 1}</td>
      <td class="text-left">${deskripsi.trim()}</td>
      <td class="text-center">${(qtyArr[index] || "-").trim()}</td>
      <td class="text-center">${(satuanArr[index] || "-").trim()}</td>
    </tr>
  `;
});

return [{ json: { html_table_rows: rowsHTML } }];
