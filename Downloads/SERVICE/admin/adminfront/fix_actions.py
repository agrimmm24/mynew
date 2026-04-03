filepath = r"c:\Users\Lenovo\Downloads\SERVICE\admin\adminfront\src\pages\AdminDash.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Lines 367-393 (1-indexed) contain the old Protocol Actions td
# Replace lines 366..392 (0-indexed)
new_lines = '''                           <td className="px-8 py-6 text-center">
                             <div className="flex items-center justify-center gap-2 flex-wrap">
                              <button onClick={() => fetchTelemetry(u.id)} className="w-9 h-9 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center hover:bg-red-600/10 hover:border-red-600 transition-all group/btn" title="Telemetry">
                                <Radar size={14} className="text-gray-500 group-hover/btn:text-red-500" />
                              </button>
                              <button onClick={() => handleImpersonate(u.id)} className="w-9 h-9 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center hover:bg-emerald-600/10 hover:border-emerald-600 transition-all group/btn" title="Impersonate">
                                <Zap size={14} className="text-gray-500 group-hover/btn:text-emerald-500" />
                              </button>
                              <button onClick={() => handleUserAction(u.id, u.is_verified ? 'REVOKE' : 'VERIFY')} className={`w-9 h-9 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center transition-all group/btn ${u.is_verified ? 'hover:bg-amber-600/10 hover:border-amber-600' : 'hover:bg-red-600/10 hover:border-red-600'}`} title={u.is_verified ? "Revoke" : "Verify"}>
                                {u.is_verified ? <Ban size={14} className="text-gray-500 group-hover/btn:text-amber-500" /> : <BadgeCheck size={14} className="text-gray-500 group-hover/btn:text-red-500" />}
                              </button>
                              <button onClick={() => handleUserAction(u.id, 'RESET_PASSWORD')} className="w-9 h-9 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center hover:bg-blue-600/10 hover:border-blue-600 transition-all group/btn" title="Reset Password">
                                <KeyRound size={14} className="text-gray-500 group-hover/btn:text-blue-500" />
                              </button>
                              <button onClick={() => { setEmailRecipient(u.email); setCurrentView('COMMUNICATIONS'); }} className="w-9 h-9 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center hover:bg-cyan-600/10 hover:border-cyan-600 transition-all group/btn" title="Send Email">
                                <Send size={14} className="text-gray-500 group-hover/btn:text-cyan-500" />
                              </button>
                              <button onClick={() => { if(confirm(`DELETE ${u.full_name}?`)) handleUserAction(u.id, 'DELETE'); }} className="w-9 h-9 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center hover:bg-red-600/10 hover:border-red-600 transition-all group/btn" title="Delete User">
                                <Trash2 size={14} className="text-gray-500 group-hover/btn:text-red-500" />
                              </button>
                             </div>
                            </td>
'''.splitlines(True)

lines[366:393] = new_lines

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("SUCCESS: Protocol Actions expanded with 6 action buttons.")
