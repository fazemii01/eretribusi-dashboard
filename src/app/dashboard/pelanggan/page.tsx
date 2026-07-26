'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Download, Printer, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Pelanggan {
  id: string;
  nama: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  va: number;
  noHp: string;
}

export default function PelangganPage() {
  const [search, setSearch] = useState('');
  const [filterKel, setFilterKel] = useState('');
  const [filterKec, setFilterKec] = useState('');
  const [filterVa, setFilterVa] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Pelanggan | null>(null);
  const [showPrintReport, setShowPrintReport] = useState(false);

  // Form states (RT and RW in SEPARATE fields per PRD)
  const [formNama, setFormNama] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formRt, setFormRt] = useState('01');
  const [formRw, setFormRw] = useState('01');
  const [formKel, setFormKel] = useState('Jogoyudan');
  const [formKec, setFormKec] = useState('Lumajang');
  const [formVa, setFormVa] = useState('900');
  const [formHp, setFormHp] = useState('');

  // Generate 1,050 Data Pelanggan for all 7 Kelurahan
  const allPelanggan = useMemo(() => {
    const kelMap = [
      { kode: 'JGY', nama: 'Jogoyudan', street: 'Jl. Mawar' },
      { kode: 'JGT', nama: 'Jogotrunan', street: 'Jl. Melati' },
      { kode: 'RGT', nama: 'Rogotrunan', street: 'Jl. Dahlia' },
      { kode: 'CTR', nama: 'Citrodiwangsan', street: 'Jl. Gajah Mada' },
      { kode: 'TMP', nama: 'Tompokersan', street: 'Jl. Ahmad Yani' },
      { kode: 'KPH', nama: 'Kepuharjo', street: 'Jl. HOS Cokroaminoto' },
      { kode: 'DTR', nama: 'Ditotrunan', street: 'Jl. Veteran' },
    ];
    const sampleFirstNames = ['Budi', 'Siti', 'Agus', 'Dewi', 'Eko', 'Rina', 'Joko', 'Sri', 'Bambang', 'Heni', 'Hadi', 'Lilis', 'Dedi', 'Yuni', 'Supardi', 'Neneng', 'Slamet', 'Titin'];
    const sampleLastNames = ['Santoso', 'Aminah', 'Setiawan', 'Lestari', 'Prasetyo', 'Wati', 'Susilo', 'Rahayu', 'Hidayat', 'Mulyani', 'Kusuma', 'Utami', 'Firmansyah', 'Suryani'];
    const vaOptions = [450, 900, 1300, 2200];

    const list: Pelanggan[] = [];
    let seq = 1;

    for (const kel of kelMap) {
      for (let rw = 1; rw <= 5; rw++) {
        for (let rt = 1; rt <= 6; rt++) {
          for (let count = 1; count <= 5; count++) {
            const rtStr = rt.toString().padStart(2, '0');
            const rwStr = rw.toString().padStart(2, '0');
            const seqStr = seq.toString().padStart(3, '0');
            const fn = sampleFirstNames[(seq * 3) % sampleFirstNames.length];
            const ln = sampleLastNames[(seq * 7) % sampleLastNames.length];

            list.push({
              id: `${kel.kode}${rwStr}${rtStr}${seqStr}`,
              nama: `${fn} ${ln}`,
              alamat: `${kel.street} No. ${count * 3}`,
              rt: rtStr,
              rw: rwStr,
              kelurahan: kel.nama,
              kecamatan: 'Lumajang',
              va: vaOptions[seq % vaOptions.length],
              noHp: `62812${(1000000 + seq * 17).toString()}`,
            });
            seq++;
          }
        }
      }
    }
    return list;
  }, []);

  const filteredData = useMemo(() => {
    return allPelanggan.filter((item) => {
      const matchSearch =
        search === '' ||
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());
      const matchKel = filterKel === '' || item.kelurahan === filterKel;
      const matchKec = filterKec === '' || item.kecamatan === filterKec;
      const matchVa = filterVa === '' || item.va.toString() === filterVa;
      return matchSearch && matchKel && matchKec && matchVa;
    });
  }, [allPelanggan, search, filterKel, filterKec, filterVa]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleOpenModal = (item?: Pelanggan) => {
    if (item) {
      setSelectedItem(item);
      setFormNama(item.nama);
      setFormAlamat(item.alamat);
      setFormRt(item.rt);
      setFormRw(item.rw);
      setFormKel(item.kelurahan);
      setFormKec(item.kecamatan);
      setFormVa(item.va.toString());
      setFormHp(item.noHp);
    } else {
      setSelectedItem(null);
      setFormNama('');
      setFormAlamat('');
      setFormRt('01');
      setFormRw('01');
      setFormKel('Jogoyudan');
      setFormKec('Lumajang');
      setFormVa('900');
      setFormHp('');
    }
    setModalOpen(true);
  };

  const handleTriggerPrintReport = () => {
    setShowPrintReport(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleExportCSV = () => {
    let csv = 'ID Wajib Retribusi,Nama,Alamat,RT,RW,Kelurahan,Kecamatan,VA,No HP\n';
    filteredData.forEach((w) => {
      csv += `${w.id},${w.nama},${w.alamat},${w.rt},${w.rw},${w.kelurahan},${w.kecamatan},${w.va},${w.noHp}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_Pelanggan_Lumajang_${filteredData.length}_rows.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-ink-100)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
              Data Pelanggan (Wajib Retribusi)
            </h1>
            <span className="px-3 py-1 rounded-full bg-[var(--color-brand-wash)] text-[var(--color-brand-deep)] font-bold text-xs border border-[var(--color-brand-light)]/20">
              Total {filteredData.length.toLocaleString('id-ID')} Jiwa
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-500)] mt-1">
            Kelola basis data pelanggan retribusi daerah Lumajang.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-semibold hover:bg-[var(--color-brand-deep)] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tambah Pelanggan
        </button>
      </div>

      {/* Filters Bar per PRD */}
      <div className="bg-white p-5 rounded-2xl border border-[var(--color-ink-100)] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Search */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
              Pencarian Global
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari Nama / ID Wajib Retribusi..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none focus:border-[var(--color-brand-mid)]"
              />
              <Search className="w-4 h-4 text-[var(--color-ink-500)] absolute left-3 top-3" />
            </div>
          </div>

          {/* Filter Kelurahan */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
              Kelurahan / Desa
            </label>
            <select
              value={filterKel}
              onChange={(e) => {
                setFilterKel(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs bg-[var(--color-ink-50)] text-[var(--color-ink-900)] focus:outline-none"
            >
              <option value="">Semua Kelurahan</option>
              <option value="Jogoyudan">Jogoyudan</option>
              <option value="Jogotrunan">Jogotrunan</option>
              <option value="Rogotrunan">Rogotrunan</option>
              <option value="Citrodiwangsan">Citrodiwangsan</option>
              <option value="Tompokersan">Tompokersan</option>
              <option value="Kepuharjo">Kepuharjo</option>
              <option value="Ditotrunan">Ditotrunan</option>
            </select>
          </div>

          {/* Filter Kecamatan */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
              Kecamatan
            </label>
            <select
              value={filterKec}
              onChange={(e) => {
                setFilterKec(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs bg-[var(--color-ink-50)] text-[var(--color-ink-900)] focus:outline-none"
            >
              <option value="">Semua Kecamatan</option>
              <option value="Lumajang">Lumajang</option>
            </select>
          </div>

          {/* Filter Tarif */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-[var(--color-ink-500)] uppercase tracking-wider mb-1.5">
              Tarif (VA)
            </label>
            <select
              value={filterVa}
              onChange={(e) => {
                setFilterVa(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs bg-[var(--color-ink-50)] text-[var(--color-ink-900)] focus:outline-none"
            >
              <option value="">Semua VA</option>
              <option value="450">450 VA</option>
              <option value="900">900 VA</option>
              <option value="1300">1300 VA</option>
              <option value="2200">2200 VA</option>
            </select>
          </div>

          {/* Export & Print */}
          <div className="lg:col-span-2 flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleTriggerPrintReport}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-ink-100)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[var(--color-ink-50)] text-[var(--color-ink-500)] text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-ink-100)]">
              <tr>
                <th className="p-4">ID Wajib Retribusi</th>
                <th className="p-4">Nama Pelanggan</th>
                <th className="p-4">Alamat</th>
                <th className="p-4">RT</th>
                <th className="p-4">RW</th>
                <th className="p-4">Kelurahan / Desa</th>
                <th className="p-4">Daya (VA)</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink-100)] text-[var(--color-ink-700)]">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--color-ink-50)] transition-colors">
                  <td className="p-4">
                    <span className="font-mono-id px-2.5 py-1 rounded-md bg-[var(--color-brand-wash)] text-[var(--color-brand-deep)] font-bold text-xs border border-[var(--color-brand-light)]/20">
                      {item.id}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-[var(--color-ink-900)]">{item.nama}</td>
                  <td className="p-4 text-xs">{item.alamat}</td>
                  <td className="p-4 font-semibold text-xs">{item.rt}</td>
                  <td className="p-4 font-semibold text-xs">{item.rw}</td>
                  <td className="p-4 font-medium">{item.kelurahan}</td>
                  <td className="p-4 font-semibold">{item.va} VA</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title="Edit Data"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Hapus Data"
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

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[var(--color-ink-100)] bg-[var(--color-ink-50)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-ink-500)]">
          <div>
            Menampilkan <span className="font-bold text-[var(--color-ink-900)]">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-[var(--color-ink-900)]">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-bold text-[var(--color-ink-900)]">{filteredData.length.toLocaleString('id-ID')}</span> pelanggan
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[var(--color-ink-300)] bg-white disabled:opacity-40 hover:bg-[var(--color-ink-50)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-[var(--color-ink-900)] px-2">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[var(--color-ink-300)] bg-white disabled:opacity-40 hover:bg-[var(--color-ink-50)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL REPORT DOCUMENT */}
      {showPrintReport && (
        <div className="printable-receipt-area hidden">
          <div className="max-w-4xl mx-auto p-8 bg-white font-sans text-slate-800 space-y-6">
            {/* Kop Surat DLH */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <h2 className="text-xl font-bold uppercase tracking-wider">Pemerintah Kabupaten Lumajang</h2>
              <h1 className="text-2xl font-black uppercase tracking-wide">Dinas Lingkungan Hidup</h1>
              <p className="text-xs font-medium text-slate-600">Jl. Trunojoyo No. 12, Lumajang, Jawa Timur | Telp: (0334) 881234</p>
              <div className="pt-2 border-t border-slate-300">
                <h3 className="text-sm font-bold uppercase tracking-wide">Laporan Data Wajib Retribusi Sampah</h3>
                <p className="text-xs text-slate-500">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Ringkasan Filter */}
            <div className="flex justify-between items-center text-xs font-semibold bg-slate-100 p-3 rounded-lg border border-slate-300">
              <div>Wilayah: {filterKel || 'Seluruh Kelurahan'} (Kec. Lumajang)</div>
              <div>Filter Daya: {filterVa ? `${filterVa} VA` : 'Semua Tarif'}</div>
              <div>Total Data: {filteredData.length} Wajib Retribusi</div>
            </div>

            {/* Tabel Data Report */}
            <table className="w-full text-xs text-left border-collapse border-2 border-slate-600">
              <thead className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-600">
                <tr>
                  <th className="p-2 border border-slate-400 text-center w-10">No</th>
                  <th className="p-2 border border-slate-400 whitespace-nowrap">ID Wajib Retribusi</th>
                  <th className="p-2 border border-slate-400">Nama Kepala Keluarga</th>
                  <th className="p-2 border border-slate-400">Alamat</th>
                  <th className="p-2 border border-slate-400 text-center whitespace-nowrap">RT / RW</th>
                  <th className="p-2 border border-slate-400">Kelurahan</th>
                  <th className="p-2 border border-slate-400 text-right whitespace-nowrap">Daya (VA)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 500).map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-300">
                    <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold whitespace-nowrap">{item.id}</td>
                    <td className="p-2 border border-slate-300 font-bold">{item.nama}</td>
                    <td className="p-2 border border-slate-300">{item.alamat}</td>
                    <td className="p-2 border border-slate-300 text-center font-semibold whitespace-nowrap">{item.rt} / {item.rw}</td>
                    <td className="p-2 border border-slate-300">{item.kelurahan}</td>
                    <td className="p-2 border border-slate-300 text-right font-semibold whitespace-nowrap">{item.va} VA</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tanda Tangan */}
            <div className="pt-8 flex justify-between text-xs">
              <div></div>
              <div className="text-center space-y-12">
                <p>Lumajang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold underline uppercase">Kepala Dinas Lingkungan Hidup</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal (Separate RT and RW fields per PRD) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[var(--color-ink-100)] relative">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-ink-100)] mb-4">
              <h3 className="text-lg font-bold text-[var(--color-ink-900)]">
                {selectedItem ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-ink-500)] hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Nama Kepala Keluarga</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Alamat</label>
                <input
                  type="text"
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  placeholder="Misal: Jl. Mawar No 10"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
                  required
                />
              </div>

              {/* SEPARATE RT AND RW COLUMNS PER PRD */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">RT</label>
                  <input
                    type="text"
                    value={formRt}
                    onChange={(e) => setFormRt(e.target.value)}
                    placeholder="01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">RW</label>
                  <input
                    type="text"
                    value={formRw}
                    onChange={(e) => setFormRw(e.target.value)}
                    placeholder="01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Kelurahan / Desa</label>
                  <select
                    value={formKel}
                    onChange={(e) => setFormKel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
                  >
                    <option value="Jogoyudan">Jogoyudan (JGY)</option>
                    <option value="Jogotrunan">Jogotrunan (JGT)</option>
                    <option value="Rogotrunan">Rogotrunan (RGT)</option>
                    <option value="Citrodiwangsan">Citrodiwangsan (CTR)</option>
                    <option value="Tompokersan">Tompokersan (TMP)</option>
                    <option value="Kepuharjo">Kepuharjo (KPH)</option>
                    <option value="Ditotrunan">Ditotrunan (DTR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Daya Listrik (VA)</label>
                  <select
                    value={formVa}
                    onChange={(e) => setFormVa(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
                  >
                    <option value="450">450 VA</option>
                    <option value="900">900 VA</option>
                    <option value="1300">1300 VA</option>
                    <option value="2200">2200 VA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">No HP (WhatsApp)</label>
                <input
                  type="text"
                  value={formHp}
                  onChange={(e) => setFormHp(e.target.value)}
                  placeholder="6281234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-ink-100)]">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-semibold hover:bg-[var(--color-brand-deep)] transition-colors"
                >
                  Simpan Data
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300 transition-colors"
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
