"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { MessageCircle, Phone, Clock, XCircle, AlertTriangle, DollarSign } from "lucide-react"

// Static notification badge values to avoid hydration mismatch
const notificationBadges = [
  { top: "20%", right: "-5%", value: 3 },
  { top: "35%", right: "85%", value: 7 },
  { top: "50%", right: "-5%", value: 2 },
  { top: "65%", right: "85%", value: 9 },
  { top: "80%", right: "-5%", value: 5 },
]

const chaosMessages = [
  { sender: "Customer", text: "Nimetuma 50k kwa Mpesa", time: "10:23 AM", type: "incoming" },
  { sender: "Customer", text: "Order yangu imefikaje?", time: "10:45 AM", type: "incoming" },
  { sender: "You", text: "Sawa nacheck", time: "11:02 AM", type: "outgoing" },
  { sender: "Customer 2", text: "Upo?? Nilikuorder jana!", time: "11:15 AM", type: "incoming" },
  { sender: "Customer 3", text: "Bei gani ya vitu hivi?", time: "11:30 AM", type: "incoming" },
  { sender: "Customer", text: "Bado haujanijibu!", time: "12:00 PM", type: "incoming" },
  { sender: "Customer 4", text: "Delivery inafika lini?", time: "12:15 PM", type: "incoming" },
  { sender: "Customer 5", text: "Napenda hii, iko?", time: "12:30 PM", type: "incoming" },
]

const problems = [
  { icon: MessageCircle, text: "Messages 47 unread", color: "text-red-500" },
  { icon: Phone, text: "3 missed calls", color: "text-orange-500" },
  { icon: Clock, text: "5 orders overdue", color: "text-yellow-500" },
  { icon: XCircle, text: "2 cancelled orders", color: "text-red-500" },
  { icon: AlertTriangle, text: "Payment confusion", color: "text-orange-500" },
  { icon: DollarSign, text: "Unpaid: TZS 450,000", color: "text-red-500" },
]

export function ChaosSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const chaosIntensity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.5])

  return (
    <section ref={containerRef} className="relative min-h-[200vh] py-20 overflow-hidden">
      {/* Sticky container */}
      <div className="sticky top-0 min-h-screen flex items-center justify-center py-20">
        <div className="max-w-7xl mx-auto px-4 w-full">
          
          {/* Section title */}
          <motion.div
            style={{ opacity: chaosIntensity }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Hivi ndivyo <span className="text-destructive">biashara yako</span> inavyoonekana
            </h2>
            <p className="text-lg text-muted-foreground">Kila siku. Kila wiki. Kila mwezi.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            
            {/* Phone mockup with chat chaos */}
            <motion.div
              animate={{ x: [0, -2, 2, -2, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-[2.5rem] p-2 shadow-2xl max-w-sm mx-auto">
                <div className="bg-background rounded-[2rem] overflow-hidden">
                  {/* Phone header */}
                  <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Business Chats</p>
                      <p className="text-xs text-white/70">47 unread messages</p>
                    </div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </div>

                  {/* Chat messages */}
                  <div className="h-[400px] overflow-hidden relative">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundColor: "#efeae2",
                        backgroundImage:
                          "radial-gradient(circle at 1px 1px, rgba(7,94,84,0.08) 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                    <div className="relative p-3 space-y-2">
                      {chaosMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: msg.type === "incoming" ? -50 : 50 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          className={`flex ${msg.type === "outgoing" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 ${
                              msg.type === "outgoing"
                                ? "bg-[#DCF8C6] text-black"
                                : "bg-white text-black"
                            }`}
                          >
                            {msg.type === "incoming" && (
                              <p className="text-xs font-semibold text-[#075E54] mb-1">{msg.sender}</p>
                            )}
                            <p className="text-sm">{msg.text}</p>
                            <p className="text-[10px] text-gray-500 text-right mt-1">{msg.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Overwhelm overlay */}
                    <motion.div
                      style={{ opacity: useTransform(scrollYProgress, [0.3, 0.5], [0, 0.9]) }}
                      className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent flex items-end justify-center pb-10"
                    >
                      <p className="text-white font-bold text-xl">OVERWHELMED</p>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating notification badges - only render after mount to avoid hydration issues */}
              {mounted && notificationBadges.map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    delay: i * 0.3,
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="absolute bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    top: badge.top,
                    right: badge.right,
                  }}
                >
                  {badge.value}
                </motion.div>
              ))}
            </motion.div>

            {/* Problem cards */}
            <div className="space-y-4">
              {/* Seller illustration - stressed */}
              <motion.div
                style={{ opacity: chaosIntensity }}
                className="bg-card border border-border rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-3xl">
                      <span role="img" aria-label="stressed seller">😰</span>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs">!</span>
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Amina - Online Seller</h3>
                    <p className="text-muted-foreground">Dar es Salaam, Tanzania</p>
                    <p className="text-sm text-destructive mt-1">Stress level: MAXIMUM</p>
                  </div>
                </div>
              </motion.div>

              {/* Problem indicators */}
              <div className="grid grid-cols-2 gap-3">
                {problems.map((problem, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
                  >
                    <problem.icon className={`w-5 h-5 ${problem.color}`} />
                    <span className="text-sm text-foreground">{problem.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Lost money indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 mt-4"
              >
                <div className="flex items-center gap-4">
                  <AlertTriangle className="w-10 h-10 text-destructive" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated monthly loss</p>
                    <p className="text-2xl font-bold text-destructive">TZS 2,500,000+</p>
                    <p className="text-xs text-muted-foreground mt-1">From missed orders, confused payments, lost customers</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
