'use client';

import { useState } from 'react';
import { Search, Plus, Edit, Trash2, ShieldCheck, X } from 'lucide-react';

interface UserItem {
  uuid: string;
  username: string;
  namaLengkap: string;
  role: 'ketua' | 'admin' | 'petugas';
}

export default function UserPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formRole, setFormRole] = useState<'ketua' | 'admin' | 'petugas'>('admin');

  const mockUsers: UserItem[] = [
    { uuid: 'usr-8921-9921-a12b', username: 'ketua_dlh', namaLengkap: 'Drs. H. Hendra Wijaya', role: 'ketua' },
    { uuid: 'usr-1204-8849-c43d', username: 'admin_keuangan', namaLengkap: 'Budi Santoso, S.E.', role: 'admin' },
    { uuid: 'usr-4491-0023-e98f', username: 'petugas_loket1', namaLengkap: 'Ahmad Fauzi', role: 'petugas' },
  ];

  const filteredUsers = mockUsers.filter((u) => {
    return (
      search === '' ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.namaLengkap.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenModal = (u?: UserItem) => {
    if (u) {
      setSelectedUser(u);
      setFormUsername(u.username);
      setFormNama(u.namaLengkap);
      setFormRole(u.role);
      setFormPassword('');
    } else {
      setSelectedUser(null);
      setFormUsername('');
      setFormNama('');
      setFormRole('admin');
      setFormPassword('');
    }
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-ink-100)]">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-ink-900)] tracking-tight">
            Manajemen User & Hak Akses
          </h1>
          <p className="text-xs text-[var(--color-ink-500)] mt-1">
            Kelola akun pengurus sistem retribusi (Ketua, Admin Keuangan, Petugas Loket).
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-semibold hover:bg-[var(--color-brand-deep)] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengurus
        </button>
      </div>

      {/* Search Feature per PRD */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--color-ink-100)] shadow-xs max-w-md">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Username atau Nama Lengkap..."
            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[var(--color-ink-500)] absolute left-3 top-3" />
        </div>
      </div>

      {/* Table per PRD (Cols: UUID, Username, Nama Lengkap, Role, Aksi) */}
      <div className="bg-white rounded-2xl border border-[var(--color-ink-100)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead className="bg-[var(--color-ink-50)] text-[var(--color-ink-500)] text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-ink-100)]">
              <tr>
                <th className="p-4">UUID</th>
                <th className="p-4">Username</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4 text-center">Role Akses</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ink-100)] text-[var(--color-ink-700)]">
              {filteredUsers.map((u) => {
                const isKetua = u.role === 'ketua';
                const isAdmin = u.role === 'admin';
                return (
                  <tr key={u.uuid} className="hover:bg-[var(--color-ink-50)] transition-colors">
                    <td className="p-4 font-mono text-xs text-[var(--color-ink-500)]">{u.uuid}</td>
                    <td className="p-4 font-bold text-[var(--color-ink-900)]">{u.username}</td>
                    <td className="p-4 font-semibold">{u.namaLengkap}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isKetua
                            ? 'bg-violet-100 text-violet-700 border border-violet-200'
                            : isAdmin
                            ? 'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info)]/20'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(u)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                          title="Edit Pengurus"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Hapus Pengurus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[var(--color-ink-100)] relative">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-ink-100)] mb-4">
              <h3 className="text-base font-bold text-[var(--color-ink-900)]">
                {selectedUser ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-red-500">
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
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Username</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Misal: admin_budi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Misal: Budi Santoso, S.E."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Password</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Ketik password baru..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)]"
                  required={!selectedUser}
                />
                {selectedUser && (
                  <p className="text-[10px] text-[var(--color-ink-500)] mt-1">*Kosongkan jika tidak mengubah password.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-700)] mb-1">Hak Akses (Role)</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-ink-300)] text-xs text-[var(--color-ink-900)] bg-[var(--color-ink-50)]"
                >
                  <option value="ketua">Ketua (Full Akses)</option>
                  <option value="admin">Admin Keuangan</option>
                  <option value="petugas">Petugas Loket</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-mid)] text-white text-xs font-semibold hover:bg-[var(--color-brand-deep)]"
                >
                  Simpan Data
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
