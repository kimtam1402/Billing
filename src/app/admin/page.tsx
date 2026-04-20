'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Film, BarChart3, LogOut,
  TrendingUp, DollarSign, Eye, Star, Plus, Pencil, Trash2,
  Search, X, Check, ChevronLeft, ChevronRight, Shield, Wallet,
  Menu, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalUsers: number;
  totalMovies: number;
  planRevenue: number;
  totalBalance: number;
  planStats: { FREE: number; PLUS: number; PRO: number; PREMIUM: number };
  totalViews: number;
  newUsersThisWeek: number;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  plan: string;
  balance: number;
  isAdmin: boolean;
  createdAt: string;
  subscriptionEnd?: string;
}

interface AdminMovie {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  trailerUrl?: string;
  requiredPlan: string;
  genre: string[];
  rating: number;
  year: number;
  duration: string;
  director?: string;
  cast?: string[];
  featured: boolean;
  views: number;
}

type Tab = 'dashboard' | 'users' | 'movies';

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-zinc-700 text-zinc-300',
  PLUS: 'bg-blue-900 text-blue-300',
  PRO: 'bg-purple-900 text-purple-300',
  PREMIUM: 'bg-amber-900 text-amber-300',
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    } else if (!authLoading && user && !user.isAdmin) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user?.isAdmin) return null;

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'users', label: 'Người dùng', icon: <Users className="w-5 h-5" /> },
    { id: 'movies', label: 'Phim', icon: <Film className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#E50914]" />
            <span className="text-white font-bold text-lg"><span className="text-[#E50914]">Cine</span>Stream Admin</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                tab === item.id ? 'bg-[#E50914] text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Về trang chủ
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-500 hover:bg-zinc-900 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden text-zinc-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-white font-semibold text-lg capitalize">
            {navItems.find(n => n.id === tab)?.label}
          </h1>
        </header>

        <main className="flex-1 p-6">
          {tab === 'dashboard' && <DashboardTab token={token!} />}
          {tab === 'users' && <UsersTab token={token!} />}
          {tab === 'movies' && <MoviesTab token={token!} />}
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ token }: { token: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topMovies, setTopMovies] = useState<{ _id: string; title: string; views: number; thumbnail: string; requiredPlan: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setStats(data.stats); setTopMovies(data.topMovies || []); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" /></div>;
  if (!stats) return null;

  const statCards = [
    { label: 'Tổng người dùng', value: fmtNum(stats.totalUsers), icon: <Users className="w-6 h-6" />, sub: `+${stats.newUsersThisWeek} tuần này`, color: 'text-blue-400' },
    { label: 'Tổng phim', value: fmtNum(stats.totalMovies), icon: <Film className="w-6 h-6" />, sub: 'Tất cả phim', color: 'text-purple-400' },
    { label: 'Tổng lượt xem', value: fmtNum(stats.totalViews), icon: <Eye className="w-6 h-6" />, sub: 'Tất cả thời gian', color: 'text-green-400' },
    { label: 'Doanh thu gói', value: fmt(stats.planRevenue), icon: <DollarSign className="w-6 h-6" />, sub: 'Từ subscriptions', color: 'text-amber-400' },
    { label: 'Tổng số dư', value: fmt(stats.totalBalance), icon: <Wallet className="w-6 h-6" />, sub: 'Trong tài khoản', color: 'text-rose-400' },
    { label: 'User mới / tuần', value: stats.newUsersThisWeek.toString(), icon: <TrendingUp className="w-6 h-6" />, sub: '7 ngày gần nhất', color: 'text-cyan-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-zinc-800 ${card.color}`}>{card.icon}</div>
            <div>
              <p className="text-zinc-400 text-sm">{card.label}</p>
              <p className="text-white text-2xl font-bold mt-0.5">{card.value}</p>
              <p className="text-zinc-500 text-xs mt-1">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Plan distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#E50914]" />Phân bố gói cước</h3>
          <div className="space-y-4">
            {(['FREE', 'PLUS', 'PRO', 'PREMIUM'] as const).map(plan => {
              const count = stats.planStats[plan];
              const pct = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
              const barColors: Record<string, string> = { FREE: 'bg-zinc-500', PLUS: 'bg-blue-500', PRO: 'bg-purple-500', PREMIUM: 'bg-amber-500' };
              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${PLAN_COLORS[plan]}`}>{plan}</span>
                    <span className="text-zinc-300">{count} người ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColors[plan]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top movies */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-[#E50914]" />Top phim xem nhiều nhất</h3>
          <div className="space-y-3">
            {topMovies.length === 0 && <p className="text-zinc-500 text-sm">Chưa có dữ liệu</p>}
            {topMovies.map((movie, idx) => (
              <div key={movie._id} className="flex items-center gap-4">
                <span className="text-zinc-500 text-sm w-5 text-right">{idx + 1}</span>
                <div className="w-12 h-8 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
                  {movie.thumbnail && <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{movie.title}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${PLAN_COLORS[movie.requiredPlan]}`}>{movie.requiredPlan}</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400 text-sm flex-shrink-0">
                  <Eye className="w-4 h-4" />
                  {fmtNum(movie.views)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${search}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [token, search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdate = async (userId: string, fields: Partial<AdminUser>) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(fields),
    });
    if (res.ok) {
      toast.success('Cập nhật thành công!');
      setEditUser(null);
      fetchUsers();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      toast.success('Đã xóa người dùng');
      setDeleteUser(null);
      fetchUsers();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Lỗi xóa');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>
        <span className="text-zinc-500 text-sm">{total} người dùng</span>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Người dùng</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Gói</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Số dư</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Tham gia</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Role</th>
                <th className="px-4 py-3 text-xs text-zinc-500 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">Đang tải...</td></tr>
              )}
              {!loading && users.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">Không có người dùng nào</td></tr>
              )}
              {users.map(u => (
                <tr key={u._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{u.name}</p>
                        <p className="text-zinc-500 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${PLAN_COLORS[u.plan]}`}>{u.plan}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300">{fmt(u.balance || 0)}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">
                    {u.isAdmin ? (
                      <span className="text-xs px-2 py-1 rounded bg-red-900 text-red-300 font-bold flex items-center gap-1 w-fit"><Shield className="w-3 h-3" />Admin</span>
                    ) : (
                      <span className="text-xs text-zinc-500">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setEditUser(u)} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteUser(u)} className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Trang {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded text-zinc-400 hover:text-white disabled:opacity-30 hover:bg-zinc-700 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded text-zinc-400 hover:text-white disabled:opacity-30 hover:bg-zinc-700 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={handleUpdate} />}

      {/* Delete Confirm Modal */}
      {deleteUser && (
        <ConfirmModal
          title="Xóa người dùng"
          message={`Bạn có chắc chắn muốn xóa tài khoản "${deleteUser.name}"? Hành động này không thể hoàn tác.`}
          onConfirm={() => handleDelete(deleteUser._id)}
          onCancel={() => setDeleteUser(null)}
        />
      )}
    </div>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSave }: {
  user: AdminUser;
  onClose: () => void;
  onSave: (id: string, fields: Partial<AdminUser>) => void;
}) {
  const [form, setForm] = useState({
    name: user.name,
    plan: user.plan,
    balance: user.balance.toString(),
    isAdmin: user.isAdmin,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">Chỉnh sửa người dùng</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Email (không thể sửa)</label>
            <input value={user.email} disabled className="w-full bg-zinc-800 border border-zinc-700 text-zinc-500 rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Tên hiển thị</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Gói cước</label>
            <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500">
              {['FREE', 'PLUS', 'PRO', 'PREMIUM'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Số dư (₫)</label>
            <input
              type="number"
              value={form.balance}
              onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(f => ({ ...f, isAdmin: !f.isAdmin }))}
              className={`w-10 h-6 rounded-full transition-colors ${form.isAdmin ? 'bg-red-600' : 'bg-zinc-700'} relative`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isAdmin ? 'left-5' : 'left-1'}`} />
            </button>
            <span className="text-sm text-zinc-300">Quyền Admin</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">Hủy</button>
          <button
            onClick={() => onSave(user._id, { name: form.name, plan: form.plan as AdminUser['plan'], balance: Number(form.balance), isAdmin: form.isAdmin })}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#E50914] hover:bg-[#f40612] transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Movies Tab ───────────────────────────────────────────────────────────────
function MoviesTab({ token }: { token: string }) {
  const [movies, setMovies] = useState<AdminMovie[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editMovie, setEditMovie] = useState<AdminMovie | null>(null);
  const [deleteMovie, setDeleteMovie] = useState<AdminMovie | null>(null);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/movies?search=${search}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMovies(data.movies || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [token, search, page]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  const handleDelete = async (movieId: string) => {
    const res = await fetch(`/api/admin/movies/${movieId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      toast.success('Đã xóa phim');
      setDeleteMovie(null);
      fetchMovies();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Lỗi xóa');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên phim..."
            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>
        <span className="text-zinc-500 text-sm">{total} phim</span>
        <button
          onClick={() => { setEditMovie(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E50914] text-white rounded-lg text-sm font-medium hover:bg-[#f40612] transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" />
          Thêm phim
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Phim</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Yêu cầu gói</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Đánh giá</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Lượt xem</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Nổi bật</th>
                <th className="px-4 py-3 text-xs text-zinc-500 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">Đang tải...</td></tr>
              )}
              {!loading && movies.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">Không có phim nào</td></tr>
              )}
              {movies.map(m => (
                <tr key={m._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
                        <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium line-clamp-1">{m.title}</p>
                        <p className="text-zinc-500 text-xs">{m.year} • {m.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${PLAN_COLORS[m.requiredPlan]}`}>{m.requiredPlan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {m.rating}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 text-sm">{fmtNum(m.views)}</td>
                  <td className="px-4 py-3">
                    {m.featured ? <span className="text-xs px-2 py-1 rounded bg-green-900 text-green-300">Có</span> : <span className="text-xs text-zinc-600">Không</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => { setEditMovie(m); setShowForm(true); }} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteMovie(m)} className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Trang {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded text-zinc-400 hover:text-white disabled:opacity-30 hover:bg-zinc-700 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded text-zinc-400 hover:text-white disabled:opacity-30 hover:bg-zinc-700 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <MovieFormModal
          token={token}
          movie={editMovie}
          onClose={() => { setShowForm(false); setEditMovie(null); }}
          onSaved={() => { setShowForm(false); setEditMovie(null); fetchMovies(); }}
        />
      )}

      {deleteMovie && (
        <ConfirmModal
          title="Xóa phim"
          message={`Bạn có chắc chắn muốn xóa phim "${deleteMovie.title}"? Hành động này không thể hoàn tác.`}
          onConfirm={() => handleDelete(deleteMovie._id)}
          onCancel={() => setDeleteMovie(null)}
        />
      )}
    </div>
  );
}

// ─── Movie Form Modal ─────────────────────────────────────────────────────────
function MovieFormModal({ token, movie, onClose, onSaved }: {
  token: string;
  movie: AdminMovie | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: movie?.title || '',
    description: movie?.description || '',
    videoUrl: movie?.videoUrl || '',
    thumbnail: movie?.thumbnail || '',
    trailerUrl: movie?.trailerUrl || '',
    requiredPlan: movie?.requiredPlan || 'FREE',
    genre: Array.isArray(movie?.genre) ? movie.genre.join(', ') : '',
    rating: movie?.rating?.toString() || '0',
    year: movie?.year?.toString() || new Date().getFullYear().toString(),
    duration: movie?.duration || '',
    director: movie?.director || '',
    cast: Array.isArray(movie?.cast) ? movie.cast.join(', ') : '',
    featured: movie?.featured || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = movie ? `/api/admin/movies/${movie._id}` : '/api/admin/movies';
      const method = movie ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(movie ? 'Đã cập nhật phim!' : 'Đã thêm phim mới!');
        onSaved();
      } else {
        toast.error(data.error || 'Lỗi lưu phim');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl shadow-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h3 className="text-white font-bold text-lg">{movie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 mb-1.5 block">Tên phim *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 mb-1.5 block">Mô tả *</label>
              <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 mb-1.5 block">URL Video *</label>
              <input required value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://..." className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 mb-1.5 block">URL Thumbnail *</label>
              <input required value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 mb-1.5 block">URL Trailer</label>
              <input value={form.trailerUrl} onChange={e => setForm(f => ({ ...f, trailerUrl: e.target.value }))} placeholder="https://..." className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Yêu cầu gói</label>
              <select value={form.requiredPlan} onChange={e => setForm(f => ({ ...f, requiredPlan: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500">
                {['FREE', 'PLUS', 'PRO', 'PREMIUM'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Đánh giá (0-10)</label>
              <input type="number" min="0" max="10" step="0.1" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Năm</label>
              <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Thời lượng</label>
              <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="vd: 2h 29m" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Đạo diễn</label>
              <input value={form.director} onChange={e => setForm(f => ({ ...f, director: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Thể loại (phân cách bằng dấu phẩy)</label>
              <input value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} placeholder="Hành động, Khoa học viễn tưởng" className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 mb-1.5 block">Diễn viên (phân cách bằng dấu phẩy)</label>
              <input value={form.cast} onChange={e => setForm(f => ({ ...f, cast: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <button type="button" onClick={() => setForm(f => ({ ...f, featured: !f.featured }))} className={`w-10 h-6 rounded-full transition-colors ${form.featured ? 'bg-green-600' : 'bg-zinc-700'} relative`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.featured ? 'left-5' : 'left-1'}`} />
              </button>
              <span className="text-sm text-zinc-300">Phim nổi bật (hiển thị ở Hero)</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">Hủy</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#E50914] hover:bg-[#f40612] transition-colors disabled:opacity-50 flex items-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {movie ? 'Cập nhật' : 'Thêm phim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onCancel }: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-2 rounded-lg bg-red-900/30 text-red-500 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <p className="text-zinc-400 text-sm mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">Hủy</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Xác nhận xóa</button>
        </div>
      </div>
    </div>
  );
}
