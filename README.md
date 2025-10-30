# Trello Clone - Laravel Backend

## Prerequisites

- Docker & Docker Compose
- Git

## Setup Instructions

### 1. Clone Repository
```bash
git clone <repository-url>
cd trello-clone
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env if needed (default values work with Docker)
```

### 3. Start Docker Services
```bash
# From project root
docker compose up -d --build
```

### 4. Install Dependencies & Run Migrations
```bash
# Install PHP dependencies
docker compose exec app composer install

# Generate application key
docker compose exec app php artisan key:generate

# Run database migrations
docker compose exec app php artisan migrate

# Optional: Seed database with sample data
docker compose exec app php artisan db:seed
```

### 5. Create Storage Link
```bash
docker compose exec app php artisan storage:link
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (auth required)
- `GET /api/auth/me` - Get current user (auth required)

### Boards
- `GET /api/boards` - Get all user boards
- `POST /api/boards` - Create board
- `GET /api/boards/{id}` - Get board with lists and cards
- `PUT /api/boards/{id}` - Update board
- `DELETE /api/boards/{id}` - Delete board

### Lists
- `POST /api/boards/{boardId}/lists` - Create list
- `PUT /api/lists/{id}` - Update list
- `DELETE /api/lists/{id}` - Delete list
- `POST /api/boards/{boardId}/lists/reorder` - Reorder lists

### Cards
- `POST /api/lists/{listId}/cards` - Create card
- `GET /api/cards/{id}` - Get card details
- `PUT /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card
- `POST /api/cards/{id}/move` - Move card to different list
- `POST /api/lists/{listId}/cards/reorder` - Reorder cards

### Comments
- `GET /api/cards/{cardId}/comments` - Get card comments
- `POST /api/cards/{cardId}/comments` - Add comment
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

### Assignments
- `POST /api/cards/{cardId}/assign` - Assign user to card
- `DELETE /api/cards/{cardId}/assign/{userId}` - Remove assignment

## Testing
```bash
# Run tests
docker compose exec app php artisan test

# Run with coverage
docker compose exec app php artisan test --coverage
