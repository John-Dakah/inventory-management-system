import * as React from "react"
import { cn } from "@/lib/utils"

// Enhanced Table with location persistence
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />,
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    locationPersist?: boolean
  }
>(({ className, locationPersist = false, ...props }, ref) => {
  // If locationPersist is true, we'll add data attributes to help with CSS targeting
  const enhancedClassName = locationPersist
    ? cn("[&_tr:last-child]:border-0 [&_td[data-location]]:font-medium", className)
    : cn("[&_tr:last-child]:border-0", className)

  return <tbody ref={ref} className={enhancedClassName} {...props} />
})
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("bg-primary font-medium text-primary-foreground", className)} {...props} />
  ),
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
      {...props}
    />
  ),
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  ),
)
TableHead.displayName = "TableHead"

// Enhanced TableCell with location persistence
interface EnhancedTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  isLocation?: boolean
  locationValue?: string
}

const TableCell = React.forwardRef<HTMLTableCellElement, EnhancedTableCellProps>(
  ({ className, isLocation = false, locationValue, ...props }, ref) => {
    // If this is a location cell, add data attributes for targeting
    const dataAttributes = isLocation ? { "data-location": "true" } : {}

    return (
      <td
        ref={ref}
        className={cn(
          "p-4 align-middle [&:has([role=checkbox])]:pr-0",
          isLocation && locationValue ? "text-primary-foreground font-medium" : "",
          className,
        )}
        {...dataAttributes}
        {...props}
      />
    )
  },
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  ),
)
TableCaption.displayName = "TableCaption"

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }

