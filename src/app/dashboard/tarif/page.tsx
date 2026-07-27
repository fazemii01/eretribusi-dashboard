'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Settings, X, Search, Tag, DollarSign } from 'lucide-react';

interface Tarif {
  va: number;
  nama: string;
  nominal: number;
  kategori: string;
}

export default function TarifPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState<Tarif | null>(null);
  const [formVa, setFormVa] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formNominal, setFormNominal] = useState('');
  const [formKategori, setFormKategori] = useState('Rumah Tangga');

  const [tarifList, setTarifList] = useState<Tarif[]>([
    { va: 450, nama: 'Rumah Tangga R1-450VA', nominal: 10000, kategori: 'Rumah Tangga' },
    { va: 900, nama: 'Rumah Tangga R1-900VA', nominal: 15000, kategori: 'Rumah Tangga' },
    { va: 1300, nama: 'Rumah Tangga R1-1300VA', nominal: 25000, kategori: 'Rumah Tangga' },
    { va: 2200, nama: 'Rumah Tangga R1-2200VA', nominal: 35000, kategori: 'Rumah Tangga' },
    { va: 3500, nama: 'Rumah Tangga R2-3500VA (Mewah)', nominal: 50000, kategori: 'Rumah Tangga' },
    { va: 5500, nama: 'Komersial / Minimarket Modern (5500VA)', nominal: 75000, kategori: 'Komersial & Bisnis' },
    { va: 6600, nama: 'Toko / Ruko Pertokoan Niaga', nominal: 35000, kategori: 'Komersial & Bisnis' },
    { va: 7700, nama: 'Restoran & Rumah Makan', nominal: 100000, kategori: 'Komersial & Bisnis' },
    { va: 8800, nama: 'Hotel, Penginapan & Wisma', nominal: 150000, kategori: 'Komersial & Bisnis' },
    { va: 9900, nama: 'Perkantoran Swasta / Perbankan', nominal: 75000, kategori: 'Komersial & Bisnis' },
    { va: 11000, nama: 'Puskesmas & Klinik Kesehatan', nominal: 100000, kategori: 'Fasilitas Umum & Sosial' },
    { va: 13200, nama: 'Rumah Sakit Umum (RSUD)', nominal: 250000, kategori: 'Fasilitas Umum & Sosial' },
    { va: 16500, nama: 'Kios Pasar Tradisional', nominal: 20000, kategori: 'Fasilitas Umum & Sosial' },
    { va: 22000, nama: 'Industri / Pabrik Pengolahan', nominal: 300000, kategori: 'Industri' },
  ]);

  const filteredTarif = tarifList.filter((t) => {
    return (
      search === '' ||
      t.nama.toLowerCase().includes(search.toLowerCase()) ||
      t.kategori.toLowerCase().includes(search.toLowerCase()) ||
      t.va.toString().includes(search)
    );
  });

  const handleOpenModal = (t?: Tarif) => {
    if (t) {
      setSelectedTarif(t);
      setFormVa(t.va.toString());
      setFormNama(t.nama);
      setFormNominal(t.nominal.toString());
      setFormKategori(t.kategori);
    } else {
      setSelectedTarif(null);
      setFormVa('');
      setFormNama('');
      setFormNominal('');
      setFormKategori('Rumah Tangga');
    }
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const vaNum = parseInt(formVa, 10);
    const nomNum = parseInt(formNominal, 10);

    if (selectedTarif) {
      setTarifList((prev) =>
        prev.map((t) => (t.va === selectedTarif.va ? { va: vaNum, nama: formNama, nominal: nomNum, kategori: formKategori } : t))
      );
    } else {
      setTarifList((prev) => [...prev, { va: vaNum, nama: formNama, nominal: nomNum, kategori: formKategori }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-ink-100)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
              Pengaturan Master Tarif Retribusi
            </h1>
            <span className="px-3 py-1 rounded-full bg-[var(--color-brand-wash)] text-[var(--color-brand-deep)] font-bold text-xs border border-[var(--color-brand-light)]/20">
              {tarifList.length} Kategori Tarif
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-500)] mt-1">
            Kelola besaran nominal iuran retribusi sampah daerah berdasarkan Perda / Perbupati Lumajang.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-semibold hover:bg-[var(--color-brand-deep)] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tambah Tarif Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--color-ink-100)] shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Nama Tarif, Kategori, atau Kode VA..."
            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[var(--color-ink-500)] absolute left-3 top-3" />
        </div>
      </div>

      {/* Table per PRD */}
      <div className="bg-white rounded-2xl border border-[var(--color-ink-100)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead className="bg-[var(--color-ink-50)] text-[var(--color-ink-500)] text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-ink-100)]">
              <tr>
                <th className="p-4">Kode / Daya (VA)</th>
                <th className="p-4">Kategori Sektor</th>
                <th className="p-4">Nama Tarif Resmi</th>
                <th className="p-4">Nominal Bulanan</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink-100)] text-[var(--color-ink-700)]">
              {filteredTarif.map((t) => (
                <tr key={t.va} className="hover:bg-[var(--color-ink-50)] transition-colors">
                  <td className="p-4 font-mono font-bold text-[var(--color-brand-deep)]">
                    <span className="px-2.5 py-1 rounded-md bg-[var(--color-brand-wash)] text-xs border border-[var(--color-brand-light)]/20">
                      {t.va} VA
                    </span>
                  </td>
                  <td className="p-4 text-xs font-semibold text-[var(--color-ink-700)]">
                    {t.kategori}
                  </td>
                  <td className="p-4 font-bold text-[var(--color-ink-900)]">{t.nama}</td>
                  <td className="p-4 font-bold text-[var(--color-brand-deep)]">
                    Rp {t.nominal.toLocaleString('id-ID')} / bulan
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenModal(t)}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title="Edit Tarif"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Hapus Tarif"
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--color-ink-100)] relative">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-ink-100)] mb-4">
              <h3 className="text-base font-bold text-[var(--color-ink-900)]">
                {selectedTarif ? 'Edit Master Tarif' : 'Tambah Master Tarif Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Daya / Kode VA</label>
                <input
                  type="number"
                  value={formVa}
                  onChange={(e) => setFormVa(e.target.value)}
                  placeholder="Misal: 900"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)]"
                  required
                  disabled={!!selectedTarif}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Kategori Sektor</label>
                <select
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)]"
                >
                  <option value="Rumah Tangga">Rumah Tangga</option>
                  <option value="Komersial & Bisnis">Komersial & Bisnis</option>
                  <option value="Fasilitas Umum & Sosial">Fasilitas Umum & Sosial</option>
                  <option value="Industri">Industri</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Nama Tarif Resmi</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Misal: Rumah Tangga R1-900VA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Nominal Bulanan (Rp)</label>
                <input
                  type="number"
                  value={formNominal}
                  onChange={(e) => setFormNominal(e.target.value)}
                  placeholder="Misal: 15000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[var(--color-ink-100)]">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-semibold hover:bg-[var(--color-brand-deep)] transition-colors"
                >
                  Simpan Tarif
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 text-xs font-semibold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
