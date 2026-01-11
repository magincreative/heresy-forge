# Heresy Forge - Horus Heresy Army List Builder

A modern, mobile-first web application for building and managing army lists for Warhammer: The Horus Heresy tabletop game.

## Features

### ✅ Core Army Builder
- Create and manage multiple army lists
- Support for Legiones Astartes and other armies
- Crusade Primary, Apex, and Auxiliary detachments
- Unit selection with role-based organization
- Equipment and wargear customization
- Prime Slot Benefits system
- Logistical Benefits with dynamic role slots
- Real-time points calculation and validation
- Mobile-responsive design

### ✅ Authentication & Cloud Sync
- Email + OTP authentication (passwordless)
- Cloud storage with Supabase
- Multi-device synchronization
- Guest mode with local storage

### ✅ Export & Sharing
- Professional PDF export
- Detailed army summaries
- Print-friendly formatting

## Tech Stack

- **Framework:** Next.js 16
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS
- **PDF Generation:** jsPDF
- **Hosting:** Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/heresy-forge.git
cd heresy-forge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

The application requires several Supabase tables. See the database schema in the project documentation.

Required tables:
- `army_lists` - User army lists
- `units` - Game unit data
- `detachments` - Detachment templates
- `prime_benefits` - Prime Slot Benefit definitions
- `weapon_lists` - Weapon list definitions

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will automatically deploy on every push to the main branch.

## Project Structure

```
heresy-forge/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── list/              # List pages
│   └── page.js            # Home page
├── components/            # React components
├── contexts/              # React contexts (Auth, etc.)
├── lib/                   # Utilities and helpers
├── public/                # Static assets
├── sections/              # Page sections
└── styles/                # Global styles
```

## Contributing

This is a personal project, but suggestions and bug reports are welcome!

## License

MIT License - feel free to use this project as inspiration for your own army builders.

## Acknowledgments

- Warhammer: The Horus Heresy is a trademark of Games Workshop
- This is a fan-made tool and is not affiliated with or endorsed by Games Workshop

---

Built with ❤️ for the Horus Heresy community
