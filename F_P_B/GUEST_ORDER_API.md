# Guest Order API Documentation

## Overview
This API allows non-authenticated users (guests) to place orders for products. When a guest places an order, the product creators are automatically notified with the guest's contact information.

## API Endpoints

### 1. Create Guest Order
**POST** `/api/guest-orders`

Creates a new order for a guest user and notifies product creators.

#### Request Body:
```json
{
  "guest_info": {
    "name": "John Doe",
    "email": "john.doe@example.com", 
    "phone": "+1234567890",
    "address": "123 Main Street, Apt 4B",
    "city": "New York",
    "postal_code": "10001",
    "notes": "Please deliver after 5 PM"
  },
  "items": [
    {
      "product_id": 1,
      "product_name": "Chocolate Cake",
      "quantity": 2,
      "price": 25.00,
      "total": 50.00
    }
  ],
  "subtotal": 80.00,
  "tax": 8.00,
  "total": 88.00
}
```

#### Response:
```json
{
  "success": true,
  "order_id": 1,
  "order_number": "GO-ABC123XYZ",
  "message": "Guest order placed successfully"
}
```

### 2. Get Guest Orders (Protected)
**GET** `/api/guest-orders`

Retrieves guest orders for authenticated users (product creators see their orders, admins see all).

#### Headers:
- `Authorization: Bearer {token}`

#### Response:
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "GO-ABC123XYZ",
      "guest_name": "John Doe",
      "guest_email": "john.doe@example.com",
      "guest_phone": "+1234567890",
      "guest_address": "123 Main Street, Apt 4B",
      "guest_city": "New York",
      "guest_postal_code": "10001",
      "subtotal": 80.00,
      "tax": 8.00,
      "total": 88.00,
      "status": "pending",
      "created_at": "2024-01-24T12:00:00.000000Z",
      "items": [...]
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### 3. Get Guest Order Details (Protected)
**GET** `/api/guest-orders/{id}`

Retrieves specific guest order details.

#### Headers:
- `Authorization: Bearer {token}`

### 4. Update Guest Order Status (Protected)
**PUT** `/api/guest-orders/{id}/status`

Updates the status of a guest order.

#### Headers:
- `Authorization: Bearer {token}`

#### Request Body:
```json
{
  "status": "confirmed"
}
```

#### Possible Statuses:
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

## Database Tables

### guest_orders
- `id` - Primary key
- `order_number` - Unique order identifier (e.g., GO-ABC123XYZ)
- `guest_name` - Guest's full name
- `guest_email` - Guest's email address
- `guest_phone` - Guest's phone number
- `guest_address` - Delivery address
- `guest_city` - Delivery city
- `guest_postal_code` - Postal code
- `guest_notes` - Additional notes (optional)
- `subtotal` - Order subtotal
- `tax` - Tax amount
- `total` - Total amount
- `status` - Order status
- `created_at`, `updated_at` - Timestamps

### guest_order_items
- `id` - Primary key
- `guest_order_id` - Foreign key to guest_orders
- `product_id` - Foreign key to products
- `product_name` - Product name (stored for reference)
- `quantity` - Item quantity
- `price` - Unit price
- `total` - Item total
- `created_at`, `updated_at` - Timestamps

## Notification System

When a guest order is placed:

1. **Database Notifications**: Created in the `notifications` table for each product creator
2. **Email Notifications**: Sent to product creators (when email service is configured)
3. **Notification Data**:
   - Guest contact information
   - Order details
   - Product items
   - Order total

## Frontend Integration

The frontend should:

1. **Collect Guest Information**: Name, email, phone, address details
2. **Validate Input**: Ensure all required fields are filled
3. **Calculate Totals**: Subtotal, tax, and total amounts
4. **Submit Order**: Send to `/api/guest-orders`
5. **Handle Response**: Show success/error messages
6. **Redirect**: To order confirmation page

## Security Considerations

- Guest orders are public (no authentication required)
- Order management endpoints are protected
- Product creators can only see orders for their products
- Admins can see all guest orders
- Input validation on all guest data
- SQL injection protection via Laravel ORM

## Error Handling

Common error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "guest_info.email": ["The email field is required."],
    "items": ["The items field is required."]
  }
}
```

```json
{
  "success": false,
  "message": "Failed to place order: Product not found"
}
```
