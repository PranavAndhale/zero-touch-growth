import MusicPortfolio from "@/components/ui/music-portfolio"

const projectsData = [
  {
    id: 1,
    artist: "ZERO-TOUCH OS",
    album: "BUSINESS INTELLIGENCE",
    category: "AI ANALYSIS",
    label: "GEMINI 2.0 FLASH",
    year: "LIVE",
    image: "https://i.pinimg.com/736x/9f/10/23/9f1023c3785097536e164d3ef7ac9fb6.jpg",
  },
  {
    id: 2,
    artist: "ZERO-TOUCH OS",
    album: "WEEKLY AI PLANNER",
    category: "AUTOMATION",
    label: "GEMINI 2.0 FLASH",
    year: "LIVE",
    image: "https://i.pinimg.com/736x/bf/f0/4d/bff04d662db206377de801ec0bc42804.jpg",
  },
  {
    id: 3,
    artist: "ZERO-TOUCH OS",
    album: "FESTIVAL CAMPAIGNS",
    category: "MARKETING",
    label: "CALENDARIFIC API",
    year: "LIVE",
    image: "https://i.pinimg.com/736x/90/cf/ec/90cfec4c5230978dba450909c676fd42.jpg",
  },
  {
    id: 4,
    artist: "ZERO-TOUCH OS",
    album: "CREATIVE STUDIO",
    category: "AI DESIGN",
    label: "STABLE DIFFUSION",
    year: "BETA",
    image: "https://i.pinimg.com/736x/8a/9d/06/8a9d06bccabc53834aa311fb3beb75f6.jpg",
  },
  {
    id: 5,
    artist: "ZERO-TOUCH OS",
    album: "AD PERFORMANCE HUB",
    category: "GROWTH",
    label: "GOOGLE ADS API",
    year: "BETA",
    image: "https://i.pinimg.com/1200x/99/0d/93/990d93d257f1f31ac12fbd161b29da8b.jpg",
  },
  {
    id: 6,
    artist: "ZERO-TOUCH OS",
    album: "GROWTH INTELLIGENCE",
    category: "INSIGHTS",
    label: "GNEWS + RSS",
    year: "LIVE",
    image: "https://i.pinimg.com/1200x/1c/17/6b/1c176b16985212a93a950d61793b7e18.jpg",
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
