import { useState } from 'react'
import { Badge, Card, ErrorBox, PageHeader, Pager, Spinner } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import type { ActivityLog, Paginated } from '../types'
import { fmtDate } from '../utils/format'

export default function ActivityLogPage() {
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useFetch<Paginated<ActivityLog>>(`/admin/activity-logs/?page=${page}&page_size=25`)
  return (
    <div>
      <PageHeader title="Activity log" subtitle="Who changed what. Passwords and tokens are never recorded." />
      <Card className="!p-0">
        {error ? <div className="p-4"><ErrorBox message={error} onRetry={reload} /></div> : loading && !data ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
                <th className="px-4 py-3">When</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Object</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {data?.results.map((l) => (
                  <tr key={l.id}><td className="whitespace-nowrap px-4 py-2.5 text-slate-500">{fmtDate(l.created_at)}</td>
                    <td className="px-4 py-2.5 font-medium">{l.username || '—'}</td>
                    <td className="px-4 py-2.5"><Badge tone={l.action === 'delete' ? 'red' : l.action === 'create' ? 'green' : 'blue'}>{l.action}</Badge></td>
                    <td className="px-4 py-2.5">{l.object_type} {l.object_id && `#${l.object_id}`} <span className="text-slate-500">{l.object_repr}</span></td></tr>
                ))}
                {!data?.results.length && <tr><td colSpan={4} className="py-12 text-center text-slate-500">No activity yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {data && <div className="px-4 pb-4"><Pager page={page} count={data.count} pageSize={25} onPage={setPage} /></div>}
      </Card>
    </div>
  )
}
