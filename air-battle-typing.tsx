"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, Clock, Zap, Award, Volume2, Radar, Target } from "lucide-react"

const SAMPLE_TEXTS = [
  "The sky is the limit when courage meets precision. Every pilot knows that victory belongs to those who dare to fly beyond their fears and push the boundaries of what seems possible in aerial combat.",
  "In the realm of aerial combat, split-second decisions determine the outcome. The roar of engines, the rush of wind, and the precision of movement create a symphony of controlled chaos above the clouds.",
  "High above the clouds, where eagles soar and legends are born, the dance of aerial supremacy unfolds with grace, power, and unwavering determination to protect the skies from enemy forces.",
  "Through turbulent skies and challenging weather, the spirit of aviation continues to inspire generations of pilots who dream of touching the heavens with wings of steel and hearts of pure courage.",
  "When the alarm sounds and scramble orders are given, every second counts as pilots race to their aircraft, knowing that the fate of the mission depends on their skill, speed, and determination.",
]

export default function Component() {
  const [gameState, setGameState] = useState<"start" | "rules" | "playing" | "win" | "lose">("start")
  const [currentText, setCurrentText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [rafalePosition, setRafalePosition] = useState(50)
  const [jf17Position, setJf17Position] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [statusMessage, setStatusMessage] = useState("")
  const [mistakes, setMistakes] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [showMissile, setShowMissile] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [cloudPositions, setCloudPositions] = useState<Array<{ x: number; y: number; size: number; speed: number }>>([])
  const [animationFrame, setAnimationFrame] = useState(0)
  const [altitude, setAltitude] = useState(15000)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const animationRef = useRef<number>()

  // Initialize moving clouds and atmospheric effects
  useEffect(() => {
    const clouds = Array.from({ length: 15 }, (_, i) => ({
      x: Math.random() * 130 - 30,
      y: Math.random() * 80 + 5,
      size: Math.random() * 50 + 30,
      speed: Math.random() * 0.4 + 0.1,
    }))
    setCloudPositions(clouds)

    const animate = () => {
      setAnimationFrame((prev) => prev + 1)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Update cloud positions and altitude
  useEffect(() => {
    setCloudPositions((prev) =>
      prev.map((cloud) => ({
        ...cloud,
        x: cloud.x + cloud.speed > 130 ? -30 : cloud.x + cloud.speed,
      })),
    )

    // Dynamic altitude based on speed
    if (gameState === "playing") {
      setAltitude(15000 + wpm * 100)
    }
  }, [animationFrame, wpm, gameState])

  const startGame = () => {
    const randomText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]
    setCurrentText(randomText)
    setUserInput("")
    setStartTime(Date.now())
    setTimeElapsed(0)
    setRafalePosition(50)
    setJf17Position(0)
    setWpm(0)
    setAccuracy(100)
    setMistakes(0)
    setTotalChars(0)
    setShowMissile(false)
    setShowExplosion(false)
    setAltitude(15000)
    setStatusMessage("🚀 ENGINES IGNITED! CLIMB TO COMBAT ALTITUDE!")
    setGameState("playing")

    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const calculateStats = () => {
    if (!startTime) return

    const timeInMinutes = timeElapsed / 60
    const wordsTyped = userInput.trim().split(" ").length
    const currentWpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0
    const currentAccuracy = totalChars > 0 ? Math.round(((totalChars - mistakes) / totalChars) * 100) : 100

    setWpm(currentWpm)
    setAccuracy(currentAccuracy)
  }

  const updateGameMechanics = () => {
    const correctChars = userInput.length
    const expectedChars = Math.floor((timeElapsed / 60) * 50)
    const charsBehind = Math.max(0, expectedChars - correctChars)

    const progress = (correctChars / currentText.length) * 100
    setRafalePosition(50 + progress * 4.5)

    if (charsBehind >= 3) {
      setJf17Position((prev) => Math.min(prev + 9, rafalePosition - 25))
      setShowMissile(true)
      setStatusMessage("🚨 MISSILE LOCK! EVASIVE MANEUVERS REQUIRED!")
    } else if (accuracy < 80) {
      setJf17Position((prev) => Math.min(prev + 7, rafalePosition - 25))
      setShowMissile(true)
      setStatusMessage("⚠️ ENEMY GAINING! IMPROVE ACCURACY NOW!")
    } else if (wpm > 50) {
      setShowMissile(false)
      setStatusMessage("💨 SUPERSONIC SPEED! AFTERBURNERS AT MAXIMUM!")
    } else if (wpm > 35) {
      setShowMissile(false)
      setStatusMessage("✈️ EXCELLENT SPEED! MAINTAINING DISTANCE!")
    } else {
      setShowMissile(false)
      setStatusMessage("🎯 INCREASE TYPING SPEED FOR BETTER THRUST!")
    }

    if (jf17Position >= rafalePosition - 25) {
      setShowExplosion(true)
      setGameState("lose")
      setStatusMessage("💥 DIRECT HIT! RAFALE DOWN! MISSION FAILED!")
    }

    if (userInput === currentText) {
      setGameState("win")
      setStatusMessage("🏆 MISSION ACCOMPLISHED! RAFALE ESCAPED TO SAFETY!")
    }
  }

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [gameState])

  useEffect(() => {
    if (gameState === "playing") {
      calculateStats()
      updateGameMechanics()
    }
  }, [timeElapsed, userInput, mistakes, totalChars])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const currentChar = value[value.length - 1]
    const expectedChar = currentText[value.length - 1]

    if (value.length > userInput.length) {
      setTotalChars((prev) => prev + 1)
      if (currentChar !== expectedChar) {
        setMistakes((prev) => prev + 1)
      }
    }

    setUserInput(value)
  }

  const resetGame = () => {
    setGameState("start")
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const renderStartScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-orange-200 via-sky-400 via-blue-600 via-indigo-700 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        {cloudPositions.slice(0, 8).map((cloud, index) => (
          <div
            key={index}
            className="absolute bg-white/50 rounded-full animate-pulse shadow-xl"
            style={{
              left: `${cloud.x}%`,
              top: `${cloud.y}%`,
              width: `${cloud.size}px`,
              height: `${cloud.size * 0.6}px`,
              animationDelay: `${index * 0.2}s`,
              filter: "blur(0.5px)",
            }}
          />
        ))}

        {/* Atmospheric effects */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-60 left-1/4 w-2 h-2 bg-cyan-300 rounded-full animate-ping"></div>
        <div className="absolute top-60 right-1/4 w-1 h-1 bg-pink-300 rounded-full animate-pulse"></div>
      </div>

      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-blue-900 via-indigo-900 to-purple-900 backdrop-blur-lg border-4 border-cyan-400 shadow-2xl shadow-cyan-500/50">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center items-center gap-12 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-800 to-indigo-900 p-4 rounded-xl border-2 border-orange-400">
                <img
                  src="/1.png?height=80&width=100&text=RAFALE"
                  alt="Indian Rafale Fighter Jet"
                  className="w-28 h-20 object-contain filter brightness-110 drop-shadow-2xl group-hover:scale-110 transition-transform"
                />
                <div className="absolute -top-3 -right-3 text-3xl animate-bounce">🇮🇳</div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-sm text-orange-300 font-bold bg-slate-800 px-2 py-1 rounded">
                  RAFALE
                </div>
              </div>
            </div>

            <div className="text-6xl animate-pulse text-red-500 drop-shadow-lg">⚔️</div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-green-800 to-emerald-900 p-4 rounded-xl border-2 border-green-400">
                <img
                  src="/2.png"
                  alt="Pakistani JF-17 Thunder"
                  className="w-28 h-20 object-contain filter brightness-110 drop-shadow-2xl group-hover:scale-110 transition-transform"
                />
                <div className="absolute -top-3 -right-3 text-3xl animate-bounce">🇵🇰</div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-sm text-green-300 font-bold bg-slate-800 px-2 py-1 rounded">
                  JF-17 THUNDER
                </div>
              </div>
            </div>
          </div>

          <CardTitle className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 drop-shadow-lg">
            AIR BATTLE ROYALE
          </CardTitle>
          <CardTitle className="text-3xl font-bold text-yellow-400 mb-3 drop-shadow-lg">TYPING COMBAT</CardTitle>
          <p className="text-cyan-300 text-xl font-semibold mb-2">🇮🇳 Indian Air Force vs 🇵🇰 Pakistan Air Force</p>
          <p className="text-lg text-yellow-300 animate-pulse font-bold">⚡ TYPE FAST OR GET SHOT DOWN! ⚡</p>
          <p className="text-sm text-gray-300 mt-2">High-altitude aerial combat simulation</p>
        </CardHeader>

        <CardContent className="space-y-5 pb-8">
          <Button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-red-600 via-orange-500 via-yellow-500 to-red-600 hover:from-red-700 hover:via-orange-600 hover:via-yellow-600 hover:to-red-700 text-white font-bold py-5 text-2xl border-3 border-yellow-400 shadow-2xl shadow-orange-500/50 transform hover:scale-105 transition-all duration-300"
          >
            <Plane className="w-8 h-8 mr-4" />🚀 LAUNCH MISSION
          </Button>

          <Button
            onClick={() => setGameState("rules")}
            className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-white font-bold py-4 text-lg border-2 border-cyan-400 shadow-xl shadow-blue-500/50"
          >
            📋 MISSION BRIEFING
          </Button>

          <Button
            onClick={() => window.close()}
            className="w-full bg-gradient-to-r from-gray-600 via-slate-600 to-gray-600 hover:from-gray-700 hover:via-slate-700 hover:to-gray-700 text-white font-bold py-4 text-lg border-2 border-gray-400"
          >
            🚪 ABORT MISSION
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderRulesScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-orange-200 via-sky-400 via-blue-600 via-indigo-700 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Moving clouds background */}
      <div className="absolute inset-0">
        {cloudPositions.map((cloud, index) => (
          <div
            key={index}
            className="absolute bg-white/40 rounded-full"
            style={{
              left: `${cloud.x}%`,
              top: `${cloud.y}%`,
              width: `${cloud.size}px`,
              height: `${cloud.size * 0.6}px`,
              filter: "blur(1px)",
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-4xl bg-gradient-to-br from-slate-900 via-blue-900 via-indigo-900 to-purple-900 backdrop-blur-lg border-4 border-cyan-400 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-5xl font-bold text-center bg-gradient-to-r from-cyan-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
            🎯 MISSION BRIEFING
          </CardTitle>
          <p className="text-center text-gray-300 text-lg mt-2">High-Altitude Combat Operations Manual</p>
        </CardHeader>

        <CardContent className="space-y-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-900/90 to-red-700/90 p-6 rounded-xl border-2 border-red-400 shadow-lg">
              <p className="font-bold text-yellow-400 text-xl mb-3">🚨 CRITICAL MISSION:</p>
              <p className="text-red-100">
                Indian Air Force Rafale under attack! Pakistani JF-17 Thunder has achieved radar lock. Execute evasive
                maneuvers using advanced typing controls!
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/90 to-cyan-700/90 p-6 rounded-xl border-2 border-cyan-400 shadow-lg">
              <p className="font-bold text-yellow-400 text-xl mb-3">✈️ FLIGHT CONTROLS:</p>
              <p className="text-blue-100">
                Typing speed controls thrust vectoring and aircraft maneuverability. Higher WPM = Superior escape
                velocity and altitude gain!
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-900/90 to-emerald-700/90 p-6 rounded-xl border-2 border-green-400 shadow-lg">
              <p className="font-bold text-yellow-400 text-xl mb-3">🎯 ENEMY ASSESSMENT:</p>
              <p className="text-green-100">
                JF-17 Thunder equipped with beyond-visual-range missiles. Will close distance if typing accuracy drops
                below 80% or speed falls behind!
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/90 to-violet-700/90 p-6 rounded-xl border-2 border-purple-400 shadow-lg">
              <p className="font-bold text-yellow-400 text-xl mb-3">🏆 VICTORY CONDITIONS:</p>
              <p className="text-purple-100">
                Complete entire text with maximum accuracy to successfully escape to friendly airspace and complete the
                mission!
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-900/90 to-red-700/90 p-6 rounded-xl border-2 border-orange-400 text-center">
            <p className="font-bold text-yellow-400 text-xl mb-2">💥 MISSION FAILURE:</p>
            <p className="text-orange-100 text-lg">
              If enemy aircraft closes within 25px range, missile impact is inevitable! Maintain distance at all costs!
            </p>
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => setGameState("start")}
              className="flex-1 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 border-2 border-gray-400 text-white font-bold py-3 text-lg"
            >
              ← RETURN TO BASE
            </Button>
            <Button
              onClick={startGame}
              className="flex-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-700 hover:via-orange-600 hover:to-yellow-600 font-bold text-white text-lg py-3 shadow-lg shadow-orange-500/50"
            >
              🚀 LAUNCH MISSION!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderGameScreen = () => {
    const progress = (userInput.length / currentText.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100 via-sky-300 via-blue-500 via-indigo-600 to-purple-800 relative overflow-hidden">
        {/* Enhanced dynamic sky with moving clouds */}
        <div className="absolute inset-0">
          {cloudPositions.map((cloud, index) => (
            <div
              key={index}
              className="absolute bg-white/60 rounded-full shadow-lg"
              style={{
                left: `${cloud.x}%`,
                top: `${cloud.y}%`,
                width: `${cloud.size}px`,
                height: `${cloud.size * 0.6}px`,
                filter: "blur(0.5px)",
                boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
              }}
            />
          ))}

          {/* Enhanced contrails and atmospheric effects */}
          <div className="absolute top-28 left-0 w-full h-3 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
          <div className="absolute top-44 left-0 w-full h-2 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"></div>
          <div className="absolute top-60 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"></div>

          {/* Wind effect lines */}
          <div className="absolute top-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"></div>
          <div className="absolute top-52 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse delay-500"></div>
        </div>

        {/* Advanced Combat HUD */}
        <div className="bg-gradient-to-r from-black via-slate-900 via-blue-900 to-black text-green-400 p-6 flex justify-between items-center border-b-4 border-cyan-400 font-mono shadow-2xl shadow-cyan-500/50">
          <div className="flex gap-12">
            <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800/90 to-gray-800/90 px-4 py-3 rounded-xl border-2 border-yellow-400 shadow-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="text-xs text-gray-400">MISSION TIME</div>
                <span className="text-yellow-300 font-bold text-lg">
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800/90 to-gray-800/90 px-4 py-3 rounded-xl border-2 border-blue-400 shadow-lg">
              <Zap className="w-6 h-6 text-blue-400" />
              <div>
                <div className="text-xs text-gray-400">AIRSPEED</div>
                <span className="text-blue-300 font-bold text-lg">{wpm} WPM</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800/90 to-gray-800/90 px-4 py-3 rounded-xl border-2 border-green-400 shadow-lg">
              <Award className="w-6 h-6 text-green-400" />
              <div>
                <div className="text-xs text-gray-400">ACCURACY</div>
                <span className="text-green-300 font-bold text-lg">{accuracy}%</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-800/90 to-gray-800/90 px-4 py-3 rounded-xl border-2 border-purple-400 shadow-lg">
              <div className="text-xs text-gray-400">ALTITUDE</div>
              <span className="text-purple-300 font-bold text-lg">{altitude.toLocaleString()} ft</span>
            </div>

            <div className="bg-gradient-to-r from-slate-800/90 to-gray-800/90 px-4 py-3 rounded-xl border-2 border-cyan-400 shadow-lg">
              <div className="text-xs text-gray-400">PROGRESS</div>
              <span className="text-cyan-300 font-bold text-lg">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="text-red-400 font-bold animate-pulse text-xl bg-gradient-to-r from-red-900/80 to-pink-900/80 px-6 py-3 rounded-xl border-2 border-red-400 shadow-lg">
            {statusMessage}
          </div>
        </div>

        {/* Enhanced Combat Zone */}
        <div className="relative h-[400px] mt-8">
          {/* Enhanced altitude grid lines */}
          <div className="absolute top-1/5 left-0 right-0 h-px bg-cyan-300/50 shadow-sm"></div>
          <div className="absolute top-2/5 left-0 right-0 h-px bg-cyan-300/70 shadow-sm"></div>
          <div className="absolute top-3/5 left-0 right-0 h-px bg-cyan-300/70 shadow-sm"></div>
          <div className="absolute top-4/5 left-0 right-0 h-px bg-cyan-300/50 shadow-sm"></div>

          {/* Enhanced Rafale Fighter Jet */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 z-30"
            style={{ left: `${Math.min(rafalePosition, 85)}%` }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
              <img
                src="/1.png?height=60&width=80&text=RAFALE"
                alt="Indian Rafale"
                className="relative w-24 h-16 object-contain filter brightness-110 drop-shadow-2xl transform hover:scale-110 transition-transform"
                style={{ transform: "rotate(-10deg)" }}
              />
              <div className="absolute -top-3 -right-3 text-2xl animate-bounce drop-shadow-lg">🇮🇳</div>

              {/* Enhanced engine exhaust effects */}
              <div className="absolute left-0 top-1/2 w-16 h-3 bg-gradient-to-l from-orange-500 via-yellow-400 via-blue-400 to-transparent transform -translate-y-1/2 -translate-x-16 animate-pulse rounded-full"></div>
              <div className="absolute left-0 top-1/2 w-12 h-2 bg-gradient-to-l from-blue-400 via-cyan-300 to-transparent transform -translate-y-1/2 -translate-x-12 rounded-full"></div>

              {/* Speed indicators */}
              {wpm > 35 && (
                <div className="absolute left-0 top-1/2 w-20 h-1 bg-gradient-to-l from-white via-cyan-300 to-transparent transform -translate-y-1/2 -translate-x-20 animate-ping"></div>
              )}
              {wpm > 50 && (
                <div className="absolute left-0 top-1/2 w-24 h-px bg-gradient-to-l from-yellow-300 via-orange-300 to-transparent transform -translate-y-1/2 -translate-x-24 animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Enhanced JF-17 Thunder */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 z-20"
            style={{ left: `${Math.max(jf17Position, 5)}%` }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-red-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
              <img
                src="/2.png"
                alt="Pakistani JF-17 Thunder"
                className="relative w-22 h-14 object-contain filter brightness-110 drop-shadow-2xl transform hover:scale-110 transition-transform"
                style={{ transform: "rotate(-8deg)" }}
              />
              <div className="absolute -top-3 -right-3 text-2xl animate-bounce drop-shadow-lg">🇵🇰</div>

              {/* Engine exhaust */}
              <div className="absolute left-0 top-1/2 w-14 h-3 bg-gradient-to-l from-red-500 via-orange-400 to-transparent transform -translate-y-1/2 -translate-x-14 animate-pulse rounded-full"></div>

              {/* Enhanced radar sweep effect */}
              <div className="absolute -top-6 -left-6 w-12 h-12 border-3 border-red-400 rounded-full animate-ping"></div>
              <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Enhanced Missile Trail */}
          {showMissile && (
            <div className="absolute top-1/2 transform -translate-y-1/2 z-25" style={{ left: `${jf17Position + 15}%` }}>
              <div className="relative">
                <div className="w-16 h-3 bg-gradient-to-r from-red-600 via-orange-500 via-yellow-400 to-white animate-pulse rounded-full shadow-lg"></div>
                <div className="absolute left-0 top-1/2 w-20 h-2 bg-gradient-to-r from-yellow-400 via-orange-300 to-transparent transform -translate-y-1/2 rounded-full"></div>
                <div className="text-2xl animate-bounce drop-shadow-lg">🚀</div>
                <div className="absolute -top-3 -left-3 w-8 h-8 border-3 border-red-500 rounded-full animate-ping"></div>
                <div className="absolute -top-2 -left-2 w-6 h-6 border-2 border-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Enhanced Explosion Effect */}
          {showExplosion && (
            <div className="absolute top-1/2 transform -translate-y-1/2 z-40" style={{ left: `${rafalePosition}%` }}>
              <div className="text-8xl animate-ping drop-shadow-2xl">💥</div>
              <div className="text-6xl animate-pulse drop-shadow-xl">🔥</div>
              <div className="text-4xl animate-bounce drop-shadow-lg">💀</div>
              <div className="absolute -top-8 -left-8 w-20 h-20 border-4 border-red-500 rounded-full animate-ping"></div>
              <div className="absolute -top-6 -left-6 w-16 h-16 border-3 border-orange-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Enhanced Typing Interface */}
        <div className="max-w-7xl mx-auto p-6">
          <Card className="bg-gradient-to-br from-slate-900 via-blue-900 via-indigo-900 to-purple-900 backdrop-blur-lg border-4 border-cyan-400 shadow-2xl shadow-cyan-500/50">
            <CardContent className="p-8">
              <div className="mb-8 p-8 bg-gradient-to-r from-gray-900 via-slate-800 via-gray-900 to-slate-800 rounded-2xl font-mono text-xl leading-relaxed border-4 border-green-400 shadow-inner shadow-green-500/30">
                {currentText.split("").map((char, index) => {
                  let className = "text-gray-300"
                  if (index < userInput.length) {
                    className =
                      userInput[index] === char
                        ? "bg-gradient-to-r from-green-500 to-emerald-400 text-black font-bold rounded-md px-1 py-0.5 shadow-lg"
                        : "bg-gradient-to-r from-red-500 to-pink-400 text-white font-bold animate-pulse rounded-md px-1 py-0.5 shadow-lg"
                  } else if (index === userInput.length) {
                    className =
                      "bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold animate-pulse rounded-md px-1 py-0.5 shadow-lg"
                  }
                  return (
                    <span key={index} className={className}>
                      {char}
                    </span>
                  )
                })}
              </div>

              <Input
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                placeholder="🎯 TYPE HERE TO CONTROL YOUR FIGHTER JET AND ESCAPE..."
                className="text-2xl p-8 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 border-4 border-green-400 text-green-300 placeholder-green-600 font-mono shadow-2xl shadow-green-500/40 rounded-xl"
                disabled={gameState !== "playing"}
              />

              <div className="mt-8 flex justify-between items-center">
                <Button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 hover:from-red-700 hover:via-pink-700 hover:to-red-700 text-white font-bold text-lg py-4 px-8 border-2 border-red-400 shadow-xl shadow-red-500/50 rounded-xl"
                >
                  🚪 ABORT MISSION
                </Button>

                <div className="text-green-400 font-mono text-2xl bg-gradient-to-r from-slate-800/90 to-gray-800/90 px-6 py-4 rounded-xl border-2 border-green-400 shadow-lg">
                  CHARS: {userInput.length} / {currentText.length}
                </div>

                <div className="flex items-center gap-4 text-yellow-400 bg-gradient-to-r from-slate-800/90 to-gray-800/90 px-6 py-4 rounded-xl border-2 border-yellow-400 shadow-lg">
                  <Volume2 className="w-6 h-6 animate-pulse" />
                  <Radar className="w-6 h-6 animate-spin" />
                  <Target className="w-6 h-6 animate-ping" />
                  <span className="font-bold text-lg">COMBAT ACTIVE</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderEndScreen = (isWin: boolean) => (
    <div className="min-h-screen bg-gradient-to-b from-orange-200 via-sky-400 via-blue-600 via-indigo-700 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced animated background effects */}
      <div className="absolute inset-0">
        {cloudPositions.slice(0, 10).map((cloud, index) => (
          <div
            key={index}
            className="absolute bg-white/40 rounded-full"
            style={{
              left: `${cloud.x}%`,
              top: `${cloud.y}%`,
              width: `${cloud.size}px`,
              height: `${cloud.size * 0.6}px`,
              filter: "blur(1px)",
            }}
          />
        ))}

        {isWin ? (
          <>
            <div className="absolute top-20 left-20 text-9xl animate-bounce drop-shadow-2xl">🎆</div>
            <div className="absolute top-32 right-32 text-7xl animate-pulse drop-shadow-xl">✨</div>
            <div className="absolute bottom-40 left-1/3 text-8xl animate-spin drop-shadow-2xl">🏆</div>
            <div className="absolute top-1/2 right-20 text-6xl animate-ping drop-shadow-lg">🎉</div>
            <div className="absolute bottom-60 right-1/4 text-5xl animate-bounce drop-shadow-lg">🌟</div>
          </>
        ) : (
          <>
            <div className="absolute top-20 left-20 text-9xl animate-pulse drop-shadow-2xl">💥</div>
            <div className="absolute top-32 right-32 text-7xl animate-bounce drop-shadow-xl">🔥</div>
            <div className="absolute bottom-40 left-1/3 text-8xl animate-ping drop-shadow-2xl">💀</div>
            <div className="absolute top-1/2 right-20 text-6xl animate-pulse drop-shadow-lg">⚡</div>
            <div className="absolute bottom-60 right-1/4 text-5xl animate-bounce drop-shadow-lg">💣</div>
          </>
        )}
      </div>

      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-blue-900 via-indigo-900 to-purple-900 backdrop-blur-lg border-4 border-cyan-400 shadow-2xl shadow-cyan-500/50">
        <CardHeader className="text-center pb-8">
          <div className="text-10xl mb-8 animate-pulse drop-shadow-2xl">{isWin ? "🏆" : "💥"}</div>
          <CardTitle
            className={`text-5xl font-bold mb-4 drop-shadow-lg ${isWin ? "bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-red-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"}`}
          >
            {isWin ? "🎯 MISSION SUCCESS!" : "💀 AIRCRAFT DOWN!"}
          </CardTitle>
          <p className="text-gray-300 text-2xl mt-4 font-semibold">
            {isWin
              ? "🇮🇳 Rafale successfully escaped to friendly airspace!"
              : "🇵🇰 JF-17 Thunder achieved missile lock and impact!"}
          </p>
          <p className="text-lg text-gray-400 mt-2">
            {isWin
              ? "Outstanding pilot performance in combat conditions!"
              : "Mission failed - pilot needs additional training!"}
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="bg-gradient-to-r from-gray-900 via-slate-800 via-gray-900 to-slate-800 p-8 rounded-2xl space-y-6 border-4 border-yellow-400 shadow-2xl shadow-yellow-500/40">
            <div className="text-center text-yellow-400 font-bold text-3xl mb-6">📊 MISSION DEBRIEF</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-cyan-300 text-sm mb-1">FINAL AIRSPEED</div>
                <div className="font-bold text-blue-400 text-3xl">{wpm}</div>
                <div className="text-blue-300 text-sm">WPM</div>
              </div>

              <div className="text-center">
                <div className="text-cyan-300 text-sm mb-1">FLIGHT ACCURACY</div>
                <div className="font-bold text-green-400 text-3xl">{accuracy}</div>
                <div className="text-green-300 text-sm">PERCENT</div>
              </div>

              <div className="text-center">
                <div className="text-cyan-300 text-sm mb-1">MISSION DURATION</div>
                <div className="font-bold text-yellow-400 text-3xl">
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, "0")}
                </div>
                <div className="text-yellow-300 text-sm">MINUTES</div>
              </div>
            </div>

            <div className="text-center text-xl text-gray-300 mt-6 font-semibold border-t border-gray-600 pt-6">
              {isWin ? "🏅 EXCEPTIONAL COMBAT PERFORMANCE!" : "⚠️ REQUIRES ADDITIONAL FLIGHT TRAINING!"}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={startGame}
              className="flex-1 bg-gradient-to-r from-red-600 via-orange-500 via-yellow-500 to-red-600 hover:from-red-700 hover:via-orange-600 hover:via-yellow-600 hover:to-red-700 font-bold text-white text-xl py-4 shadow-2xl shadow-orange-500/50 transform hover:scale-105 transition-all duration-300 rounded-xl"
            >
              🚀 NEW MISSION
            </Button>
            <Button
              onClick={resetGame}
              className="flex-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-white font-bold text-xl py-4 shadow-xl shadow-blue-500/50 rounded-xl"
            >
              🏠 RETURN TO BASE
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  switch (gameState) {
    case "start":
      return renderStartScreen()
    case "rules":
      return renderRulesScreen()
    case "playing":
      return renderGameScreen()
    case "win":
      return renderEndScreen(true)
    case "lose":
      return renderEndScreen(false)
    default:
      return renderStartScreen()
  }
}
// ashu191