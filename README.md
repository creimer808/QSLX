# QSLX - Ham Radio Contact Logger

QSLX is a modern, lightweight ham radio contact logging application built with the T3 Stack. It's designed to be self-hosted on a Raspberry Pi or similar lightweight hardware, providing ham radio operators with a better way to track and visualize their contacts.

## Features

- 📻 **Contact Logging**: Log your QSOs with detailed information (callsign, frequency, mode, band, RST, location, etc.)
- 🗺️ **Interactive Maps**: Visualize all your contacts on a world map with markers
- 📅 **Calendar View**: See your contacts organized by date with a heat map visualization
- 📊 **Analytics Dashboard**: Comprehensive statistics including:
  - Total contacts and unique callsigns
  - Countries worked
  - Band and mode distribution charts
  - Frequency analysis
- 🔐 **User Authentication**: Secure login with NextAuth.js
- 💾 **SQLite Database**: Lightweight database perfect for Raspberry Pi

## Tech Stack

- [Next.js](https://nextjs.org) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [tRPC](https://trpc.io) - End-to-end typesafe APIs
- [Prisma](https://prisma.io) - Database ORM with SQLite
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Leaflet](https://leafletjs.com) - Interactive maps
- [Recharts](https://recharts.org) - Data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- For Raspberry Pi: Node.js can be installed via `nvm` or from NodeSource

### Installation

1. Clone the repository:
```bash
git clone https://github.com/creimer808/QSLXgit 
cd QSLX
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the project root with:
```
DATABASE_URL="file:./prisma/db.sqlite"
SESSION_SECRET="your-secret-here" # Generate with: openssl rand -base64 32
NODE_ENV="development"
```

**Note**: The `SESSION_SECRET` is required for production. Generate a secure secret with:
```bash
openssl rand -base64 32
```

4. Initialize the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Quick Deployment (Recommended)

Use the automated deployment script for the easiest setup:

```bash
# Make the script executable (if not already)
chmod +x deploy.sh

# Run the deployment script
./deploy.sh --pm2
```

The script will:
- ✅ Check prerequisites (Node.js, npm)
- ✅ Set up environment variables (auto-generates SESSION_SECRET if needed)
- ✅ Install dependencies
- ✅ Build the application
- ✅ Set up the database
- ✅ Start with PM2 (process manager)

**Options:**
- `./deploy.sh --pm2` - Automatically use PM2
- `./deploy.sh --skip-build` - Skip building (useful for updates)
- `./deploy.sh --help` - Show all options

### Manual Deployment

#### Option 1: Direct Node.js Deployment

1. **Install Node.js on Raspberry Pi:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

2. **Clone and setup:**
```bash
cd ~
git clone https://github.com/creimer808/QSLX
cd QSLX
npm install
npm run build
```

3. **Set up environment variables** (create `.env` file):
```bash
DATABASE_URL="file:./prisma/db.sqlite"
SESSION_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
NODE_ENV="production"
```

4. **Run database migrations:**
```bash
npm run db:push
```

5. **Start the application:**
```bash
npm start
```

#### Option 2: Using PM2 (Recommended for Production)

**What is PM2?** PM2 is a process manager for Node.js applications that:
- Keeps your app running in the background
- Automatically restarts the app if it crashes
- Manages logs and monitoring
- Can start on system boot

1. **Install PM2:**

   **Option A: Global installation (requires sudo/admin):**
   ```bash
   sudo npm install -g pm2
   ```

   **Option B: Local installation (no sudo needed):**
   ```bash
   npm install pm2
   # Then use: npx pm2 instead of pm2
   ```

   **Note:** If you get a permission error (`EACCES`), you have two options:
   - Use `sudo npm install -g pm2` (requires administrator password)
   - Install locally: `npm install pm2` and use `npx pm2` commands

2. **Start the application with PM2:**
```bash
pm2 start npm --name "qslx" -- start
pm2 save
pm2 startup  # Follow the instructions to enable on system startup
```

3. **PM2 Management Commands:**

   If installed globally:
   ```bash
   pm2 status          # Check application status
   pm2 logs qslx       # View logs
   pm2 restart qslx    # Restart application
   pm2 stop qslx       # Stop application
   pm2 delete qslx     # Remove from PM2
   ```

   If installed locally (use `npx`):
   ```bash
   npx pm2 status          # Check application status
   npx pm2 logs qslx       # View logs
   npx pm2 restart qslx    # Restart application
   npx pm2 stop qslx       # Stop application
   npx pm2 delete qslx     # Remove from PM2
   ```

4. **Access your application:**
   - If running on the Pi itself: `http://localhost:3000`
   - From another device on the network: `http://<raspberry-pi-ip>:3000`

### Updating the Application

To update to the latest version:

```bash
# Pull latest changes
git pull

# Run deployment script (will skip build if nothing changed)
./deploy.sh --pm2

# Or manually:
npm install
npm run build
npm run db:push
pm2 restart qslx
```

### Environment Variables

Required environment variables for production:

- `DATABASE_URL` - SQLite database path (default: `file:./prisma/db.sqlite`)
- `SESSION_SECRET` - Secret key for session encryption (required in production)
- `NODE_ENV` - Set to `production` for production deployments

Generate a secure `SESSION_SECRET`:
```bash
openssl rand -base64 32
```

## Usage

1. **Sign In**: Use the authentication system to create an account or sign in
2. **Log Contacts**: Click "Log Contact" to add new QSOs
3. **View Dashboard**: See your statistics and recent contacts
4. **Explore Maps**: View all your contacts on an interactive world map
5. **Check Analytics**: Dive into detailed statistics and charts
6. **Calendar View**: See your contact activity over time

## Database

The application uses SQLite by default, which is perfect for lightweight deployments. The database file (`db.sqlite`) is stored in the `prisma/` directory.

To view/edit data directly:
```bash
npm run db:studio
```

**Important**: Make sure to back up your database regularly, especially before updates:
```bash
cp prisma/db.sqlite prisma/db.sqlite.backup
```

## Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run typecheck` - Run TypeScript type checking

## Deployment Script

The `deploy.sh` script automates the deployment process:

```bash
./deploy.sh [OPTIONS]
```

**Options:**
- `--pm2` - Automatically use PM2 for process management
- `--skip-build` - Skip building the application
- `--help` - Show help message

The script handles:
- Prerequisite checks (Node.js, npm)
- Environment variable setup
- Dependency installation
- Application building
- Database setup
- Process management (PM2 or direct)

## Start/Stop Scripts

### Start Script (`start.sh`)

Gracefully starts the QSLX application:

```bash
./start.sh [OPTIONS]
```

**Options:**
- `--pm2` - Force use of PM2 (if installed)
- `--direct` - Force direct start without PM2
- `--help` - Show help message

**Examples:**
```bash
# Start with PM2 (recommended)
./start.sh --pm2

# Start directly (no PM2)
./start.sh --direct

# Interactive start (asks if PM2 is available)
./start.sh
```

The script will:
- Check if the app is already running
- Verify prerequisites (.env file, built application)
- Start with PM2 if available (or ask if you want to use it)
- Provide access URLs after starting

### Stop Script (`stop.sh`)

Gracefully stops the QSLX application:

```bash
./stop.sh
```

The script will:
- Detect if running with PM2 or directly
- Send SIGTERM for graceful shutdown (allows current requests to finish)
- Wait for graceful shutdown before forcing if needed
- Provide feedback on the shutdown process

**Usage:**
```bash
# Stop the application
./stop.sh
```

**Note:** The stop script works with both PM2 and direct npm start processes.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
