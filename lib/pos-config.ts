export interface BusinessInfo {
    name: string
    address: string
    phone: string
    email: string
    website: string
    taxId: string
    receiptFooter: string
    currency: string
    taxRate: number
  }
  
  // Default business information - can be updated in settings
  export const businessInfo: BusinessInfo = {
    name: "Your Business Name",
    address: "123 Main Street, City, State, ZIP",
    phone: "(555) 123-4567",
    email: "contact@yourbusiness.com",
    website: "www.yourbusiness.com",
    taxId: "TAX-ID-12345",
    receiptFooter: "Thank you for your business!",
    currency: "$",
    taxRate: 8.5, // Percentage
  }
  
  // POS settings
  export const posSettings = {
    enableDiscounts: true,
    enableTax: true,
    printReceiptAutomatically: true,
    allowPartialPayments: true,
    allowMultiplePaymentMethods: true,
    requireCashierName: true,
    trackInventory: true,
    lowStockThreshold: 10,
    receiptCopies: 1,
  }
  
  // Payment methods
  export const paymentMethods = [
    { id: "cash", name: "Cash" },
    { id: "credit", name: "Credit Card" },
    { id: "debit", name: "Debit Card" },
    { id: "mobile", name: "Mobile Payment" },
    { id: "check", name: "Check" },
    { id: "gift", name: "Gift Card" },
  ]
  
  // Discount types
  export const discountTypes = [
    { id: "percentage", name: "Percentage (%)" },
    { id: "fixed", name: "Fixed Amount" },
  ]
  