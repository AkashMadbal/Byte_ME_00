"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import {
  Brain, FileQuestion, LogOut, Video, BookOpen, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

// Dynamically import ParticlesWrapper to avoid SSR issues
const ParticlesWrapper = dynamic(() => import("./ParticlesWrapper"), { ssr: false })

const motivationalQuotes = [
  "The only way to learn mathematics is to do mathematics. — Paul Halmos",
  "Education is the passport to the future... — Malcolm X",
  "The beautiful thing about learning is that no one can take it away from you. — B.B. King",
]

interface DashboardData {
  user: {
    name: string
  }
  performanceData: {
    quizNumber: number
    marks: number
  }[]
  weakTopics: string[]
  onlineDates: any[]
  error?: string
  isMongoDBError?: boolean
}

export default function Dashboard() {
  const [randomQuote, setRandomQuote] = useState("")
  const { data: session, status } = useSession()
  const router = useRouter()

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    user: { name: "" },
    performanceData: [],
    weakTopics: [],
    onlineDates: [],
    error: undefined,
    isMongoDBError: false
  })

  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard data for user:", session?.user?.email);

      if (!session?.user?.email) {
        console.error("No user email available in session");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/dashboard", {
        method: "POST",
        body: JSON.stringify({ email: session.user.email }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Could not read error response");
        console.error(`API responded with status ${res.status}: ${errorText}`);
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }

      const data = await res.json()

      // Build performanceData from result if needed
      let performanceArray = []
      if (Array.isArray(data.performanceData) && data.performanceData.length > 0) {
        performanceArray = data.performanceData
      } else if (data.result && typeof data.result === "object") {
        performanceArray = Object.entries(data.result).map(([quizNumber, marks]) => ({
          quizNumber: Number(quizNumber),
          marks: Number(marks),
        }))
      }

      setDashboardData({
        user: {
          name: data.user?.name || "User",
        },
        performanceData: performanceArray,
        weakTopics: Array.isArray(data.weakTopics) ? data.weakTopics : [],
        onlineDates: data.onlineDates || [],
      })

    } catch (error) {
      console.error("Error loading dashboard:", error)

      // Check if this is a MongoDB connection error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isMongoDBError = errorMessage.includes('MongoDB') || errorMessage.includes('Database connection');

      setDashboardData({
        user: { name: session?.user?.name || "User" },
        performanceData: [],
        weakTopics: [],
        onlineDates: [],
        error: errorMessage,
        isMongoDBError
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Session status changed:', status);
    console.log('Session data:', session);

    if (status === "authenticated" && session?.user?.email) {
      console.log('User is authenticated, fetching dashboard data');
      fetchDashboardData();
    } else if (status === "unauthenticated") {
      console.log('User is not authenticated, redirecting to login');
      setLoading(false);
      router.push('/login');
    } else if (status === "loading") {
      console.log('Session is loading...');
    } else {
      console.log('Unknown session state or missing email');
      setLoading(false);
    }
  }, [status, session, router])

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
    setRandomQuote(motivationalQuotes[randomIndex])
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Particles Background for loading state */}
        <ParticlesWrapper />
        <div className="text-center bg-white/20 backdrop-blur-md p-8 rounded-xl shadow-xl z-10">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show MongoDB error message if there's a database connection issue
  if (dashboardData.isMongoDBError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-gray-900 flex items-center justify-center relative overflow-hidden">
        <ParticlesWrapper />
        <div className="max-w-md w-full bg-white/20 backdrop-blur-md p-8 rounded-xl shadow-xl z-10 text-white">
          <div className="flex items-center justify-center mb-4 text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">Database Connection Error</h2>
          <p className="mb-4 text-center">
            Unable to connect to MongoDB. Please make sure MongoDB is running.
          </p>
          <div className="bg-black/30 p-4 rounded-md mb-6 text-sm overflow-auto max-h-32">
            <code>{dashboardData.error}</code>
          </div>
          <div className="text-center">
            <p className="mb-4">See <a href="/MONGODB_SETUP.md" className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">MONGODB_SETUP.md</a> for instructions on setting up MongoDB.</p>
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-gray-900 relative overflow-hidden">
      {/* Particles Background */}
      <ParticlesWrapper />
      <header className="bg-white/90 backdrop-blur-sm shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Atlas AI
            </span>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="flex text-black hover:text-primary items-center gap-2">
                <Video className="h-4 w-4" /> AI Mock Interview
              </Button>
              <Button variant="ghost" className="flex text-black hover:text-primary items-center gap-2"
                onClick={() => { router.push("/studytools") }}>
                <BookOpen className="h-4 w-4" /> Study Tools
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Graph and Weak Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <motion.div className="lg:col-span-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Performance Tracker</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.performanceData}>
                    <defs>
                      <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="quizNumber" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value} marks`, "Score"]} labelFormatter={(label) => `Quiz ${label}`} />
                    <Area type="monotone" dataKey="marks" stroke="#4ade80" fillOpacity={1} fill="url(#colorMarks)" activeDot={{ r: 8 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          <motion.div className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-800">Areas to Improve</CardTitle>
                <CardDescription className="text-gray-600">Focus on these topics to boost your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {dashboardData.weakTopics.map((topic, index) => (
                    <motion.li key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 * index }} className="flex items-start">
                      <Badge variant="destructive" className="mr-2 mt-1">{index + 1}</Badge>
                      <span className="text-gray-700">{topic}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Motivational Quote */}
        <motion.div className="bg-white backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary text-xl">"</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-800 italic">{randomQuote}</p>
            </div>
          </div>
        </motion.div>

        {/* AI Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card className="h-full bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800"><Brain className="h-6 w-6 mr-2 text-primary" /> AI Personal Tutor</CardTitle>
                <CardDescription className="text-gray-600">Get personalized help with any subject or topic</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4">
                  Your AI tutor adapts to your learning style and provides explanations tailored to your needs.
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {["Math", "Science", "History", "Literature", "Languages", "Coding"].map(subject => (
                    <Badge key={subject} variant="outline" className="justify-center">{subject}</Badge>
                  ))}
                </div>
                <Button className="w-full mt-4" size="lg" onClick={() => router.push("/mentor")}>
                  Chat with AI Tutor <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Card className="h-full bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800"><FileQuestion className="h-6 w-6 mr-2 text-primary" /> AI Quiz Generator</CardTitle>
                <CardDescription className="text-gray-600">Test your knowledge with personalized quizzes</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4">
                  Enter any topic and get custom quizzes with feedback and improvement tips.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Quiz Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Algebra", "Cell Biology", "Ancient Rome"].map(topic => (
                      <Badge key={topic} className="bg-blue-100 text-blue-800 hover:bg-blue-200">{topic}</Badge>
                    ))}
                  </div>
                </div>
                <Button className="w-full mt-4" size="lg" onClick={() => router.push("/quiz")}>
                  Generate a Quiz <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
