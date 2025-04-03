"use client"

import { useState } from "react"
import { ArrowRightIcon, FileTextIcon, FileSpreadsheetIcon, FileTypeIcon, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export function DashboardActions() {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<string | null>(null)

  const handleDownload = async (format: string) => {
    setIsDownloading(true)
    setDownloadFormat(format)

    try {
      // Fetch the report data from the API
      const response = await fetch(`/api/reports/download?format=${format}`)

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")

      // Set the filename based on the Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition")
      let filename = "inventory-report"

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Add the appropriate extension
      if (format === "pdf") {
        filename += ".pdf"
      } else if (format === "excel") {
        filename += ".xlsx"
      } else if (format === "csv") {
        filename += ".csv"
      }

      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Report Downloaded",
        description: `${format.toUpperCase()} report downloaded successfully`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading your report. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsDownloading(false)
      setDownloadFormat(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isDownloading}>
          {isDownloading ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Downloading {downloadFormat}...
            </>
          ) : (
            <>
              Download Report
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("pdf")} className="flex items-center">
          <FileTextIcon className="mr-2 h-4 w-4" />
          <span>PDF Document</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("excel")} className="flex items-center">
          <FileSpreadsheetIcon className="mr-2 h-4 w-4" />
          <span>Excel Spreadsheet</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("csv")} className="flex items-center">
          <FileTypeIcon className="mr-2 h-4 w-4" />
          <span>CSV File</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

