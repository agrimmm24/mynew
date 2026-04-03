import { useState, useEffect } from 'react';
import {
  Users, Settings, LogOut, ShieldCheck, Info, TrendingUp, CreditCard,
  Activity, Send, CheckCircle2, ChevronRight, Search, LayoutDashboard,
  Bell, Cpu, History, Terminal as TerminalIcon, MessageSquare, X,
  Phone, Car, MoreVertical, Eye, Ban, KeyRound, Trash2, BadgeCheck,
  AlertTriangle, ExternalLink, Zap, BarChart3, Radar, ShieldAlert,
  Server, Loader2, Menu, Clock, UserCircle, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import AboutPage from './AboutPage';
import GlobalLogisticsMap from '../components/GlobalLogisticsMap';

interface UserProfile {
  id: string; email: string; full_name: string; role: string; phone_number?: string;
  is_verified: boolean; vehicle_count: number; booking_count: number;
}
interface WorkshopProfile extends UserProfile {
  driver_count: number; van_count: number;
  operational_days: string; operational_timings: string;
}
interface AdminStats { total_users: number; total_bookings: number; total_revenue: number; active_providers: number; }
interface ChartPoint { label: string; value: number; }
interface AdminCharts { bookings_trend: ChartPoint[]; role_distribution: ChartPoint[]; category_distribution: ChartPoint[]; }
interface AdminLog { id: string; timestamp: string; event_type: string; severity: string; description: string; user_email?: string; ip_address?: string; }
interface SystemSetting { key: string; value: string; description: string; }
interface UserTelemetry {
  id: string; full_name: string; email: string; last_login_ip: string;
  role: string; is_verified: boolean; recent_bookings: any[];
  recent_logs: AdminLog[]; active_missions_count: number;
  fleet?: { drivers: any[], vans: any[] };
}
interface ActiveTracking {
  booking_id: string; customer_name: string; provider_name: string;
  status: string; latitude: number; longitude: number;
  pickup_location: string; updated_at: string;
}

type AdminView = 'DASHBOARD' | 'WORKSHOPS' | 'USERS' | 'QUERIES' | 'COMMUNICATIONS' | 'LOGS' | 'SETTINGS' | 'ABOUT' | 'LOGISTICS';
type WorkshopSubView = 'NETWORK' | 'SCHEDULE';

export default function AdminDash() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AdminView>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [charts, setCharts] = useState<AdminCharts | null>(null);
  const [activeTracking, setActiveTracking] = useState<ActiveTracking[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [workshops, setWorkshops] = useState<WorkshopProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [workshopSearch, setWorkshopSearch] = useState('');
  const [workshopsLoading, setWorkshopsLoading] = useState(false);

  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  const [queries, setQueries] = useState<any[]>([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const [adminEmail, setAdminEmail] = useState<string>('');
  
  const [selectedTelemetry, setSelectedTelemetry] = useState<UserTelemetry | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [impersonationTargetId, setImpersonationTargetId] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  const [workshopSubView, setWorkshopSubView] = useState<WorkshopSubView>('NETWORK');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedWorkshopForSchedule, setSelectedWorkshopForSchedule] = useState<WorkshopProfile | null>(null);
  const [newScheduleDays, setNewScheduleDays] = useState('Mon-Sun');
  const [newScheduleTimings, setNewScheduleTimings] = useState('24/7');
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);

  useEffect(() => {
    fetchAdminProfile();
    fetchUsers();
    fetchWorkshops();
    fetchStats();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const resp = await api.get('/admin/auth/me');
      setAdminEmail(resp.data.email);
    } catch(err) { console.error(err); }
  };

  useEffect(() => {
    if (currentView === 'LOGS') fetchLogs();
    if (currentView === 'SETTINGS') fetchSettings();
    if (currentView === 'QUERIES') fetchQueries();
    if (currentView === 'LOGISTICS') fetchActiveTracking();
    if (currentView === 'WORKSHOPS') fetchWorkshops();
    if (currentView === 'USERS') fetchUsers();
  }, [currentView]);

  const fetchActiveTracking = async () => {
    setTrackingLoading(true);
    try {
      const response = await api.get('/admin/tracking/active');
      setActiveTracking(response.data);
    } catch (error) { console.error("Tracking fetch failed", error); }
    finally { setTrackingLoading(false); }
  };

  const fetchQueries = async () => {
    setQueriesLoading(true);
    try {
      const response = await api.get('/admin/queries');
      setQueries(response.data);
    } catch (error) { console.error(error); } finally { setQueriesLoading(false); }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery || !replyText) return;
    setIsReplying(true);
    try {
      await api.post(`/admin/queries/${selectedQuery.id}/reply`, { admin_reply: replyText });
      setReplyText('');
      setSelectedQuery(null);
      fetchQueries();
    } catch (error) { console.error(error); } finally { setIsReplying(false); }
  };

  const toggleQueryStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PENDING' ? 'RESOLVED' : 'PENDING';
    try {
      await api.patch(`/admin/queries/${id}/status`, { status: newStatus });
      fetchQueries();
    } catch (error) { console.error(error); }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await api.get('/admin/logs');
      setLogs(response.data);
    } catch (error) { console.error(error); } finally { setLogsLoading(false); }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (error) { console.error(error); } finally { setSettingsLoading(false); }
  };

  const updateSetting = async (key: string, newValue: string) => {
    try {
      await api.patch(`/admin/settings/${key}`, { value: newValue });
      fetchSettings();
      fetchLogs();
    } catch (error) { alert("Failed to update setting."); }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshopForSchedule) return;
    setIsUpdatingSchedule(true);
    try {
      await api.patch(`/admin/workshops/${selectedWorkshopForSchedule.id}/schedule`, {
        operational_days: newScheduleDays,
        operational_timings: newScheduleTimings
      });
      setIsScheduleModalOpen(false);
      fetchWorkshops();
    } catch (error) {
      alert("Failed to update workshop schedule.");
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        api.get('/admin/stats/overview'),
        api.get('/admin/stats/charts')
      ]);
      setStats(statsRes.data);
      setCharts(chartsRes.data);
    } catch (error) { console.error(error); }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users', { params: { search: userSearch } });
      setUsers(response.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchWorkshops = async () => {
    setWorkshopsLoading(true);
    try {
      const response = await api.get('/admin/workshops', { params: { search: workshopSearch } });
      setWorkshops(response.data);
    } catch (error) { console.error(error); } finally { setWorkshopsLoading(false); }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      await api.patch(`/admin/users/${userId}/action`, { action });
      fetchUsers();
    } catch (error) { console.error(`Failed to execute ${action}`, error); }
  };

  const fetchTelemetry = async (userId: string) => {
    setTelemetryLoading(true);
    try {
      const resp = await api.get(`/admin/users/${userId}/telemetry`);
      const data = resp.data;
      if (data.role === 'PROVIDER' || data.role === 'UserRole.PROVIDER') {
        try {
          const fleetResp = await api.get(`/admin/users/${userId}/fleet`);
          data.fleet = fleetResp.data;
        } catch (e) { console.log('No fleet data'); }
      }
      setSelectedTelemetry(data);
    } catch (error) {
      alert("Failed to synchronize user telemetry data.");
    } finally {
      setTelemetryLoading(false);
    }
  };

  const handleImpersonate = async (userId: string) => {
    try {
      setTelemetryLoading(true);
      // Explicitly pass empty body to ensure POST compatibility across all environments
      await api.post(`/admin/users/${userId}/impersonate`, {});
      setImpersonationTargetId(userId);
      setIsOtpModalOpen(true);
      setOtpValue('');
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Signal Handshake Interrupted";
      alert(`Identity Authorization Failed [${error.response?.status || 'NETWORK'}]: ${msg}`);
      console.error("Impersonation Handshake Error:", error);
    } finally {
      setTelemetryLoading(false);
    }
  };

  const handleConfirmImpersonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonationTargetId || otpValue.length !== 6) return;
    
    setIsVerifyingOtp(true);
    try {
      const resp = await api.post(`/admin/users/${impersonationTargetId}/impersonate/verify`, {
        otp_code: otpValue
      });
      const { redirect_url } = resp.data;
      window.open(redirect_url, '_blank');
      setIsOtpModalOpen(false);
      setImpersonationTargetId(null);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Verification failed: Signal mismatch.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendSuccess(false);
    try {
      await api.post('/emails/send', {
        to_email: emailRecipient, subject: emailSubject, body: emailBody, is_html: true
      });
      setSendSuccess(true);
      setEmailSubject('');
      setEmailBody('');
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (error) { alert("Failed to dispatch email."); } finally { setIsSending(false); }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <header>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Central <span className="text-red-600">Intelligence</span></h2>
              <p className="text-gray-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Real-time system telemetry and platform oversight</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Total Operatives" value={stats?.total_users || 0} icon={<Users size={24} />} trend={"+12%"}/>
              <StatCard label="Active Missions" value={stats?.total_bookings || 0} icon={<Activity size={24} />} trend={"+8%"}/>
              <StatCard label="Gross Revenue" value={`₹${stats?.total_revenue.toLocaleString() || '0'}`} icon={<CreditCard size={24} />} trend={"+24%"}/>
              <StatCard label="Verified Providers" value={stats?.active_providers || 0} icon={<ShieldCheck size={24} />} trend={"+4%"}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
              <div className="bg-[#111218] backdrop-blur-3xl border border-gray-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-red-600/30 transition-all duration-700">
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h3 className="text-lg font-black text-white italic uppercase tracking-widest">Platform <span className="text-red-600">Velocity</span></h3>
                  <div className="w-10 h-10 rounded-full bg-gray-900 border-gray-800 flex items-center justify-center border border-gray-700"><TrendingUp size={16} className="text-red-500" /></div>
                </div>
                <div className="h-48 flex items-end justify-between gap-2 relative z-10">
                  {charts?.bookings_trend.map((pt, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 relative group/bar">
                      <div className="w-full relative rounded-t-xl bg-[#111218] overflow-hidden">
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(pt.value / (Math.max(...charts.bookings_trend.map(d => d.value)) || 1)) * 140}px` }} className="w-full bg-gradient-to-t from-red-600/20 to-red-600 rounded-t-xl" />
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{pt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111218] backdrop-blur-3xl border border-gray-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-red-600/30 transition-all duration-700">
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h3 className="text-lg font-black text-white italic uppercase tracking-widest">Force <span className="text-red-600">Composition</span></h3>
                  <div className="w-10 h-10 rounded-full bg-gray-900 border-gray-800 flex items-center justify-center border border-gray-700"><Server size={16} className="text-red-500" /></div>
                </div>
                <div className="space-y-6 relative z-10">
                  {charts?.role_distribution.map((role, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                        <span>{role.label}</span>
                        <span className="text-white">{role.value} UNITS</span>
                      </div>
                      <div className="h-3 bg-gray-900 border-gray-800 rounded-full overflow-hidden border border-gray-800">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(role.value / (stats?.total_users || 1)) * 100}%` }} transition={{ duration: 1 }} className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'COMMUNICATIONS':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
            <header>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Signal <span className="text-red-600">Relay</span></h2>
              <p className="text-gray-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Direct encrypted broadcasting to platform nodes</p>
            </header>
            <div className="bg-[#111218] backdrop-blur-3xl border border-gray-800 p-10 rounded-[3rem] shadow-2xl max-w-4xl hover:border-red-600/30 transition-all duration-700">
              <form onSubmit={handleSendEmail} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Identity</label>
                    <select
                      value={emailRecipient} onChange={(e) => setEmailRecipient(e.target.value)}
                      className="w-full bg-gray-900 border-gray-800 border border-gray-800 rounded-2xl px-6 py-5 text-white font-medium text-sm focus:ring-1 focus:ring-red-600 outline-none transition-all appearance-none cursor-pointer" required
                    >
                      <option value="" disabled className="text-gray-500">Select Recipient Node</option>
                      {users.map((u) => <option key={u.id} value={u.email} className="bg-gray-900">{u.email} ({u.role})</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Transmission Subject</label>
                    <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full bg-gray-900 border-gray-800 border border-gray-800 rounded-2xl px-6 py-5 text-white font-medium text-sm focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-gray-800" placeholder="e.g. Protocol Update" required />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Payload Content</label>
                  <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={6} className="w-full bg-gray-900 border-gray-800 border border-gray-800 rounded-2xl px-6 py-5 text-white font-medium text-sm focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-gray-800 resize-none font-sans" placeholder="Compose encrypted message here..." required />
                </div>
                <button type="submit" disabled={isSending} className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:bg-gray-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-red-900/40 transition-all flex items-center justify-center gap-3 group">
                  {isSending ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Dispatch Signal</>}
                </button>
              </form>
              <AnimatePresence>
                {sendSuccess && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex items-center justify-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest">
                    <CheckCircle2 size={16} /> Transmission Authorized & Delivered
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      case 'WORKSHOPS':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                 <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Workshop <span className="text-red-600">Network</span></h2>
                 <p className="text-gray-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Authorized service providers and fleet nodes</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex bg-[#111218] p-1 rounded-xl border border-white/5 self-start">
                  <button 
                    onClick={() => setWorkshopSubView('NETWORK')}
                    className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${workshopSubView === 'NETWORK' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-500 hover:text-white'}`}
                  >
                    Network
                  </button>
                  <button 
                    onClick={() => setWorkshopSubView('SCHEDULE')}
                    className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${workshopSubView === 'SCHEDULE' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-500 hover:text-white'}`}
                  >
                    Schedule
                  </button>
                </div>
                <div className="relative w-full md:w-80 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-600 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="SEARCH WORKSHOPS..." 
                    value={workshopSearch}
                    onChange={(e) => setWorkshopSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchWorkshops()}
                    className="w-full bg-[#111218] border border-gray-800 rounded-2xl py-4 pl-16 pr-6 text-white font-black text-[10px] tracking-widest outline-none focus:border-red-600 transition-all placeholder:text-gray-800"
                  />
                </div>
              </div>
            </header>

            {workshopSubView === 'NETWORK' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {workshopsLoading ? (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-white/10 rounded-full animate-spin mx-auto"/>
                    <p className="text-gray-600 font-black uppercase tracking-widest text-[10px] mt-6">Synchronizing Provider Nodes...</p>
                  </div>
                ) : workshops.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-[#111218] rounded-[3rem] border border-gray-800 border-dashed">
                    <Activity size={40} className="text-gray-800 mx-auto mb-6" />
                    <p className="text-gray-600 font-black uppercase tracking-widest text-xs">No active nodes detected in this sector</p>
                  </div>
                ) : (
                  workshops.map(ws => (
                    <motion.div 
                      key={ws.id}
                      whileHover={{ y: -10 }}
                      onClick={() => fetchTelemetry(ws.id)}
                      className="bg-[#111218] border border-gray-800 p-8 rounded-[3rem] hover:border-red-600/50 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8">
                        <div className={`w-3 h-3 rounded-full ${ws.is_verified ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-amber-500 shadow-[0_0_15px_#f59e0b]'} animate-pulse`} />
                      </div>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <Car size={24} className="text-red-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white uppercase italic tracking-tighter group-hover:text-red-500 transition-colors">{ws.full_name}</h4>
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{ws.id.substring(0,8)}</span>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center bg-black/40 px-5 py-3 rounded-xl border border-white/5">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Fleet Status</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${ws.booking_count > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {ws.booking_count > 0 ? 'ACTIVE MISSIONS' : 'STANDBY'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-black/40 px-5 py-4 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                            <span className="text-xl font-black text-white">{ws.driver_count}</span>
                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Drivers</span>
                          </div>
                          <div className="bg-black/40 px-5 py-4 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                            <span className="text-xl font-black text-white">{ws.van_count}</span>
                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Vans</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Comm Link</span>
                          <span className="text-[10px] font-bold text-white/50">{ws.email}</span>
                        </div>
                        <ChevronRight className="text-gray-800 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {workshops.map(ws => (
                  <div key={ws.id} className="bg-[#111218] border border-gray-800 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-red-600/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center">
                        <Clock size={28} className="text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{ws.full_name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={12} /> {ws.operational_days}
                          </span>
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={12} /> {ws.operational_timings}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedWorkshopForSchedule(ws);
                        setNewScheduleDays(ws.operational_days);
                        setNewScheduleTimings(ws.operational_timings);
                        setIsScheduleModalOpen(true);
                      }}
                      className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      Input Schedule
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      case 'USERS':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                 <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Client <span className="text-red-600">Database</span></h2>
                 <p className="text-gray-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Platform intelligence and user activity logs</p>
              </div>
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="SEARCH CLIENTS..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full bg-[#111218] border border-gray-800 rounded-2xl py-4 pl-16 pr-6 text-white font-black text-[10px] tracking-widest outline-none focus:border-red-600 transition-all placeholder:text-gray-800"
                />
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full py-20 text-center">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-white/10 rounded-full animate-spin mx-auto"/>
                  <p className="text-gray-600 font-black uppercase tracking-widest text-[10px] mt-6">Decrypting Identity Servers...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-[#111218] rounded-[3rem] border border-gray-800 border-dashed">
                  <Activity size={40} className="text-gray-800 mx-auto mb-6" />
                  <p className="text-gray-600 font-black uppercase tracking-widest text-xs">No identities recognized in this database</p>
                </div>
              ) : (
                users.map(u => (
                  <motion.div 
                    key={u.id}
                    whileHover={{ y: -10 }}
                    onClick={() => fetchTelemetry(u.id)}
                    className="bg-[#111218] border border-gray-800 p-8 rounded-[3rem] hover:border-red-600/50 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Users size={24} className="text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter group-hover:text-red-500 transition-colors">{u.full_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_verified ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">ID: {u.id.substring(0,8)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                      <div className="bg-black/40 px-5 py-4 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                        <span className="text-xl font-black text-white">{u.vehicle_count}</span>
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Assets</span>
                      </div>
                      <div className="bg-black/40 px-5 py-4 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                        <span className="text-xl font-black text-white">{u.booking_count}</span>
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">History</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Email Node</span>
                        <span className="text-[10px] font-bold text-white/50">{u.email}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleImpersonate(u.id); }} className="p-2 bg-emerald-600/10 border border-emerald-600/30 rounded-lg text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all">
                          <Zap size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); if(confirm(`DELETE ${u.full_name}?`)) handleUserAction(u.id, 'DELETE'); }} className="p-2 bg-red-600/10 border border-red-600/30 rounded-lg text-red-500 hover:bg-red-600 hover:text-white transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        );
      case 'QUERIES':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <header className="flex justify-between items-end">
              <div>
                 <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Support <span className="text-red-600">Center</span></h2>
                 <p className="text-gray-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">External communications and ticket routing</p>
              </div>
            </header>
            <div className="grid grid-cols-1 gap-6">
              {queriesLoading ? <div className="text-center p-20"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"/></div> : 
               queries.map((q) => (
                 <div key={q.id} className="bg-[#111218] backdrop-blur-3xl border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-red-600/30 transition-all duration-700">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border ${q.status === 'PENDING' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'}`}>{q.status}</span>
                        <h4 className="text-lg font-black text-white mt-4">{q.subject}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">From: {q.name} &lt;{q.email}&gt; | {new Date(q.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedQuery(q)} className="w-10 h-10 bg-gray-900 border-gray-800 border border-gray-800 rounded-xl flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-colors group/btn">
                          <MessageSquare size={16} className="text-gray-400 group-hover/btn:text-white" />
                        </button>
                        <button onClick={() => toggleQueryStatus(q.id, q.status)} className="w-10 h-10 bg-gray-900 border-gray-800 border border-gray-800 rounded-xl flex items-center justify-center hover:bg-white/[0.1] transition-colors group/btn">
                          <CheckCircle2 size={16} className="text-gray-400 group-hover/btn:text-emerald-500" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 bg-black/40 border border-gray-700 rounded-2xl relative z-10">
                      <p className="text-sm text-gray-300 font-medium italic">"{q.message}"</p>
                    </div>
                    {q.admin_reply && (
                      <div className="mt-4 p-6 bg-red-600/5 border border-red-600/20 rounded-2xl relative z-10">
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-2">Relayed Response</span>
                        <p className="text-sm text-gray-300 font-medium">"{q.admin_reply}"</p>
                      </div>
                    )}
                 </div>
               ))
              }
            </div>

            <AnimatePresence>
              {selectedQuery && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6 bg-black/80 backdrop-blur-xl">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl bg-[#0a0b10] border border-gray-800 p-6 lg:p-10 rounded-3xl lg:rounded-[3rem] shadow-2xl">
                    <header className="mb-8 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 block">Dispatching Response</span>
                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Secure <span className="text-red-600">Relay</span></h3>
                      </div>
                      <button onClick={() => setSelectedQuery(null)} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><X size={20} /></button>
                    </header>
                    <div className="space-y-6">
                      <div className="bg-black/40 p-6 rounded-2xl border border-gray-700">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Incoming Payload</p>
                        <p className="text-sm text-gray-400 font-medium italic">"{selectedQuery.message}"</p>
                      </div>
                      <form onSubmit={handleReply} className="space-y-6">
                        <textarea required value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={5} className="w-full bg-gray-900 border-gray-800 border border-gray-800 rounded-[2rem] px-6 py-6 text-white font-medium text-sm focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-gray-800 resize-none font-sans" placeholder="Type your encrypted response here..." />
                        <button type="submit" disabled={isReplying} className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:bg-gray-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-red-900/40 transition-all flex items-center justify-center gap-3">
                          {isReplying ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Disseminate Protocol</>}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 'LOGS':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <header>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Audit <span className="text-red-600">Terminal</span></h2>
              <p className="text-gray-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Cryptographic verification of all platform events</p>
            </header>
            <div className="bg-black border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="bg-gray-900 border-gray-800 p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TerminalIcon size={18} className="text-red-600" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">sys_audit.log — active_monitoring</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-gray-800">
                    <tr>
                      <th className="px-8 py-6">Timestamp</th>
                      <th className="px-8 py-6">Operation</th>
                      <th className="px-8 py-6">Severity</th>
                      <th className="px-8 py-6">Internal_Trace</th>
                    </tr>
                  </thead>
                  <tbody className="font-sans text-xs divide-y divide-white/[0.02]">
                    {logsLoading ? <tr><td colSpan={4} className="p-20 text-center"><div className="w-6 h-6 border-2 border-red-600 border-t-white/10 rounded-full animate-spin mx-auto"/></td></tr> : 
                     logs.map(log => (
                       <tr key={log.id} className="hover:bg-[#111218] transition-colors group">
                          <td className="px-8 py-4 text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</td>
                          <td className="px-8 py-4 text-white font-bold group-hover:text-red-500 transition-colors">{log.event_type}</td>
                          <td className="px-8 py-4"><span className={`font-black text-[10px] uppercase tracking-widest ${log.severity === 'ERROR' ? 'text-red-500' : 'text-emerald-500'}`}>{log.severity}</span></td>
                          <td className="px-8 py-4 text-gray-400 group-hover:text-white">{log.description}</td>
                       </tr>
                     ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );
      case 'SETTINGS':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <header>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">System <span className="text-red-600">Architect</span></h2>
              <p className="text-gray-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Global platform hardware & logic configuration</p>
            </header>
            <div className="grid grid-cols-1 gap-6 pb-20">
              {settingsLoading ? <div className="p-20 text-center"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent flex mx-auto rounded-full justify-center items-center animate-spin" /></div> : 
               settings.sort((a, b) => a.key.localeCompare(b.key)).map(s => (
                 <div key={s.key} className="bg-[#111218] border border-gray-800 p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-red-600/30 transition-all duration-700">
                    <div className="max-w-2xl">
                      <h3 className="text-lg font-black text-white tracking-widest uppercase italic group-hover:text-red-600 transition-colors">{s.key.replace(/_/g, ' ')}</h3>
                      <p className="text-gray-500 text-sm font-medium mt-3 leading-relaxed">{s.description}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      {s.key === 'maintenance_mode' ? (
                        <select 
                          value={s.value} 
                          onChange={(e) => updateSetting(s.key, e.target.value)}
                          className="bg-gray-900 border-gray-800 border border-gray-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:ring-1 focus:ring-red-600 appearance-none cursor-pointer w-44 text-center hover:bg-black transition-all"
                        >
                          <option value="false">OFF (Live Operational)</option>
                          <option value="true">ON (Maintenance Mode)</option>
                          <option value="lockdown">EMERGENCY LOCKDOWN</option>
                        </select>
                      ) : s.key === 'theme_sync' ? (
                        <select 
                          value={s.value} 
                          onChange={(e) => updateSetting(s.key, e.target.value)}
                          className="bg-gray-900 border-gray-800 border border-gray-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:ring-1 focus:ring-red-600 appearance-none cursor-pointer w-44 text-center hover:bg-black transition-all"
                        >
                          <option value="dark">Stealth Dark</option>
                          <option value="light">Onyx Light</option>
                          <option value="system">System Default</option>
                          <option value="high_contrast">High Contrast</option>
                          <option value="cyberpunk">Cyberpunk Neon</option>
                        </select>
                      ) : s.key === 'support_priority' ? (
                        <select 
                          value={s.value} 
                          onChange={(e) => updateSetting(s.key, e.target.value)}
                          className="bg-gray-900 border-gray-800 border border-gray-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:ring-1 focus:ring-red-600 appearance-none cursor-pointer w-44 text-center hover:bg-black transition-all"
                        >
                          <option value="LOW">LOW (Passive)</option>
                          <option value="NORMAL">NORMAL (Active)</option>
                          <option value="HIGH">HIGH (Urgent)</option>
                          <option value="CRITICAL">CRITICAL (Priority)</option>
                          <option value="ULTRA">ULTRA (Immediate)</option>
                          <option value="EMERGENCY">EMERGENCY (Full Relay)</option>
                        </select>
                      ) : (s.value === 'true' || s.value === 'false') ? (
                        <button 
                          onClick={() => updateSetting(s.key, s.value === 'true' ? 'false' : 'true')} 
                          className={`w-16 h-8 rounded-full relative transition-all border ${s.value === 'true' ? 'bg-red-600 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-white/[0.05] border-gray-800'}`}
                        >
                           <motion.div animate={{ x: s.value === 'true' ? 32 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg" />
                        </button>
                      ) : (s.key.includes('percentage') || s.key.includes('price') || s.key.includes('minutes') || s.key.includes('max')) ? (
                        <div className="relative flex items-center bg-gray-900 border-gray-800 border border-gray-800 rounded-xl px-4 py-3 w-44">
                          <input 
                            type="number" 
                            defaultValue={s.value} 
                            onBlur={(e) => updateSetting(s.key, e.target.value)}
                            className="bg-transparent text-white text-[10px] font-black uppercase tracking-[0.2em] outline-none w-full text-center" 
                          />
                          <span className="text-[8px] font-black text-red-600 ml-1">
                            {s.key.includes('percentage') ? '%' : s.key.includes('minutes') ? 'MINS' : s.key.includes('price') ? 'INR' : 'U'}
                          </span>
                        </div>
                      ) : (
                        <div className="relative group/sel">
                          <input 
                            type="text" 
                            defaultValue={s.value} 
                            onBlur={(e) => updateSetting(s.key, e.target.value)}
                            className="bg-gray-900 border-gray-800 border border-gray-800 rounded-xl px-6 lg:px-10 py-3 text-white text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:ring-1 focus:ring-red-600 appearance-none cursor-text w-44 lg:w-48 text-center" 
                          />
                        </div>
                      )}
                    </div>
                 </div>
               ))
              }
            </div>
          </motion.div>
        );
      case 'LOGISTICS':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 h-full flex flex-col">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Logistics <span className="text-red-600">Hub</span></h2>
                <p className="text-gray-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Real-time global fleet positioning and mission radar</p>
              </div>
              <div className="flex gap-4">
                <div className="px-6 py-3 bg-red-600/10 border border-red-600/30 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Active Units</span>
                  <span className="text-xl font-black text-white">{activeTracking.length}</span>
                </div>
                <button 
                  onClick={fetchActiveTracking}
                  className="px-6 py-4 bg-gray-900 hover:bg-black border border-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all flex items-center gap-2"
                >
                  <Activity size={14} className={trackingLoading ? "animate-pulse" : ""} /> Refresh Radar
                </button>
              </div>
            </header>
            
            <div className="flex-1 min-h-[600px] mb-10">
              {trackingLoading && activeTracking.length === 0 ? (
                <div className="w-full h-full bg-[#111218] rounded-[3rem] flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Synchronizing Orbital Feed...</p>
                </div>
              ) : (
                <GlobalLogisticsMap activeNodes={activeTracking} />
              )}
            </div>
          </motion.div>
        );
      case 'ABOUT': return <AboutPage />;
    }
  };

  const handleNavClick = (view: AdminView) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0b10] text-white font-sans overflow-hidden font-inter">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#111218]/95 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-5 z-[70]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-950/40">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tighter text-white uppercase italic">SERV<span className="text-red-600">SYNC</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsAboutModalOpen(true)} className="p-2 text-gray-400 hover:text-white transition-colors">
            <UserCircle size={24} />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[75]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — hidden on mobile, slide-in when toggled */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-80 bg-[#111218] backdrop-blur-3xl border-r border-gray-800 flex flex-col z-[80] transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-10 border-b border-gray-800 flex flex-col gap-2">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tighter text-white uppercase italic">SERV<span className="text-red-600">SYNC</span></span>
              <span className="text-[10px] text-gray-600 block leading-none tracking-[0.4em] font-black mt-1">OPERATIONS</span>
            </div>
          </div>
          {adminEmail && (
            <div className="mt-4 px-3 py-2.5 bg-[#111218] border border-gray-800 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></div>
              <span className="text-[9px] text-gray-400 font-bold tracking-widest truncate">{adminEmail}</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-8 space-y-3 overflow-y-auto">
          <AdminNavLink icon={<LayoutDashboard size={20} />} label="Intelligence" active={currentView === 'DASHBOARD'} onClick={() => handleNavClick('DASHBOARD')} />
          <AdminNavLink icon={<Car size={20} />} label="Workshops" active={currentView === 'WORKSHOPS'} onClick={() => handleNavClick('WORKSHOPS')} />
          <AdminNavLink icon={<Users size={20} />} label="Clients" active={currentView === 'USERS'} onClick={() => handleNavClick('USERS')} />
          <AdminNavLink icon={<MessageSquare size={20} />} label="Support Center" active={currentView === 'QUERIES'} onClick={() => handleNavClick('QUERIES')} />
          <AdminNavLink icon={<Bell size={20} />} label="Signal Relay" active={currentView === 'COMMUNICATIONS'} onClick={() => handleNavClick('COMMUNICATIONS')} />
          <AdminNavLink icon={<TerminalIcon size={20} />} label="Audit Terminal" active={currentView === 'LOGS'} onClick={() => handleNavClick('LOGS')} />
          <AdminNavLink icon={<Radar size={20} />} label="Logistics Hub" active={currentView === 'LOGISTICS'} onClick={() => handleNavClick('LOGISTICS')} />
          <AdminNavLink icon={<Settings size={20} />} label="Global Config" active={currentView === 'SETTINGS'} onClick={() => handleNavClick('SETTINGS')} />
        </nav>

        <div className="p-8 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-red-600 hover:bg-red-600/5 rounded-2xl transition-all font-black uppercase text-[10px] tracking-[0.3em] border border-red-600/20 shadow-lg group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> TERMINATE SESSION
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-18 bg-[#111218]/95 backdrop-blur-2xl border-t border-gray-800 flex items-center justify-around px-1 z-[70] pb-1 pt-1">
        <MobileAdminTab icon={<LayoutDashboard size={18} />} label="Intel" active={currentView === 'DASHBOARD'} onClick={() => setCurrentView('DASHBOARD')} />
        <MobileAdminTab icon={<Car size={18} />} label="Shop" active={currentView === 'WORKSHOPS'} onClick={() => setCurrentView('WORKSHOPS')} />
        <MobileAdminTab icon={<Users size={18} />} label="Users" active={currentView === 'USERS'} onClick={() => setCurrentView('USERS')} />
        <MobileAdminTab icon={<MessageSquare size={18} />} label="Support" active={currentView === 'QUERIES'} onClick={() => setCurrentView('QUERIES')} />
        <MobileAdminTab icon={<Radar size={18} />} label="Fleet" active={currentView === 'LOGISTICS'} onClick={() => setCurrentView('LOGISTICS')} />
        <MobileAdminTab icon={<TerminalIcon size={18} />} label="Logs" active={currentView === 'LOGS'} onClick={() => setCurrentView('LOGS')} />
        <MobileAdminTab icon={<Settings size={18} />} label="Config" active={currentView === 'SETTINGS'} onClick={() => setCurrentView('SETTINGS')} />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        <header className="hidden lg:flex h-24 border-b border-gray-800 items-center justify-between px-12 backdrop-blur-md sticky top-0 z-40 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse" />
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Authorized Access Only — {currentView}</h1>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsAboutModalOpen(true)}
              className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all group"
            >
              <UserCircle size={16} className="group-hover:scale-110 transition-transform" />
              About Me
            </button>
            <div className="flex items-center gap-6 border-l border-gray-800 pl-6 ml-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-gray-800 rounded-xl border border-gray-700">
                <Search size={14} className="text-gray-600" />
                <input type="text" placeholder="CMD_SEARCH..." className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-gray-400 placeholder:text-gray-800 w-32" />
              </div>
              <div className="w-10 h-10 rounded-full border border-red-600 p-0.5 group cursor-pointer hover:border-white transition-all">
                <div className="w-full h-full rounded-full bg-red-600 overflow-hidden flex items-center justify-center font-black text-xs text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]">AD</div>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 pt-20 pb-24 lg:p-12 lg:pt-12 lg:pb-12">
          <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Telemetry Slideover Panel */}
      <AnimatePresence>
        {selectedTelemetry && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTelemetry(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full lg:w-[32rem] bg-[#0c0d12] border-l border-white/10 z-[100] shadow-2xl flex flex-col font-sans"
            >
              <div className="p-8 border-b border-white/10 bg-[#111218] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">
                    <Radar size={12} /> Identity Telemetry Feed
                  </div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                    {selectedTelemetry.full_name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedTelemetry(null)}
                  className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Meta Data Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Real IP Address</p>
                    <p className="text-sm font-black text-white font-mono">{selectedTelemetry.last_login_ip}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Active Missions</p>
                    <p className="text-sm font-black text-red-500">{selectedTelemetry.active_missions_count}</p>
                  </div>
                </div>

                {/* Identity Shield Info */}
                <div className={`p-6 rounded-2xl border flex items-center gap-4 ${selectedTelemetry.is_verified ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedTelemetry.is_verified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security Clearance</p>
                    <p className={`text-sm font-black tracking-tighter uppercase italic ${selectedTelemetry.is_verified ? 'text-emerald-500' : 'text-red-500'}`}>
                      {selectedTelemetry.is_verified ? 'Authorized Personnel (Verified)' : 'Identity Unconfirmed / Restricted'}
                    </p>
                  </div>
                </div>

                {/* Recent Missions Table */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <BarChart3 size={14} /> Mission History Summary
                  </div>
                  <div className="space-y-2">
                    {selectedTelemetry.recent_bookings.length > 0 ? selectedTelemetry.recent_bookings.map((booking: any) => (
                      <div key={booking.id} className="bg-white/[0.01] border border-white/[0.05] p-4 rounded-xl flex items-center justify-between group hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-3">
                          <Car size={16} className="text-red-600" />
                          <div>
                            <p className="text-xs font-bold text-white uppercase">{booking.vehicle.brand} {booking.vehicle.model}</p>
                            <p className="text-[10px] text-gray-600 uppercase font-bold">{booking.service.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-white uppercase tracking-tighter">${booking.total_amount}</p>
                          <p className={`text-[9px] font-black uppercase ${booking.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>{booking.status}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-10 text-center border border-white/5 border-dashed rounded-2xl italic text-gray-600 text-xs font-medium">No missions logged in archive</div>
                    )}
                  </div>
                </div>

                {/* Provider Fleet Details */}
                {selectedTelemetry.fleet && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <Car size={14} /> Registered Fleet Assets
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-4">
                      {selectedTelemetry.fleet.vans.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[8px] font-black text-red-600 uppercase tracking-[0.2em] mb-2">Towing Vans ({selectedTelemetry.fleet.vans.length})</p>
                          {selectedTelemetry.fleet.vans.map((v: any) => (
                            <div key={v.id} className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg border border-white/[0.02]">
                              <div>
                                <h6 className="text-white text-xs font-black uppercase tracking-widest">{v.license_plate}</h6>
                                <p className="text-[10px] text-gray-500 font-bold">{v.model_name}</p>
                              </div>
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{v.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-gray-600 italic">No registered vans</p>}

                      {selectedTelemetry.fleet.drivers.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[8px] font-black text-red-600 uppercase tracking-[0.2em] mb-2">Drivers ({selectedTelemetry.fleet.drivers.length})</p>
                          {selectedTelemetry.fleet.drivers.map((d: any) => (
                            <div key={d.id} className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg border border-white/[0.02]">
                              <div>
                                <h6 className="text-white text-xs font-black">{d.full_name}</h6>
                                <p className="text-[10px] text-gray-500 font-bold">{d.phone_number}</p>
                              </div>
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{d.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-gray-600 italic">No registered drivers</p>}
                    </div>
                  </div>
                )}

                {/* Internal Event Log (Audit) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <TerminalIcon size={14} /> Comprehensive Identity Log
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3 font-mono">
                    {selectedTelemetry.recent_logs.map((log: AdminLog) => (
                      <div key={log.id} className="text-[10px] leading-relaxed border-b border-white/[0.02] last:border-0 pb-2">
                        <span className="text-gray-700 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`mr-2 font-black ${log.severity === 'CRITICAL' ? 'text-red-500' : 'text-gray-400'}`}>
                          {log.event_type}
                        </span>
                        <span className="text-gray-600 italic">"{log.description}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/10 bg-[#08090d]">
                <button 
                  onClick={() => handleImpersonate(selectedTelemetry.id)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-red-900/20 transition-all group"
                >
                  <Zap size={14} className="group-hover:animate-pulse" /> Initialize Impersonation Protocol
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin 2FA Authorization Modal */}
      <AnimatePresence>
        {isOtpModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] lg:w-full max-w-md z-[210] p-1 bg-[#0c0d12] rounded-3xl lg:rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
              
              <div className="p-10 text-center space-y-8">
                <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mx-auto border border-red-600/20">
                  <ShieldAlert size={40} className="text-red-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Identity <span className="text-red-600">Verification</span></h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                    A high-security authorization code has been dispatched to your terminal. Enter it below to proceed with the identity handover.
                  </p>
                </div>

                <form onSubmit={handleConfirmImpersonation} className="space-y-6">
                  <input 
                    type="text" maxLength={6} placeholder="######"
                    value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-black border border-white/10 rounded-2xl py-6 text-center text-4xl font-black tracking-[0.5em] text-red-600 focus:border-red-600 outline-none transition-all placeholder:text-gray-900"
                    required autoFocus
                  />
                  
                  <div className="flex gap-4">
                    <button 
                      type="button" onClick={() => setIsOtpModalOpen(false)}
                      className="flex-1 py-4 border border-white/5 bg-white/5 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Abandond
                    </button>
                    <button 
                      type="submit" disabled={isVerifyingOtp || otpValue.length !== 6}
                      className="flex-2 px-10 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-red-900/20"
                    >
                      {isVerifyingOtp ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Authorize Link"}
                    </button>
                  </div>
                </form>

                <div className="flex items-center justify-center gap-2 text-[8px] font-black text-gray-700 uppercase tracking-widest pt-4 border-t border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  Secondary Authentication Protocol Active (v4.0)
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Telemetry Loading State */}
      <AnimatePresence>
        {telemetryLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[110] flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(220,38,38,0.4)]" />
              <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Syncing Telemetry...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Me Modal */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAboutModalOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg z-[310] bg-[#0c0d12] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-600/20 to-transparent" />
              <div className="p-12 text-center relative z-10">
                <div className="w-24 h-24 bg-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-900/40 border-4 border-white/10">
                  <UserCircle size={48} className="text-white" />
                </div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">System <span className="text-red-600">Administrator</span></h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10">Identity Node: {adminEmail || 'ROOT_ACCESS'}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-left">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Clearance</p>
                    <p className="text-xs font-black text-emerald-500 uppercase">Level 10 (Root)</p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-left">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xs font-black text-white uppercase animate-pulse">Online / Synced</p>
                  </div>
                </div>

                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-10">
                  <p className="text-xs text-gray-400 font-medium leading-relaxed italic">
                    "Overseeing the ServSync ecosystem with precision and absolute control. This terminal is authorized for high-level operations only."
                  </p>
                </div>

                <button 
                  onClick={() => setIsAboutModalOpen(false)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all"
                >
                  Close Identity File
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Input Schedule Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && selectedWorkshopForSchedule && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsScheduleModalOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-[310] bg-[#0c0d12] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-600/20">
                  <Clock size={28} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Edit <span className="text-red-600">Schedule</span></h3>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{selectedWorkshopForSchedule.full_name}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateSchedule} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} className="text-red-600" /> Operational Days
                  </label>
                  <select 
                    value={newScheduleDays}
                    onChange={(e) => setNewScheduleDays(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xs h-16 uppercase tracking-widest focus:border-red-600 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Mon-Sun">Monday - Sunday (Full Week)</option>
                    <option value="Mon-Sat">Monday - Saturday (Except Sun)</option>
                    <option value="Mon-Fri">Monday - Friday (Weekdays Only)</option>
                    <option value="Weekend Only">Saturday - Sunday (Weekends Only)</option>
                    <option value="24/7">24 / 7 Operations</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Clock size={12} className="text-red-600" /> Operational Timings
                  </label>
                  <select 
                    value={newScheduleTimings}
                    onChange={(e) => setNewScheduleTimings(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xs h-16 uppercase tracking-widest focus:border-red-600 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="24 Hours">24 Hours / Always Open</option>
                    <option value="9 AM - 6 PM">Standard (9 AM - 6 PM)</option>
                    <option value="8 AM - 8 PM">Extended (8 AM - 8 PM)</option>
                    <option value="10 AM - 10 PM">Night Shift (10 AM - 10 PM)</option>
                    <option value="Open on Call">By Appointment / On Call</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" onClick={() => setIsScheduleModalOpen(false)}
                    className="flex-1 py-4 border border-white/5 bg-white/5 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={isUpdatingSchedule}
                    className="flex-2 px-10 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-red-900/20"
                  >
                    {isUpdatingSchedule ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Update Schedule"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileAdminTab({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 relative ${active ? 'text-red-500' : 'text-gray-600 hover:text-gray-400'}`}
    >
      <div className={`p-2 rounded-lg transition-all duration-300 ${active ? 'bg-red-600/10' : ''}`}>
        {icon}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-colors ${active ? 'text-red-500' : 'text-gray-800'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="mobile-nav-indicator"
          className="absolute -bottom-1 w-1 h-1 bg-red-600 rounded-full shadow-[0_0_8px_#ef4444]"
        />
      )}
    </button>
  );
}

function AdminNavLink({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-500 relative group overflow-hidden ${active ? 'bg-red-600 text-white shadow-2xl shadow-red-900/40' : 'text-gray-600 hover:text-white hover:bg-[#111218]'}`}>
      <span className={`transition-all duration-500 ${active ? 'animate-pulse' : 'group-hover:text-red-500 transition-colors'}`}>{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.25em]">{label}</span>
      {active && <motion.div layoutId="nav-indicator" className="absolute right-6 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]" />}
    </button>
  );
}

function StatCard({ label, value, icon, trend }: { label: string, value: string | number, icon: any, trend: string }) {
  return (
    <div className="bg-[#111218] backdrop-blur-3xl border border-gray-800 p-8 rounded-[3rem] hover:border-red-600/30 transition-all duration-700 group relative overflow-hidden flex flex-col gap-6 shadow-2xl">
      <div className="flex items-center justify-between relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gray-900 border-gray-800 border border-gray-800 group-hover:bg-red-600 transition-all duration-500">
          {icon}
        </div>
        <span className="text-[10px] font-black px-3 py-1 rounded-xl bg-gray-900 border-gray-800 border border-gray-800 text-red-500">{trend}</span>
      </div>
      <div className="relative z-10">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{label}</p>
        <h3 className="text-3xl font-black tracking-tighter text-white italic group-hover:text-red-500 transition-colors">{value}</h3>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </div>
  );
}