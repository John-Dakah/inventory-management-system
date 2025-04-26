import { Suspense } from "react"
import SyncStatus from "@/components/sync-status"

export default function SyncDashboardPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Database Synchronization Dashboard</h1>

      <div className="grid gap-6">
        <Suspense fallback={<div>Loading sync status...</div>}>
          <SyncStatus />
        </Suspense>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How Synchronization Works</h2>

          <div className="space-y-4 text-sm">
            <p>
              This system uses an offline-first approach where data is stored locally in IndexedDB and synchronized with
              the PostgreSQL database when online.
            </p>

            <h3 className="font-medium">Sync Process:</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>Changes made offline are stored in IndexedDB with a "pending" sync status</li>
              <li>The sync service periodically checks for pending changes</li>
              <li>When online, changes are sent to the server via the /api/sync endpoint</li>
              <li>The server processes each change and updates the PostgreSQL database</li>
              <li>Successfully synced items are marked as "synced" in IndexedDB</li>
            </ol>

            <h3 className="font-medium">Conflict Resolution:</h3>
            <p>
              The system uses a "last write wins" approach for conflict resolution. Each record includes a "modified"
              timestamp that is used to determine which version is more recent.
            </p>

            <h3 className="font-medium">Manual Sync:</h3>
            <p>
              You can manually trigger synchronization by clicking the "Sync Now" button above. This is useful when you
              want to immediately push changes to the server.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
