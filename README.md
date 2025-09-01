# PokeAPI Extension

A Node.js/Express API that extends the PokeAPI with custom trainer and user management functionality. Built with TypeScript, MySQL, and comprehensive authentication.

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MySQL** (v8.0 or higher)

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:bobbybaxter/poke-api-extension.git
   cd poke-api-extension
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database Configuration
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USERNAME=your_mysql_username
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=poke_api_extension

   # JWT Configuration
   ACCESS_TOKEN_SECRET=your_secret_jwt_key_here
   ACCESS_TOKEN_TTL=15m
   REFRESH_TOKEN_TTL_DAYS=7

   # Server Configuration
   PORT=3000
   ```

   **Important:** Replace the placeholder values with your actual configuration:
   - Use a strong, randomly generated string for `ACCESS_TOKEN_SECRET`
   - Update MySQL credentials to match your local setup

## Database Setup

1. **Create the database:**
   ```sql
   CREATE DATABASE poke_api_extension;
   ```

2. **Database migration:**
   The application uses TypeORM with `synchronize: true`, so tables will be automatically created when you first run the application.

## Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with hot-reload enabled using `ts-node-dev`. The server will restart automatically when you make changes.

### Production Mode
```bash
# Build the TypeScript code
npm run build

# Start the production server
npm start
```

The application will be available at `http://localhost:3000` (or the port specified in your `.env` file).

## Testing

### Run All Tests
```bash
npm test
```
This runs the complete test suite with coverage reporting.

### Watch Mode (Development)
```bash
npm run test:watch
```
Runs tests in watch mode, automatically re-running when files change.

### View Coverage Report
```bash
npm run coverage
```
Opens the detailed HTML coverage report in your default browser.

## API Testing with Postman

A public Postman workspace is available with a complete collection for testing all API endpoints:

**🔗 [Postman Workspace - PokeAPI Extension](https://www.postman.com/bobbybaxter/workspace/pokeapi-extension)**

### Getting Started with Postman

1. **Join the workspace** by clicking the link above
2. **Fork the collection** to your own workspace to make requests
3. **Set up the environment:**
   - Select the "dev" environment
   - Ensure `base_url` is set to `http://localhost:3000`

### Testing Protected Routes

To test authenticated endpoints, follow this workflow:

1. **Register a new account:**
   ```json
   POST /register
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "securepassword123"
   }
   ```

2. **Login to get access token:**
   ```json
   POST /login
   {
     "identifier": "testuser",
     "password": "securepassword123"
   }
   ```

3. **Set up authentication:**
   - Copy the `access_token` from the login response
   - Paste it into the `{{bearer_token}}` environment variable in the "dev" environment
   - All protected routes will now automatically use this token

4. **Test protected endpoints:**
   - User management: `/user/:id`
   - Trainer operations: `/trainer` endpoints
   - The collection will automatically include the Bearer token in headers

### Environment Variables

The Postman collection uses these environment variables:
- `base_url`: Your API base URL (default: `http://localhost:3000`)
- `bearer_token`: JWT access token (set manually after login)

## API Endpoints

### Authentication
- `POST /register` - Create a new user account
- `POST /login` - Authenticate and receive access tokens
- `POST /logout` - Revoke refresh token
- `POST /refresh` - Refresh access token using refresh token

### Pokemon (Public)
- `GET /pokemon` - List all pokemon from PokeAPI
- `GET /pokemon/:idOrName` - Get specific pokemon by ID or name

### Users (Protected)
- `GET /user/:id` - Get user information
- `PUT /user/:id` - Update user information
- `DELETE /user/:id` - Delete user account

### Trainers (Public)
- `GET /trainer` - List all trainers
- `GET /trainer/:id` - Get specific trainer
- `POST /trainer` - Create new trainer
- `PUT /trainer/:id` - Update trainer information
- `DELETE /trainer/:id` - Delete trainer

**Note:** Protected routes require a valid JWT token in the Authorization header: `Bearer <token>`

## Project Structure

```
src/
├── controllers/       # Route handlers and business logic
├── middleware/        # Authentication, validation, error handling
├── mysql/             # Database configuration and entities
├── routes/            # Express route definitions
├── services/          # External services (PokeAPI, JWT)
├── tests/             # Unit and integration tests
├── types/             # TypeScript type definitions
└── validators/        # Request validation schemas
```
