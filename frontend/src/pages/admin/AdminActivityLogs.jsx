import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'

export default function AdminActivityLogs() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', page],
    queryFn: () => adminAPI.getActivityLogs({ page, limit: 50 }).then(r => r.data),
  })

  const ACTION_COLORS = {
    'user.login':'text-blue-600', 'user.register':'text-green-600',
    'user.password_changed':'text-amber-600', 'admin.order_status_updated':'text-purple-600',
    'order.created':'text-gold-600', 'admin.user_banned':'text-red-600',
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">Activity Logs</h1>

      <div className="bg-white shadow-luxury border border-obsidian-50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-obsidian text-white">
              {['Time','User','Action','IP','Details'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-widests uppercase font-sans">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian-50">
            {isLoading ? (
              Array(15).fill(0).map((_,i)=><tr key={i}><td colSpan={5}><div className="h-8 skeleton m-3 rounded"/></td></tr>)
            ) : data?.logs?.map(log=>(
              <tr key={log._id} className="hover:bg-cream transition-colors">
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <p className="text-xs font-sans text-obsidian-500">{new Date(log.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs font-sans text-obsidian-400">{new Date(log.createdAt).toLocaleTimeString()}</p>
                </td>
                <td className="px-4 py-2.5">
                  {log.user ? (
                    <p className="text-sm font-sans">{log.user.firstName} {log.user.lastName}</p>
                  ) : <span className="text-xs text-obsidian-300 font-sans">System</span>}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-sans font-medium ${ACTION_COLORS[log.action] || 'text-obsidian-600'}`}>{log.action}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs font-sans text-obsidian-400">{log.ip || '—'}</span>
                </td>
                <td className="px-4 py-2.5">
                  {log.details && (
                    <span className="text-xs font-sans text-obsidian-400 truncate max-w-[200px] block">
                      {JSON.stringify(log.details).slice(0,80)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-obsidian-50 flex items-center justify-between">
            <p className="text-xs text-obsidian-400 font-sans">{data.pagination.total} total entries</p>
            <div className="flex gap-2">
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40">Prev</button>
              <button disabled={page===data.pagination.pages} onClick={()=>setPage(p=>p+1)} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
