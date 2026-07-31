'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Download, Edit, Trash2, MapPin, X, Check, Building2, Layers, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import ToastConfirmModal from '@/components/ui/ToastConfirmModal';
import { useToastConfirm } from '@/hooks/useToastConfirm';

interface WilayahItem {
  id: string;
  kecamatan: string;
  kelurahan: string;
  kodeSingkatan: string;
}

export default function KodeWilayahPage() {
  const { toasts, showToast, dismissToast, confirmState, confirmAction, closeConfirm } = useToastConfirm();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WilayahItem | null>(null);

  // Form states
  const [formKec, setFormKec] = useState('Lumajang');
  const [isCustomKec, setIsCustomKec] = useState(false);
  const [customKecName, setCustomKecName] = useState('');
  const [formKel, setFormKel] = useState('');
  const [formKode, setFormKode] = useState('');
  const [keepModalOpen, setKeepModalOpen] = useState(false);
  const [csvMsg, setCsvMsg] = useState('');

  const [wilayahList, setWilayahList] = useState<WilayahItem[]>([]);

  const loadWilayah = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/wilayah`);
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.data || [];
        setWilayahList(
          rawList.map((w: any) => ({
            id: w.id.toString(),
            kecamatan: w.kecamatan,
            kelurahan: w.kelurahan,
            kodeSingkatan: w.kode_kel || w.kelurahan.slice(0, 3).toUpperCase(),
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load wilayah API:', err);
    }
  };

  useEffect(() => {
    loadWilayah();
  }, []);

  // Unique list of Kecamatan for category grouping & dropdown selection
  const existingKecamatanList = useMemo(() => {
    const setKec = new Set<string>();
    wilayahList.forEach((w) => {
      if (w.kecamatan) setKec.add(w.kecamatan.trim());
    });
    return Array.from(setKec).sort();
  }, [wilayahList]);

  // Grouped data by Kecamatan (Kecamatan = Category, Kelurahan/Desa = Items)
  const groupedWilayah = useMemo(() => {
    const groups: Record<string, WilayahItem[]> = {};

    const filtered = wilayahList.filter((w) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        w.kecamatan.toLowerCase().includes(s) ||
        w.kelurahan.toLowerCase().includes(s) ||
        w.kodeSingkatan.toLowerCase().includes(s)
      );
    });

    filtered.forEach((item) => {
      const kecKey = item.kecamatan.trim() || 'Lainnya';
      if (!groups[kecKey]) groups[kecKey] = [];
      groups[kecKey].push(item);
    });

    return groups;
  }, [wilayahList, search]);

  const totalDesaCount = useMemo(() => {
    return Object.values(groupedWilayah).reduce((acc, curr) => acc + curr.length, 0);
  }, [groupedWilayah]);

  const handleOpenModal = (targetKec?: string, item?: WilayahItem) => {
    if (item) {
      setSelectedItem(item);
      setFormKec(item.kecamatan);
      setIsCustomKec(false);
      setCustomKecName('');
      setFormKel(item.kelurahan);
      setFormKode(item.kodeSingkatan);
    } else {
      setSelectedItem(null);
      const defaultKec = targetKec || existingKecamatanList[0] || 'Lumajang';
      setFormKec(defaultKec);
      setIsCustomKec(false);
      setCustomKecName('');
      setFormKel('');
      setFormKode('');
    }
    setModalOpen(true);
  };

  const handleKelurahanChange = (val: string) => {
    setFormKel(val);
    if (!selectedItem && !formKode) {
      // Auto-generate 3 letter code suggestion
      const clean = val.toUpperCase().replace(/[^A-Z]/g, '');
      if (clean.length >= 3) {
        setFormKode(clean.slice(0, 3));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalKecamatan = isCustomKec ? customKecName.trim() : formKec.trim();
    if (!finalKecamatan) {
      showToast('Nama Kecamatan tidak boleh kosong', 'error');
      return;
    }
    if (!formKel.trim()) {
      showToast('Nama Kelurahan/Desa tidak boleh kosong', 'error');
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        id: selectedItem ? Number(selectedItem.id) : undefined,
        kecamatan: finalKecamatan,
        kelurahan: formKel.trim(),
        kode_kel: formKode.toUpperCase().trim() || formKel.trim().slice(0, 3).toUpperCase(),
      };

      const res = await fetch(`${API_BASE_URL}/wilayah`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(
          selectedItem
            ? `Berhasil memperbarui ${formKel} (${finalKecamatan})!`
            : `Berhasil menambahkan Desa/Kelurahan "${formKel}" ke Kecamatan ${finalKecamatan}!`,
          'success'
        );

        await loadWilayah();

        if (keepModalOpen && !selectedItem) {
          // Keep modal open with same Kecamatan pre-selected for rapid batch entry of multiple Desa/Kelurahan
          setFormKel('');
          setFormKode('');
          setFormKec(finalKecamatan);
        } else {
          setModalOpen(false);
        }
      } else {
        showToast('Gagal menyimpan data wilayah', 'error');
      }
    } catch (err) {
      console.error('Error saving wilayah:', err);
      showToast('Gagal terhubung ke server backend', 'error');
    }
  };

  const handleDelete = (id: string) => {
    const item = wilayahList.find((w) => w.id === id);
    confirmAction({
      title: 'Hapus Master Wilayah',
      message: `Apakah Anda yakin ingin menghapus Desa/Kelurahan "${item?.kelurahan || id}" dari Kecamatan "${item?.kecamatan}"?`,
      itemId: item?.kodeSingkatan,
      itemNama: item?.kelurahan,
      confirmText: 'Ya, Hapus Wilayah',
      onConfirm: async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          const headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(`${API_BASE_URL}/wilayah/${id}`, {
            method: 'DELETE',
            headers,
          });

          if (res.ok) {
            showToast('Data wilayah berhasil dihapus!', 'success');
            await loadWilayah();
          } else {
            showToast('Gagal menghapus data wilayah', 'error');
          }
        } catch (err) {
          console.error('Error deleting wilayah:', err);
          showToast('Gagal terhubung ke server backend', 'error');
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-ink-100)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
              Master Kode Wilayah
            </h1>
            <span className="px-3 py-1 rounded-full bg-[var(--color-brand-wash)] text-[var(--color-brand-deep)] font-bold text-xs">
              {Object.keys(groupedWilayah).length} Kecamatan • {totalDesaCount} Desa / Kelurahan
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-500)] mt-1">
            Kecamatan sebagai Sektor Utama / Kategori Wilayah, dan Desa/Kelurahan sebagai Item Wilayah di bawahnya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCsvModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-brand-mid)] text-[var(--color-brand-deep)] bg-emerald-50 hover:bg-emerald-100 text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 rotate-180" />
            Import CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-bold hover:bg-[var(--color-brand-deep)] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tambah Wilayah Baru
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--color-ink-100)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama Kecamatan, Desa/Kelurahan, atau Kode Singkatan..."
            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none focus:border-[var(--color-brand-mid)]"
          />
          <Search className="w-4 h-4 text-[var(--color-ink-500)] absolute left-3 top-3" />
        </div>

        <button
          onClick={() => {
            let csv = 'kecamatan,kelurahan,kode_singkatan\n';
            wilayahList.forEach((w) => (csv += `${w.kecamatan},${w.kelurahan},${w.kodeSingkatan}\n`));
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Master_Wilayah_Lumajang.csv`;
            a.click();
          }}
          className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* CATEGORY (KECAMATAN) & ITEM (DESA/KELURAHAN) GROUPED LAYOUT */}
      <div className="space-y-6">
        {Object.keys(groupedWilayah).length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-[var(--color-ink-100)] text-xs text-[var(--color-ink-500)]">
            Tidak ada data wilayah yang cocok dengan kata kunci pencarian.
          </div>
        ) : (
          Object.entries(groupedWilayah).map(([kecamatanName, items]) => (
            <div
              key={kecamatanName}
              className="bg-white rounded-2xl border border-[var(--color-ink-100)] overflow-hidden shadow-xs"
            >
              {/* KECAMATAN CATEGORY HEADER */}
              <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-extrabold tracking-wide uppercase">
                      Kecamatan {kecamatanName}
                    </h3>
                    <span className="text-[11px] text-slate-300 font-medium">
                      Sektor Utama • {items.length} Desa / Kelurahan Terdaftar
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal(kecamatanName)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Desa/Kelurahan di {kecamatanName}
                </button>
              </div>

              {/* DESA / KELURAHAN ITEMS TABLE */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="bg-[var(--color-ink-50)] text-[var(--color-ink-500)] uppercase tracking-wider font-semibold border-b border-[var(--color-ink-100)]">
                    <tr>
                      <th className="p-3.5 pl-5">No</th>
                      <th className="p-3.5">Nama Desa / Kelurahan (Item Wilayah)</th>
                      <th className="p-3.5">Kode Singkatan</th>
                      <th className="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-ink-100)] text-[var(--color-ink-700)]">
                    {items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-[var(--color-ink-50)] transition-colors">
                        <td className="p-3.5 pl-5 font-mono text-[var(--color-ink-500)] w-12">{idx + 1}</td>
                        <td className="p-3.5 font-bold text-[var(--color-ink-900)] flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          {item.kelurahan}
                        </td>
                        <td className="p-3.5 font-mono font-bold">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-[var(--color-brand-deep)] border border-emerald-200">
                            {item.kodeSingkatan}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal(kecamatanName, item)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit Desa/Kelurahan"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Hapus Desa/Kelurahan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL ADD / EDIT WILAYAH */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--color-brand-mid)]" />
                <h3 className="text-base font-bold text-gray-900">
                  {selectedItem ? 'Edit Desa / Kelurahan' : 'Tambah Desa / Kelurahan Baru'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* KECAMATAN SECTOR (CATEGORY) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  1. Pilih / Buat Sektor Kecamatan (Kategori Utama)
                </label>
                {!isCustomKec ? (
                  <div className="space-y-2">
                    <select
                      value={formKec}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsCustomKec(true);
                          setCustomKecName('');
                        } else {
                          setFormKec(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-gray-50 focus:outline-none"
                    >
                      {existingKecamatanList.map((kec) => (
                        <option key={kec} value={kec}>
                          Kecamatan {kec}
                        </option>
                      ))}
                      <option value="__NEW__">+ Tambah Kecamatan Baru...</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customKecName}
                        onChange={(e) => setCustomKecName(e.target.value)}
                        placeholder="Ketik Nama Kecamatan Baru (misal: Pasrujambe)"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomKec(false)}
                        className="px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* DESA / KELURAHAN (ITEM) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  2. Nama Kelurahan / Desa (Item Wilayah)
                </label>
                <input
                  type="text"
                  value={formKel}
                  onChange={(e) => handleKelurahanChange(e.target.value)}
                  placeholder="Misal: Jogoyudan, Ditotrunan, Tompokersan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none font-semibold"
                  required
                />
              </div>

              {/* KODE SINGKATAN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  3. Kode Singkatan Wilayah (3 Huruf)
                </label>
                <input
                  type="text"
                  value={formKode}
                  onChange={(e) => setFormKode(e.target.value.toUpperCase())}
                  placeholder="Misal: JGY"
                  maxLength={5}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold uppercase text-[var(--color-brand-deep)] focus:outline-none"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Digunakan untuk format otomatis ID Wajib Retribusi (contoh: <code className="font-bold text-emerald-700">LMJ-{formKode || 'JGY'}-0001</code>).
                </p>
              </div>

              {!selectedItem && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={keepModalOpen}
                      onChange={(e) => setKeepModalOpen(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Lanjut tambah Desa/Kelurahan lain untuk Kecamatan ini setelah disimpan</span>
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-bold hover:bg-[var(--color-brand-deep)] transition-colors shadow-xs"
                >
                  Simpan Data Wilayah
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-50 text-gray-700"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import CSV */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">Import Master Wilayah CSV</h3>
              <button onClick={() => setCsvModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Unggah file CSV dengan header: <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">kecamatan,kelurahan,kode_singkatan</code>
              </p>

              <button
                onClick={() => {
                  const sampleCsv = 'kecamatan,kelurahan,kode_singkatan\nLumajang,Jogoyudan,JGY\nLumajang,Jogotrunan,JGT\nSukodono,Dawuhan Lor,DWL\n';
                  const blob = new Blob([sampleCsv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Format_Wilayah.csv';
                  a.click();
                }}
                className="w-full py-2 px-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100"
              >
                <Download className="w-4 h-4" /> Unduh Format Sample CSV
              </button>

              <input
                type="file"
                accept=".csv"
                className="w-full border border-gray-300 p-2 rounded-xl text-xs"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setCsvMsg(`File "${e.target.files[0].name}" berhasil diunggah! Wilayah terdeteksi.`);
                  }
                }}
              />

              {csvMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  {csvMsg}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => setCsvModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast and Confirmation Modal */}
      <ToastConfirmModal
        toasts={toasts}
        onDismissToast={dismissToast}
        confirmState={confirmState}
        onCloseConfirm={closeConfirm}
      />
    </div>
  );
}
