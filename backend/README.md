# Manazon Backend API

A comprehensive RESTful API for the Manazon magical marketplace e-commerce platform.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Product Management** - Full CRUD operations with search, filtering, and sorting
- **Shopping Cart** - Persistent cart with real-time inventory management
- **Order Processing** - Complete order lifecycle with tracking and status updates
- **User Management** - Profile management, addresses, wishlist functionality
- **Admin Panel** - Administrative endpoints for product and order management
- **Security** - Rate limiting, input validation, CORS protection
- **Error Handling** - Comprehensive error handling and logging

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

## 📁 Project Structure

```
backend/
├── models/                 # Mongoose models
│   ├── User.js            # User schema and methods
│   ├── Product.js         # Product schema and methods
│   ├── Order.js           # Order schema and methods
│   └── Cart.js            # Cart schema and methods
├── routes/                # API route handlers
│   ├── auth.js            # Authentication routes
│   ├── products.js        # Product routes
│   ├── cart.js            # Shopping cart routes
│   ├── orders.js          # Order management routes
│   ├── users.js           # User management routes
│   └── admin.js           # Admin panel routes
├── middleware/            # Custom middleware
│   └── auth.js            # Authentication middleware
├── scripts/               # Utility scripts
│   └── seedDatabase.js    # Database seeding script
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── server.js              # Main server file
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd manazon/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/manazon
   JWT_SECRET=your_super_secret_jwt_key_here
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using MongoDB locally
   mongod
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000/api`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/change-password` - Change password

#### Products
- `GET /products` - Get all products (with filtering/sorting)
- `GET /products/:id` - Get single product
- `GET /products/categories/list` - Get all categories
- `GET /products/featured/list` - Get featured products
- `GET /products/search/suggestions` - Get search suggestions

#### Cart
- `GET /cart` - Get user's cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/update` - Update cart item quantity
- `DELETE /cart/remove/:productId` - Remove item from cart
- `DELETE /cart/clear` - Clear entire cart

#### Orders
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get single order
- `POST /orders/create` - Create new order
- `POST /orders/:id/cancel` - Cancel order

#### Users
- `GET /users/wishlist` - Get user's wishlist
- `POST /users/wishlist/add` - Add to wishlist
- `DELETE /users/wishlist/remove/:productId` - Remove from wishlist
- `POST /users/addresses` - Add new address
- `PUT /users/addresses/:addressId` - Update address
- `DELETE /users/addresses/:addressId` - Delete address

#### Admin (Admin only)
- `GET /admin/dashboard` - Get dashboard statistics
- `GET /admin/products` - Get all products (admin view)
- `POST /admin/products` - Create new product
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Delete product
- `GET /admin/orders` - Get all orders (admin view)
- `PUT /admin/orders/:id/status` - Update order status
- `GET /admin/users` - Get all users

### Example Requests

#### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get all products
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10&category=wand&sort=price-low"
```

#### Add item to cart
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "productId": "609b1234567890abcdef12345",
    "quantity": 2
  }'
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🔧 Development

### Database Seeding

The seed script creates:
- 1 admin user (admin@manazon.com / admin123)
- 1 test user (user@manazon.com / user123)
- 9 sample products

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/manazon |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | Token expiration | 7d |
| `FRONTEND_URL` | CORS allowed origin | http://localhost:3000 |

## 🔒 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - express-validator for all inputs
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Cross-origin resource sharing
- **Security Headers** - helmet.js for security headers
- **SQL Injection Prevention** - Mongoose ODM protection

## 📝 Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Validation errors if applicable
}
```

## 🚀 Deployment

### Production Setup

1. **Set production environment variables**
2. **Install production dependencies**
   ```bash
   npm ci --only=production
   ```
3. **Build and start**
   ```bash
   npm start
   ```

### Docker Support

Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Monitoring

The API includes:
- Request logging with Morgan
- Error tracking and logging
- Health check endpoint at `/api/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs for debugging

---

**Built with ❤️ for the magical marketplace**
