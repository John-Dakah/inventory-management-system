interface CartItem {
    productId: string
    name: string
    price: number
    quantity: number
  }
  
  interface PaymentData {
    items: CartItem[]
    subtotal: number
    tax: number
    total: number
    discountPercent?: number
    paymentMethod: string
    customerId?: string
    notes?: string
    registerSessionId?: string
  }
  
  export async function processPayment(data: PaymentData): Promise<{
    success: boolean
    transactionId?: string
    reference?: string
    error?: string
    details?: string
  }> {
    try {
      // Make API request
      const response = await fetch("/api/pos/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
  
      // Parse the response
      const result = await response.json()
  
      // Handle errors
      if (!response.ok) {
        console.error("Payment processing error:", result)
        return {
          success: false,
          error: result.error || "Failed to process payment",
          details: result.details || "There was an error processing your payment. Please try again.",
        }
      }
  
      // Return success
      return {
        success: true,
        transactionId: result.transactionId,
        reference: result.reference,
      }
    } catch (error: any) {
      console.error("Payment processing exception:", error)
  
      // Handle network errors or other exceptions
      return {
        success: false,
        error: "Payment Processing Failed",
        details: error.message || "There was a network error. Please check your connection and try again.",
      }
    }
  }
  
  export async function testPaymentProcessing(data: PaymentData): Promise<{
    success: boolean
    message?: string
    error?: string
    details?: string
  }> {
    try {
      // Make test API request
      const response = await fetch("/api/pos/test-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
  
      // Parse the response
      const result = await response.json()
  
      // Handle errors
      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Test failed",
          details: result.details || "There was an error validating the transaction.",
        }
      }
  
      // Return success
      return {
        success: true,
        message: result.message || "Transaction validated successfully",
      }
    } catch (error: any) {
      // Handle network errors or other exceptions
      return {
        success: false,
        error: "Test Failed",
        details: error.message || "There was a network error during testing.",
      }
    }
  }
  