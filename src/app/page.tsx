import MusicPortfolio from "@/components/ui/music-portfolio"

const projectsData = [
  {
    id: 1,
    artist: "ZERO-TOUCH OS",
    album: "BUSINESS INTELLIGENCE",
    category: "AI ANALYSIS",
    label: "GEMINI 2.0 FLASH",
    year: "LIVE",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    artist: "ZERO-TOUCH OS",
    album: "WEEKLY AI PLANNER",
    category: "AUTOMATION",
    label: "GEMINI 2.0 FLASH",
    year: "LIVE",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    artist: "ZERO-TOUCH OS",
    album: "FESTIVAL CAMPAIGNS",
    category: "MARKETING",
    label: "CALENDARIFIC API",
    year: "LIVE",
    image: "https://images.unsplash.com/photo-1574192279858-fd8e7e5cab4f?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    artist: "ZERO-TOUCH OS",
    album: "CREATIVE STUDIO",
    category: "AI DESIGN",
    label: "STABLE DIFFUSION",
    year: "BETA",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    artist: "ZERO-TOUCH OS",
    album: "AD PERFORMANCE HUB",
    category: "GROWTH",
    label: "GOOGLE ADS API",
    year: "BETA",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: 6,
    artist: "ZERO-TOUCH OS",
    album: "GROWTH INTELLIGENCE",
    category: "INSIGHTS",
    label: "GNEWS + RSS",
    year: "LIVE",
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: 7,
    artist: "ZERO-TOUCH OS",
    album: "INSTANT ONBOARDING",
    category: "SETUP",
    label: "CHEERIO SCRAPER",
    year: "LIVE",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
  },
]

const config = {
  timeZone: "Asia/Kolkata",
  timeUpdateInterval: 1000,
  idleDelay: 3500,
  debounceDelay: 80,
}

const socialLinks = {
  dashboard: "/dashboard",
  onboard: "/onboard",
  github: "https://github.com/PranavAndhale/zero-touch-growth",
}

const location = {
  latitude: "19.0760° N",
  longitude: "72.8777° E",
  display: true,
}

export default function Home() {
  return (
    <MusicPortfolio
      PROJECTS_DATA={projectsData}
      CONFIG={config}
      SOCIAL_LINKS={socialLinks}
      LOCATION={location}
    />
  )
}
