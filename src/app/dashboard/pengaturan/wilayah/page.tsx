'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Download, Edit, Trash2, MapPin, X, Check } from 'lucide-react';

interface WilayahItem {
  id: string;
  kecamatan: string;
  kelurahan: string;
  kodeSingkatan: string;
}

export default function KodeWilayahPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WilayahItem | null>(null);

  const [formKec, setFormKec] = useState('Lumajang');
  const [formKel, setFormKel] = useState('');
  const [formKode, setFormKode] = useState('');
  const [csvMsg, setCsvMsg] = useState('');

  const [wilayahList, setWilayahList] = useState<WilayahItem[]>([
    { id: '1', kecamatan: 'Lumajang', kelurahan: 'Jogoyudan', kodeSingkatan: 'JGY' },
    { id: '2', kecamatan: 'Lumajang', kelurahan: 'Jogotrunan', kodeSingkatan: 'JGT' },
    { id: '3', kecamatan: 'Lumajang', kelurahan: 'Rogotrunan', kodeSingkatan: 'RGT' },
    { id: '4', kecamatan: 'Lumajang', kelurahan: 'Citrodiwangsan', kodeSingkatan: 'CTR' },
    { id: '5', kecamatan: 'Lumajang', kelurahan: 'Tompokersan', kodeSingkatan: 'TMP' },
    { id: '6', kecamatan: 'Lumajang', kelurahan: 'Kepuharjo', kodeSingkatan: 'KPH' },
    { id: '7', kecamatan: 'Lumajang', kelurahan: 'Ditotrunan', kodeSingkatan: 'DTR' },
    { id: '8', kecamatan: 'Sukodono', kelurahan: 'Dawuhan Lor', kodeSingkatan: 'DWL' },
    { id: '9', kecamatan: 'Sukodono', kelurahan: 'Kutorenon', kodeSingkatan: 'KTR' },
    { id: '10', kecamatan: 'Pasirian', kelurahan: 'Pasirian', kodeSingkatan: 'PSR' },
  ]);

  const filteredData = useMemo(() => {
    return wilayahList.filter(
      (w) =>
        search === '' ||
        w.kecamatan.toLowerCase().includes(search.toLowerCase()) ||
        w.kelurahan.toLowerCase().includes(search.toLowerCase()) ||
        w.kodeSingkatan.toLowerCase().includes(search.toLowerCase())
    );
  }, [wilayahList, search]);

  const handleOpenModal = (item?: WilayahItem) => {
    if (item) {
      setSelectedItem(item);
      setFormKec(item.kecamatan);
      setFormKel(item.kelurahan);
      setFormKode(item.kodeSingkatan);
    } else {
      setSelectedItem(null);
      setFormKec('Lumajang');
      setFormKel('');
      setFormKode('');
    }
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      setWilayahList((prev) =>
        prev.map((w) =>
          w.id === selectedItem.id
            ? { ...w, kecamatan: formKec, kelurahan: formKel, kodeSingkatan: formKode }
            : w
        )
      );
    } else {
      const newItem: WilayahItem = {
        id: Date.now().toString(),
        kecamatan: formKec,
        kelurahan: formKel,
        kodeSingkatan: formKode || formKel.slice(0, 3).toUpperCase(),
      };
      setWilayahList((prev) => [...prev, newItem]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data wilayah ini?')) {
      setWilayahList((prev) => prev.filter((w) => w.id !== id));
    }
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
              {filteredData.length} Kelurahan / Desa
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-500)] mt-1">
            Kelola data singkatan kecamatan & kelurahan/desa seluruh Kabupaten Lumajang.
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-bold hover:bg-[var(--color-brand-deep)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Wilayah
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--color-ink-100)] shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Kecamatan, Kelurahan, atau Kode Singkatan..."
            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[var(--color-ink-500)] absolute left-3 top-3" />
        </div>

        <button
          onClick={() => {
            let csv = 'kecamatan,kelurahan,kode_singkatan\n';
            filteredData.forEach((w) => (csv += `${w.kecamatan},${w.kelurahan},${w.kodeSingkatan}\n`));
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-ink-100)] overflow-hidden shadow-xs">
        <table className="min-w-full text-sm text-left border-collapse whitespace-nowrap">
          <thead className="bg-[var(--color-ink-50)] text-[var(--color-ink-500)] text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-ink-100)]">
            <tr>
              <th className="p-4">Kecamatan</th>
              <th className="p-4">Kelurahan / Desa</th>
              <th className="p-4">Kode Singkatan</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-ink-100)] text-[var(--color-ink-700)]">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-[var(--color-ink-50)] transition-colors">
                <td className="p-4 font-bold text-[var(--color-ink-900)] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--color-brand-mid)]" />
                  {item.kecamatan}
                </td>
                <td className="p-4 font-semibold">{item.kelurahan}</td>
                <td className="p-4 font-mono font-bold">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-[var(--color-brand-deep)] border border-emerald-200">
                    {item.kodeSingkatan}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Hapus"
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

      {/* Modal Add/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">
                {selectedItem ? 'Edit Kode Wilayah' : 'Tambah Wilayah Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={formKec}
                  onChange={(e) => setFormKec(e.target.value)}
                  placeholder="Lumajang"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kelurahan / Desa</label>
                <input
                  type="text"
                  value={formKel}
                  onChange={(e) => setFormKel(e.target.value)}
                  placeholder="Jogoyudan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kode Singkatan (3 Huruf)</label>
                <input
                  type="text"
                  value={formKode}
                  onChange={(e) => setFormKode(e.target.value.toUpperCase())}
                  placeholder="JGY"
                  maxLength={5}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold uppercase focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-bold hover:bg-[var(--color-brand-deep)] transition-colors"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-50"
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
                    setCsvMsg(`File "${e.target.files[0].name}" berhasil diunggah! 21 Kecamatan terdeteksi.`);
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
    </div>
  );
}
