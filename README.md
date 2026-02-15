# the-last-leaf

Digital diary application with safety features built with Next.js 15, Prisma, and Kubernetes.

## Project Status

**Current Branch:** `dld-360-1-1-infra-component-setup`

**TDD Phase:** RED - Tests written, implementation pending

## Project Structure

```
the-last-leaf/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components (to be implemented)
│   └── BottomNav.tsx     # Bottom navigation (pending)
├── lib/                   # Utility functions (to be implemented)
│   ├── auth.ts           # JWT utilities (pending)
│   └── password.ts       # bcrypt utilities (pending)
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema definition
├── k8s/                  # Kubernetes manifests
│   ├── base/             # Base configurations
│   └── overlays/prod/    # Production overlays
├── __tests__/            # Test files (TDD Red Phase)
│   ├── lib/              # Library tests
│   └── components/       # Component tests
├── Dockerfile            # Multi-stage Docker build
└── .github/workflows/    # CI/CD pipelines
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** JWT (jose)
- **Password Hashing:** bcrypt
- **Testing:** Jest + React Testing Library
- **Containerization:** Docker
- **Orchestration:** Kubernetes + Kustomize
- **CI/CD:** GitHub Actions

## Database Schema

### User
- user_id (PK)
- email (unique)
- password_hash
- nickname
- created_at
- last_active_at
- timer_status
- timer_idle_threshold_sec

### Diary
- diary_id (PK)
- user_id (FK)
- content (TEXT)
- created_at
- updated_at

### Contact
- contact_id (PK)
- user_id (FK)
- email
- phone

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- Docker (for containerization)
- kubectl and kustomize (for K8s deployment)

### Environment Variables

Copy `.env.local.template` to `.env.local` and configure:

```bash
cp .env.local.template .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (32+ characters)
- `NODE_ENV` - Environment (development/production)
- `NEXT_PUBLIC_APP_URL` - Application URL

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Run development server
npm run dev
```

## Testing (TDD Red Phase)

All tests are currently in RED state (failing) as implementation is pending.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Files

1. **JWT Authentication** (`__tests__/lib/auth.test.ts`)
   - signToken function tests
   - verifyToken function tests
   - Token expiration tests
   - Error handling tests

2. **Password Hashing** (`__tests__/lib/password.test.ts`)
   - hashPassword function tests
   - comparePassword function tests
   - Unicode support tests
   - Security tests

3. **BottomNav Component** (`__tests__/components/BottomNav.test.tsx`)
   - Rendering tests
   - Navigation tests
   - Active state tests
   - Accessibility tests

## Implementation Tasks

To move from RED to GREEN phase, implement:

1. **lib/auth.ts**
   - `signToken(payload, expiresIn?)` - Generate JWT tokens
   - `verifyToken(token)` - Verify and decode tokens

2. **lib/password.ts**
   - `hashPassword(password)` - Hash passwords with bcrypt
   - `comparePassword(password, hash)` - Compare passwords

3. **components/BottomNav.tsx**
   - Bottom navigation with "일기" and "설정" tabs
   - Active state highlighting
   - Next.js Link integration

## Docker Build

```bash
# Build Docker image
docker build -t the-last-leaf:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e JWT_SECRET="your-secret" \
  the-last-leaf:latest
```

## Kubernetes Deployment

### Using Kustomize

```bash
# Apply base configuration
kubectl apply -k k8s/base/

# Apply production overlay
kubectl apply -k k8s/overlays/prod/

# Check deployment status
kubectl get pods -l app=the-last-leaf
kubectl get svc the-last-leaf
kubectl get ingress the-last-leaf
```

### Update Secrets

Before deploying to production, update the secrets:

```bash
kubectl create secret generic the-last-leaf-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=jwt-secret="your-production-secret" \
  --dry-run=client -o yaml | kubectl apply -f -
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) includes:

1. **Lint** - ESLint code quality checks
2. **TypeCheck** - TypeScript compilation checks
3. **Test** - Run Jest tests with coverage
4. **Build** - Build Next.js application
5. **Docker** - Build and push Docker image (on push to main/develop)

### Required Secrets

Configure these in GitHub repository settings:

- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT secret key
- `CODECOV_TOKEN` - Codecov upload token (optional)
- `REGISTRY_URL` - Container registry URL
- `REGISTRY_USERNAME` - Registry username
- `REGISTRY_PASSWORD` - Registry password

## Next Steps

1. Implement `lib/auth.ts` to pass JWT tests
2. Implement `lib/password.ts` to pass password tests
3. Implement `components/BottomNav.tsx` to pass component tests
4. Run `npm test` to verify all tests pass (GREEN phase)
5. Add diary and settings pages
6. Implement authentication flow
7. Deploy to production

## License

Private project
