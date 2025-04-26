"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, RefreshCw, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { getSyncHistory, clearSyncHistory, type SyncHistoryEntry } from "@/lib/sync-history"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SyncHistory() {
  const [history, setHistory] = useState<SyncHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<SyncHistoryEntry | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    setLoading(true)
    try {
      const entries = await getSyncHistory(50)
      setHistory(entries)
    } catch (error) {
      console.error("Error loading sync history:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleClearHistory() {
    try {
      await clearSyncHistory()
      setHistory([])
      setClearDialogOpen(false)
    } catch (error) {
      console.error("Error clearing sync history:", error)
    }
  }

  function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>Recent database synchronization operations</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadHistory}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setClearDialogOpen(true)} disabled={history.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>No sync history</AlertTitle>
            <AlertDescription>No synchronization operations have been recorded yet.</AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">{formatDate(entry.timestamp)}</TableCell>
                  <TableCell>
                    {entry.success ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Check className="h-3 w-3 mr-1" /> Success
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        <X className="h-3 w-3 mr-1" /> Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.itemsSynced} synced, {entry.itemsFailed} failed
                  </TableCell>
                  <TableCell>{formatDuration(entry.duration)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{entry.message || "No message"}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(entry)}>
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Sync Details</DialogTitle>
                          <DialogDescription>{formatDate(entry.timestamp)}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium">Status</h4>
                              <p>
                                {entry.success ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    <Check className="h-3 w-3 mr-1" /> Success
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 text-red-700">
                                    <X className="h-3 w-3 mr-1" /> Failed
                                  </Badge>
                                )}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Duration</h4>
                              <p>{formatDuration(entry.duration)}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Message</h4>
                            <p className="text-sm">{entry.message || "No message"}</p>
                          </div>
                          {entry.details && entry.details.length > 0 ? (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Items</h4>
                              <div className="border rounded-md max-h-[300px] overflow-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Type</TableHead>
                                      <TableHead>ID</TableHead>
                                      <TableHead>Operation</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {entry.details.map((detail, i) => (
                                      <TableRow key={i}>
                                        <TableCell>{detail.type}</TableCell>
                                        <TableCell className="font-mono text-xs">{detail.id}</TableCell>
                                        <TableCell>{detail.operation}</TableCell>
                                        <TableCell>
                                          {detail.success ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                              <Check className="h-3 w-3 mr-1" /> Success
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="bg-red-50 text-red-700">
                                              <X className="h-3 w-3 mr-1" /> Failed
                                            </Badge>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ) : (
                            <Alert>
                              <AlertTitle>No details available</AlertTitle>
                              <AlertDescription>
                                No detailed information is available for this sync operation.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Clear History Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Sync History</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all sync history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleClearHistory}>
              Clear History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
