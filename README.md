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
git clone <your-repo-url>
cd QSLX
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
```
DATABASE_URL="file:./db.sqlite"
AUTH_SECRET="your-secret-here" # Generate with: openssl rand -base64 32
AUTH_DISCORD_ID="" # Optional: Discord OAuth Client ID
AUTH_DISCORD_SECRET="" # Optional: Discord OAuth Client Secret
```

**Note**: For authentication, you can either:
- Set up Discord OAuth (recommended for production): Get credentials from https://discord.com/developers/applications
- Or use any other NextAuth provider (GitHub, Google, etc.) - see `src/server/auth/config.ts`

4. Initialize the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Raspberry Pi

### Option 1: Direct Node.js Deployment

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
git clone <your-repo-url> QSLX
cd QSLX
npm install
npm run build
```

3. **Set up environment variables** (create `.env` file)

4. **Run database migrations:**
```bash
npm run db:push
```

5. **Start the application:**
```bash
npm start
```

### Option 2: Using PM2 (Recommended for Production)

1. **Install PM2:**
```bash
npm install -g pm2
```

2. **Start the application with PM2:**
```bash
pm2 start npm --name "qslx" -- start
pm2 save
pm2 startup
```

3. **Access your application:**
   - If running on the Pi itself: `http://localhost:3000`
   - From another device on the network: `http://<raspberry-pi-ip>:3000`

### Option 3: Docker Deployment (Coming Soon)

For easier deployment and updates, you can containerize the application with Docker.

## Usage

1. **Sign In**: Use the authentication system to create an account or sign in
2. **Log Contacts**: Click "Log Contact" to add new QSOs
3. **View Dashboard**: See your statistics and recent contacts
4. **Explore Maps**: View all your contacts on an interactive world map
5. **Check Analytics**: Dive into detailed statistics and charts
6. **Calendar View**: See your contact activity over time

## Database

The application uses SQLite by default, which is perfect for lightweight deployments. The database file (`db.sqlite`) is stored in the project root.

To view/edit data directly:
```bash
npm run db:studio
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
