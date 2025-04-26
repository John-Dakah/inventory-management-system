# Inventory Management API Documentation

This document provides documentation for the Inventory Management API endpoints. 

## Authentication

Authentication is not implemented in this example but would be required in a production environment.

## Base URL

All API endpoints are relative to your deployment URL.

## Error Handling

All API errors return a standard JSON format:

\`\`\`json
{
  "error": "Error title",
  "message": "Detailed error message"
}
\`\`\`

## Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request
- `404`: Not Found
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Server Error

## Stock Items

### Get Stock Items

**GET /api/stock**

Retrieves a list of stock items.

**Query Parameters:**

- `search`: Search term for name or SKU
- `category`: Filter by category
- `location`: Filter by location
- `status`: Filter by status
- `type`: Filter by type
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response:**

\`\`\`json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "sku": "string",
      "category": "string",
      "quantity": 0,
      "location": "string",
      "status": "string",
      "type": "string",
      "lastUpdated": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 50,
    "totalPages": 0
  }
}
\`\`\`

### Get Stock Item

**GET /api/stock/:id**

Retrieves a specific stock item by ID.

**Response:**

\`\`\`json
{
  "id": "string",
  "name": "string",
  "sku": "string",
  "category": "string",
  "quantity": 0,
  "location": "string",
  "status": "string",
  "type": "string",
  "lastUpdated": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "recentTransactions": [
    {
      "id": "string",
      "type": "string",
      "quantity": 0,
      "previousQuantity": 0,
      "newQuantity": 0,
      "createdAt": "string",
      "reason": "string"
    }
  ]
}
\`\`\`

### Create Stock Item

**POST /api/stock**

Creates a new stock item.

**Request Body:**

\`\`\`json
{
  "id": "string",
  "name": "string",
  "sku": "string",
  "category": "string",
  "quantity": 0,
  "location": "string",
  "status": "string",
  "type": "string"
}
\`\`\`

**Response:** Returns the created stock item.

### Update Stock Item

**PUT /api/stock/:id**

Updates an existing stock item.

**Request Body:**

\`\`\`json
{
  "name": "string",
  "sku": "string",
  "category": "string",
  "quantity": 0,
  "location": "string",
  "status": "string",
  "type": "string"
}
\`\`\`

**Response:** Returns the updated stock item.

### Delete Stock Item

**DELETE /api/stock/:id**

Deletes a stock item.

**Response:** Status 204 (No Content) on success.

## Stock Transactions

### Get Transactions

**GET /api/stock/transactions**

Retrieves a list of stock transactions.

**Query Parameters:**

- `stockItemId`: Filter by stock item ID
- `type`: Filter by transaction type
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**

\`\`\`json
{
  "data": [
    {
      "id": "string",
      "stockItemId": "string",
      "stockItemName": "string",
      "stockItemSku": "string",
      "type": "string",
      "quantity": 0,
      "previousQuantity": 0,
      "newQuantity": 0,
      "location": "string",
      "reference": "string",
      "reason": "string",
      "notes": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "metadata": {}
    }
  ],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0
  }
}
\`\`\`

### Create Transaction

**POST /api/stock/transactions**

Creates a new stock transaction.

**Request Body:**

\`\`\`json
{
  "id": "string",
  "stockItemId": "string",
  "type": "string",
  "quantity": 0,
  "previousQuantity": 0,
  "newQuantity": 0,
  "location": "string",
  "reference": "string",
  "reason": "string",
  "notes": "string",
  "metadata": {}
}
\`\`\`

**Response:** Returns the created transaction.

## Products

### Get Products

**GET /api/products**

Retrieves a list of products.

**Query Parameters:**

- `search`: Search term for name, SKU or description
- `category`: Filter by category
- `vendor`: Filter by vendor
- `inStock`: Filter by in-stock status (true/false)
- `outOfStock`: Filter by out-of-stock status (true/false)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response:**

\`\`\`json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "sku": "string",
      "price": 0,
      "quantity": 0,
      "category": "string",
      "vendor": "string",
      "imageUrl": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 50,
    "totalPages": 0
  }
}
\`\`\`

### Get Product

**GET /api/products/:id**

Retrieves a specific product by ID.

**Response:**

\`\`\`json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "sku": "string",
  "price": 0,
  "quantity": 0,
  "category": "string",
  "vendor": "string",
  "imageUrl": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
\`\`\`

### Create Product

**POST /api/products**

Creates a new product.

**Request Body:**

\`\`\`json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "sku": "string",
  "price": 0,
  "quantity": 0,
  "category": "string",
  "vendor": "string",
  "imageUrl": "string"
}
\`\`\`

**Response:** Returns the created product.

### Update Product

**PUT /api/products/:id**

Updates an existing product.

**Request Body:**

\`\`\`json
{
  "name": "string",
  "description": "string",
  "sku": "string",
  "price": 0,
  "quantity": 0,
  "category": "string",
  "vendor": "string",
  "imageUrl": "string"
}
\`\`\`

**Response:** Returns the updated product.

### Delete Product

**DELETE /api/products/:id**

Deletes a product.

**Response:** Status 204 (No Content) on success.

## Statistics

### Get System Statistics

**GET /api/stats**

Retrieves system-wide statistics.

**Response:**

\`\`\`json
{
  "stockSummary": {
    "totalItems": 0,
    "totalUnits": 0,
    "lowStockItems": 0,
    "outOfStockItems": 0
  },
  "categories": [
    "string"
  ],
  "locations": [
    "string"
  ],
  "types": [
    "string"
  ],
  "systemStats": {
    "totalProducts": 0,
    "totalTransactions": 0,
    "recentActivity": [
      {
        "id": "string",
        "type": "string",
        "quantity": 0,
        "itemName": "string",
        "itemSku": "string",
        "createdAt": "string"
      }
    ]
  }
}
