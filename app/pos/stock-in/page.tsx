"use client";

import { useState, useEffect } from "react";
import { SearchIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { StockInForm } from "@/components/stock-in-form";

interface StockInItem {
  id: string;
  createdAt: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reference: string | null;
  reason: string | null;
  notes: string | null;
  stockItem?: {
    name: string;
    sku: string;
  } | null;
}

export default function StockInPage() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockInHistory, setStockInHistory] = useState<StockInItem[]>([]);

  // Fetch stock-in history
  const fetchStockInHistory = async () => {
    try {
      const res = await fetch("/api/stock-in/route", { cache: "no-store" });
      const data = await res.json();
      setStockInHistory(data);
    } catch (error) {
      console.error("Error fetching stock-in history:", error);
    }
  };

  useEffect(() => {
    fetchStockInHistory();
  }, []);

  // Handle new stock-in submission
  const handleStockIn = async (data: any) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/stock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to submit stock-in");
      }

      toast({
        title: "Stock In Recorded",
        description: `Added ${data.quantity} units successfully.`,
      });

      await fetchStockInHistory(); 
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting stock-in:", error);
      toast({ title: "Error", description: "Failed to record stock-in.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter stock-in history based on search
  const filteredHistory = stockInHistory.filter((item) => {
    const search = searchQuery.toLowerCase();
    return (
      item.stockItem?.name.toLowerCase().includes(search) ||
      item.stockItem?.sku.toLowerCase().includes(search) ||
      (item.reference && item.reference.toLowerCase().includes(search))
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock In</h1>
          <p className="text-muted-foreground">Record new inventory arrivals and view stock in history</p>
        </div>
        {hasPermission("manage_stock_in") && (
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Record Stock In
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record Stock In</CardTitle>
            <CardDescription>Enter details about the incoming inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <StockInForm onSubmit={handleStockIn} onCancel={() => setShowForm(false)} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stock In History</CardTitle>
          <CardDescription>Recent inventory arrivals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by product name, SKU, or reference..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id.slice(0, 6)}</TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{item.stockItem ? `${item.stockItem.sku} - ${item.stockItem.name}` : "-"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.reference || "-"}</TableCell>
                    <TableCell>{item.notes || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No stock in records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
