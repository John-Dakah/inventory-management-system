'use client';

import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import * as XLSX from 'xlsx';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// TYPES
type StockAlert = {
  name: string;
  quantity: number;
};

type ReportData = {
  todaySales: number;
  monthSales: number;
  last7DaysSales: number;
  lowStock: StockAlert[];
  salesTrend: { date: string; total: number }[];
  warehouseReport?: {
    itemsInStock: number;
    itemsOutOfStock: number;
  };
  financialReport?: {
    totalRevenue: number;
    expenses: number;
  };
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/reports1?from=${dateRange?.from?.toISOString()}&to=${dateRange?.to?.toISOString()}`);
    const data = await res.json();
    if (data) {
      setReportData(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const exportToPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    doc.text('Business Reports', 10, 10);
    doc.text(`Today Sales: $${reportData.todaySales}`, 10, 20);
    doc.text(`This Month Sales: $${reportData.monthSales}`, 10, 30);
    doc.text(`Last 7 Days Sales: $${reportData.last7DaysSales}`, 10, 40);

    doc.text('Low Stock Products:', 10, 50);
    reportData.lowStock.forEach((item, idx) => {
      doc.text(`- ${item.name} (${item.quantity})`, 15, 60 + idx * 10);
    });

    doc.save('report.pdf');
  };

  const exportToExcel = () => {
    if (!reportData) return;

    const salesData = reportData.salesTrend.map((entry) => ({
      Date: format(new Date(entry.date), 'yyyy-MM-dd'),
      Total: entry.total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(salesData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Trend');
    XLSX.writeFile(workbook, 'sales_report.xlsx');
  };

  if (loading || !reportData) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 grid gap-6">
      {/* KPIs */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-[250px]">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold">Today Sales</h2>
            <p className="text-2xl font-semibold">${reportData.todaySales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[250px]">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold">This Month</h2>
            <p className="text-2xl font-semibold">${reportData.monthSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[250px]">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold">Last 7 Days</h2>
            <p className="text-2xl font-semibold">${reportData.last7DaysSales.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range & Export Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
          className="border rounded-md p-2"
        />
        <div className="flex flex-col gap-4">
          <Button onClick={exportToPDF}>Export to PDF</Button>
          <Button onClick={exportToExcel}>Export to Excel</Button>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Sales Trend</h2>
        <Line
          data={{
            labels: reportData.salesTrend.map((d) => format(new Date(d.date), 'MM/dd')),
            datasets: [
              {
                label: 'Sales',
                data: reportData.salesTrend.map((d) => d.total),
                fill: false,
                borderColor: '#4f46e5',
                backgroundColor: '#4f46e5',
                tension: 0.1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Sales Trend',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Low Stock Alerts</h2>
        {reportData.lowStock.length > 0 ? (
          <ul className="list-disc pl-6">
            {reportData.lowStock.map((item) => (
              <li key={item.name}>
                {item.name} - only {item.quantity} left!
              </li>
            ))}
          </ul>
        ) : (
          <p>All stocks are healthy!</p>
        )}
      </div>

      {/* Financial Report Section */}
      {reportData.financialReport && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Financial Summary</h2>
          <p>Total Revenue: ${reportData.financialReport.totalRevenue.toFixed(2)}</p>
          <p>Expenses: ${reportData.financialReport.expenses.toFixed(2)}</p>
        </div>
      )}

      {/* Warehouse Report Section */}
      {reportData.warehouseReport && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Warehouse Report</h2>
          <p>Items In Stock: {reportData.warehouseReport.itemsInStock}</p>
          <p>Items Out of Stock: {reportData.warehouseReport.itemsOutOfStock}</p>
        </div>
      )}
    </div>
  );
}