import { useCMS } from '../CMSContext';

export const AuditTrail = () => {
  const { auditLogs } = useCMS();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-gray-500">Track all administrative actions and content changes.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Content Type</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!auditLogs || auditLogs.length === 0) ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No logs recorded yet.</td>
                </tr>
              ) : (
                (auditLogs || []).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal-dark flex items-center justify-center text-xs font-bold">
                          {log.userName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        log.action === 'Create' ? 'bg-green-100 text-green-700' :
                        log.action === 'Update' ? 'bg-blue-100 text-blue-700' :
                        log.action === 'Delete' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{log.contentType}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{log.contentTitle}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.details || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};