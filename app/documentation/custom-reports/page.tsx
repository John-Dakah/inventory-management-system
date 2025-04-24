import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  InfoIcon,
  FileTextIcon,
  BarChart3Icon,
  PieChartIcon,
  TableIcon,
  DownloadIcon,
  Settings2Icon,
} from "lucide-react"

export default function CustomReportsDocumentation() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-8 bg-white dark:bg-gray-950 rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">On This Page</h2>
            <nav className="space-y-2">
              <a href="#introduction" className="block text-sm hover:underline text-blue-600 dark:text-blue-400">
                Introduction
              </a>
              <a href="#getting-started" className="block text-sm hover:underline text-blue-600 dark:text-blue-400">
                Getting Started
              </a>
              <a href="#report-types" className="block text-sm hover:underline text-blue-600 dark:text-blue-400">
                Report Types
              </a>
              <a href="#creating-reports" className="block text-sm hover:underline text-blue-600 dark:text-blue-400">
                Creating Reports
              </a>
              <a
                href="#customizing-parameters"
                className="block text-sm hover:underline text-blue-600 dark:text-blue-400"
              >
                Customizing Parameters
              </a>
              <a href="#exporting" className="block text-sm hover:underline text-blue-600 dark:text-blue-400">
                Exporting Reports
              </a>
              <a href="#advanced-config" className="block text-sm hover:underline text-blue-600 dark:text-blue-400">
                Advanced Configuration
              </a>
              <a href="#troubleshooting" className="block text-sm hover:underline text-blue-600 dark:text-blue-400">
                Troubleshooting
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Custom Reports Documentation</h1>

          {/* Introduction Section */}
          <section id="introduction" className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <InfoIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Introduction</h2>
            </div>
            <p className="mb-4">
              Custom reports are a powerful feature of our inventory management system that allow you to generate
              tailored insights about your inventory, sales, and procurement processes. This documentation will guide
              you through creating, customizing, and utilizing custom reports to make data-driven decisions for your
              business.
            </p>
            <Alert className="my-4">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Custom reports are available on all paid plans. Free tier users have access to a limited set of report
                templates.
              </AlertDescription>
            </Alert>
          </section>

          {/* Getting Started Section */}
          <section id="getting-started" className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <FileTextIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Getting Started</h2>
            </div>
            <p className="mb-4">
              To access the custom reports feature, navigate to the Reports section in the main dashboard sidebar. From
              there, you can view existing reports or create new ones by clicking the "New Report" button.
            </p>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Basic Report Creation Flow</CardTitle>
                <CardDescription>The standard process for creating a new custom report</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Navigate to Reports → Custom Reports</li>
                  <li>Click "New Report" button</li>
                  <li>Select a report type</li>
                  <li>Configure data sources and parameters</li>
                  <li>Preview and save your report</li>
                </ol>
              </CardContent>
            </Card>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
              <pre className="text-sm overflow-x-auto">
                <code>
                  {`// Example: Accessing the reports module
import { ReportManager } from 'inventory-system';

// Initialize the report manager
const reportManager = new ReportManager({
  userId: currentUser.id,
  permissions: currentUser.permissions
});

// Check if user can create custom reports
const canCreateReports = reportManager.hasPermission('create:custom-reports');`}
                </code>
              </pre>
            </div>
          </section>

          {/* Report Types Section */}
          <section id="report-types" className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3Icon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Report Types</h2>
            </div>
            <p className="mb-4">
              Our system offers several types of reports to meet different analytical needs. Each report type has
              specific capabilities and visualization options.
            </p>

            <Tabs defaultValue="tabular" className="mb-6">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="tabular">Tabular Reports</TabsTrigger>
                <TabsTrigger value="chart">Chart Reports</TabsTrigger>
                <TabsTrigger value="summary">Summary Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="tabular" className="p-4 border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <TableIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">Tabular Reports</h3>
                </div>
                <p className="mb-3">
                  Tabular reports display data in a structured table format with rows and columns. These are ideal for
                  detailed data analysis and when you need to see individual records.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <pre className="text-sm overflow-x-auto">
                    <code>
                      {`// Creating a tabular inventory report
const tabularReport = reportManager.createReport({
  type: 'tabular',
  dataSource: 'inventory',
  columns: ['sku', 'name', 'category', 'quantity', 'location', 'lastUpdated'],
  filters: {
    quantity: { operator: 'lessThan', value: 10 }
  },
  sortBy: 'quantity',
  sortDirection: 'asc'
});`}
                    </code>
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="chart" className="p-4 border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">Chart Reports</h3>
                </div>
                <p className="mb-3">
                  Chart reports visualize data using various chart types like bar, line, pie, and area charts. These are
                  perfect for identifying trends, patterns, and proportions at a glance.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <pre className="text-sm overflow-x-auto">
                    <code>
                      {`// Creating a pie chart for inventory by category
const categoryChart = reportManager.createReport({
  type: 'chart',
  chartType: 'pie',
  dataSource: 'inventory',
  dimension: 'category',
  measure: 'quantity',
  aggregation: 'sum',
  title: 'Inventory Distribution by Category',
  colorScheme: 'blues'
});`}
                    </code>
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="summary" className="p-4 border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3Icon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">Summary Reports</h3>
                </div>
                <p className="mb-3">
                  Summary reports provide high-level aggregated data with key metrics and indicators. These are useful
                  for executives and quick overviews of business performance.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <pre className="text-sm overflow-x-auto">
                    <code>
                      {`// Creating a summary report for inventory status
const summaryReport = reportManager.createReport({
  type: 'summary',
  dataSource: 'inventory',
  metrics: [
    { name: 'totalItems', calculation: 'count', field: 'id' },
    { name: 'totalValue', calculation: 'sum', field: 'value' },
    { name: 'lowStockItems', calculation: 'count', 
      filter: { field: 'quantity', operator: 'lessThan', value: 5 } }
  ],
  timeFrame: 'current'
});`}
                    </code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          {/* Creating Reports Section */}
          <section id="creating-reports" className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <FileTextIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Creating Reports</h2>
            </div>
            <p className="mb-4">
              Creating a custom report involves selecting data sources, configuring display options, and setting up
              filters to focus on the information that matters most to your business needs.
            </p>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Report Creation Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Step 1: Select Data Source</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose from available data sources: Inventory, Sales, Purchases, Suppliers, etc.
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Step 2: Choose Report Type</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select tabular, chart, or summary report based on your visualization needs.
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Step 3: Configure Fields</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select columns, dimensions, measures, or metrics depending on your report type.
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Step 4: Apply Filters</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Set conditions to filter data (date ranges, categories, thresholds, etc.).
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Step 5: Preview and Save</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Review your report, make adjustments, and save with a descriptive name.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
              <pre className="text-sm overflow-x-auto">
                <code>
                  {`// Example: Creating a low stock alert report
function createLowStockReport() {
  const report = new CustomReport({
    name: "Low Stock Alert",
    description: "Items that need to be reordered soon",
    type: "tabular"
  });
  
  // Configure data source
  report.setDataSource("inventory");
  
  // Select fields to display
  report.addFields([
    "sku", "name", "category", "quantity", 
    "reorderPoint", "preferredSupplier"
  ]);
  
  // Add calculated field
  report.addCalculatedField({
    name: "daysUntilReorder",
    formula: "(quantity - reorderPoint) / averageDailyUsage",
    format: "number",
    decimals: 1
  });
  
  // Set filters
  report.addFilter({
    field: "quantity",
    operator: "lessThanOrEqual",
    value: { field: "reorderPoint", offset: 5 }
  });
  
  // Set sorting
  report.setSorting("daysUntilReorder", "asc");
  
  return report;
}`}
                </code>
              </pre>
            </div>
          </section>

          {/* Customizing Parameters Section */}
          <section id="customizing-parameters" className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Settings2Icon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Customizing Parameters</h2>
            </div>
            <p className="mb-4">
              Parameters allow users to interact with reports by changing inputs without modifying the report structure.
              This makes reports more flexible and reusable.
            </p>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Common Parameter Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 mt-0.5">
                      Date
                    </span>
                    <div>
                      <p className="font-medium">Date Range Parameters</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow users to select custom date ranges for time-based reports.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 mt-0.5">
                      Select
                    </span>
                    <div>
                      <p className="font-medium">Dropdown Selection Parameters</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Let users choose from predefined options like categories, locations, or suppliers.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 mt-0.5">
                      Number
                    </span>
                    <div>
                      <p className="font-medium">Numeric Threshold Parameters</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow users to set custom numeric thresholds for filtering data.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 mt-0.5">
                      Text
                    </span>
                    <div>
                      <p className="font-medium">Text Search Parameters</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable users to search for specific text within report data.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
              <pre className="text-sm overflow-x-auto">
                <code>
                  {`// Example: Adding parameters to a report
function addParametersToReport(report) {
  // Add a date range parameter
  report.addParameter({
    id: "dateRange",
    type: "dateRange",
    label: "Date Range",
    defaultValue: {
      start: "first-day-current-month",
      end: "current-date"
    }
  });
  
  // Add a category selection parameter
  report.addParameter({
    id: "category",
    type: "select",
    label: "Product Category",
    options: {
      source: "dynamic",
      query: "SELECT DISTINCT category FROM inventory ORDER BY category"
    },
    multiSelect: true,
    defaultValue: ["Electronics", "Office Supplies"]
  });
  
  // Add a numeric threshold parameter
  report.addParameter({
    id: "minQuantity",
    type: "number",
    label: "Minimum Quantity",
    defaultValue: 10,
    min: 0,
    max: 1000
  });
  
  // Connect parameters to report filters
  report.connectParameterToFilter("dateRange", "lastUpdated");
  report.connectParameterToFilter("category", "category");
  report.connectParameterToFilter("minQuantity", "quantity", "greaterThanOrEqual");
  
  return report;
}`}
                </code>
              </pre>
            </div>
          </section>

          {/* Exporting Reports Section */}
          <section id="exporting" className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <DownloadIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Exporting and Sharing Reports</h2>
            </div>
            <p className="mb-4">
              Once you've created a report, you can export it in various formats or share it with team members. Our
              system supports multiple export options and sharing capabilities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Formats</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>PDF (for printing and formal documentation)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>Excel (for further data analysis)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>CSV (for data integration)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>JSON (for API consumption)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>Image (PNG/JPG for charts and visuals)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sharing Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>Email reports to team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>Schedule recurring report delivery</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>Generate shareable links</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>Set permissions for report access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>Embed reports in dashboards</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
              <pre className="text-sm overflow-x-auto">
                <code>
                  {`// Example: Exporting and sharing a report
async function exportAndShareReport(report, options) {
  // Export to different formats
  if (options.exportPdf) {
    const pdfBlob = await report.exportToPdf({
      paperSize: "A4",
      orientation: "portrait",
      includeHeaderFooter: true
    });
    downloadFile(pdfBlob, \`\${report.name}.pdf\`);
  }
  
  if (options.exportExcel) {
    const excelBlob = await report.exportToExcel({
      includeRawData: true,
      sheetName: report.name
    });
    downloadFile(excelBlob, \`\${report.name}.xlsx\`);
  }
  
  // Share report with team members
  if (options.shareWithTeam) {
    const shareResult = await report.share({
      recipients: options.recipients,
      message: options.message,
      permissions: options.permissions || "view",
      expiresIn: options.expiresIn || "never"
    });
    
    return {
      success: shareResult.success,
      shareLink: shareResult.link,
      recipientCount: shareResult.sentTo.length
    };
  }
}`}
                </code>
              </pre>
            </div>
          </section>

          {/* Advanced Configuration Section */}
          <section id="advanced-config" className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Settings2Icon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Advanced Configuration</h2>
            </div>
            <p className="mb-4">
              For power users, our system offers advanced configuration options to create highly customized reports with
              complex calculations, conditional formatting, and interactive elements.
            </p>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Advanced Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Custom Calculations</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Create complex formulas using our expression language to derive insights from your data.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                      <code className="text-xs">
                        {`// Profit margin calculation
IF([Revenue] > 0, ([Revenue] - [Cost]) / [Revenue] * 100, 0)`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Conditional Formatting</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Apply visual formatting based on data values to highlight important information.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                      <code className="text-xs">
                        {`// Highlight low stock items in red
report.addConditionalFormat({
  field: "quantity",
  condition: "lessThan",
  value: "reorderPoint",
  style: { backgroundColor: "#FFEBEE", textColor: "#D32F2F", fontWeight: "bold" }
});`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Drill-Down Capabilities</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Enable users to click on report elements to see more detailed information.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                      <code className="text-xs">
                        {`// Configure drill-down from category to product level
report.configureDrillDown({
  sourceField: "category",
  targetReport: "productDetailsByCategory",
  parameterMapping: { selectedCategory: "category" }
});`}
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
              <pre className="text-sm overflow-x-auto">
                <code>
                  {`// Example: Advanced report configuration
function createAdvancedInventoryReport() {
  const report = new CustomReport({
    name: "Inventory Value Analysis",
    description: "Detailed analysis of inventory value with trends",
    type: "combined" // Combines tabular and chart views
  });
  
  // Configure multiple data sources
  report.setDataSources([
    { name: "current", source: "inventory", type: "snapshot" },
    { name: "historical", source: "inventory_history", type: "timeSeries" }
  ]);
  
  // Add calculated fields with complex formulas
  report.addCalculatedField({
    name: "totalValue",
    formula: "[quantity] * [unitCost]",
    format: "currency"
  });
  
  report.addCalculatedField({
    name: "valueChange",
    formula: "[totalValue] - LOOKUP([totalValue], [historical], -30)",
    format: "currency"
  });
  
  report.addCalculatedField({
    name: "valueChangePercent",
    formula: "IF(LOOKUP([totalValue], [historical], -30) > 0, " +
             "[valueChange] / LOOKUP([totalValue], [historical], -30) * 100, 0)",
    format: "percent",
    decimals: 2
  });
  
  // Configure conditional formatting
  report.addConditionalFormat({
    field: "valueChangePercent",
    conditions: [
      { operator: "lessThan", value: -10, style: { backgroundColor: "#FFEBEE", textColor: "#D32F2F" } },
      { operator: "between", value: [-10, -5], style: { backgroundColor: "#FFF8E1", textColor: "#F57F17" } },
      { operator: "between", value: [5, 10], style: { backgroundColor: "#E8F5E9", textColor: "#2E7D32" } },
      { operator: "greaterThan", value: 10, style: { backgroundColor: "#E8F5E9", textColor: "#2E7D32", fontWeight: "bold" } }
    ]
  });
  
  // Configure chart visualization
  report.addVisualization({
    type: "chart",
    chartType: "line",
    dataSource: "historical",
    xAxis: { field: "date", label: "Date" },
    yAxis: { field: "totalValue", label: "Total Inventory Value" },
    groupBy: "category",
    timeFrame: "last90Days",
    interval: "week"
  });
  
  // Add interactive filters
  report.addInteractiveFilters([
    { field: "category", type: "multiSelect", label: "Categories" },
    { field: "location", type: "multiSelect", label: "Locations" },
    { field: "valueChangePercent", type: "range", label: "Value Change %", 
      min: -100, max: 100, step: 5 }
  ]);
  
  // Enable drill-down functionality
  report.configureDrillDown({
    sourceField: "category",
    targetReport: "categoryDetails",
    parameterMapping: { selectedCategory: "category" }
  });
  
  return report;
}`}
                </code>
              </pre>
            </div>
          </section>

          {/* Troubleshooting Section */}
          <section id="troubleshooting" className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <InfoIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Troubleshooting</h2>
            </div>
            <p className="mb-4">
              If you encounter issues while creating or running custom reports, refer to these common problems and their
              solutions.
            </p>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Common Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Report Loading Slowly</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      If your report takes a long time to load, try:
                    </p>
                    <ul className="list-disc pl-5 text-sm mt-1">
                      <li>Reducing the date range</li>
                      <li>Adding more specific filters</li>
                      <li>Limiting the number of columns or dimensions</li>
                      <li>Using aggregated data instead of raw data</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Calculation Errors</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">If you see errors in calculated fields:</p>
                    <ul className="list-disc pl-5 text-sm mt-1">
                      <li>Check for division by zero scenarios</li>
                      <li>Verify field names in formulas</li>
                      <li>Ensure data types are compatible</li>
                      <li>Add error handling to formulas using IF statements</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Missing Data</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">If your report is missing expected data:</p>
                    <ul className="list-disc pl-5 text-sm mt-1">
                      <li>Check filter settings</li>
                      <li>Verify data source permissions</li>
                      <li>Ensure date ranges include the expected data</li>
                      <li>Check for data refresh timing issues</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="mb-6">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Need More Help?</AlertTitle>
              <AlertDescription>
                If you continue to experience issues with custom reports, contact our support team through the Help
                Center or submit a support ticket from the Reports page by clicking the "Get Help" button.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <pre className="text-sm overflow-x-auto">
                <code>
                  {`// Example: Debugging a report issue
function troubleshootReport(report) {
  // Get report execution statistics
  const stats = report.getExecutionStats();
  
  console.log("Report execution time:", stats.executionTime + "ms");
  console.log("Records processed:", stats.recordsProcessed);
  console.log("Data size:", (stats.dataSizeBytes / 1024 / 1024).toFixed(2) + " MB");
  
  // Check for performance bottlenecks
  if (stats.executionTime > 5000) {
    console.log("Performance issues detected:");
    
    if (stats.recordsProcessed > 100000) {
      console.log("- Large dataset: Consider adding more filters");
    }
    
    if (stats.calculationTime > stats.executionTime * 0.5) {
      console.log("- Calculation overhead: Simplify complex formulas");
    }
    
    if (stats.filterTime > stats.executionTime * 0.3) {
      console.log("- Filter complexity: Optimize filter conditions");
    }
  }
  
  // Check for data quality issues
  const dataIssues = report.validateData();
  if (dataIssues.length > 0) {
    console.log("Data quality issues:");
    dataIssues.forEach(issue => {
      console.log(\`- \${issue.type}: \${issue.message} (\${issue.affectedRows} rows)\`);
    });
  }
  
  return {
    hasPerformanceIssues: stats.executionTime > 5000,
    hasDataQualityIssues: dataIssues.length > 0,
    recommendations: generateRecommendations(stats, dataIssues)
  };
}

// Generate optimization recommendations
function generateRecommendations(stats, dataIssues) {
  const recommendations = [];
  
  if (stats.executionTime > 5000) {
    recommendations.push("Add more specific filters to reduce data volume");
    recommendations.push("Consider using pre-aggregated data sources");
  }
  
  if (dataIssues.some(i => i.type === "nullValues")) {
    recommendations.push("Add NULL handling to calculated fields");
  }
  
  if (stats.dataSizeBytes > 10 * 1024 * 1024) {
    recommendations.push("Export to Excel instead of viewing in browser");
  }
  
  return recommendations;
}`}
                </code>
              </pre>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
