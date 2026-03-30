"use client"

import { motion } from "framer-motion"
import { MessageCircle, Package, CreditCard, Truck, AlertCircle } from "lucide-react"

const floatingMessages = [
  { text: "Umetuma pesa?", delay: 0, x: -200, y: -100 },
  { text: "Order yangu iko wapi?", delay: 0.5, x: 180, y: -80 },
  { text: "Nilikuwa order jana!", delay: 1, x: -150, y: 50 },
  { text: "Bado sijarecieve", delay: 1.5, x: 200, y: 100 },
  { text: "Sema bei ya hii", delay: 2, x: -180, y: 150 },
  { text: "Niko ready kulipa", delay: 2.5, x: 160, y: -150 },
]

const notificationIcons = [
  { Icon: MessageCircle, color: "text-green-500", delay: 0, xOffset: 20, yOffset: -30 },
  { Icon: Package, color: "text-orange-500", delay: 0.3, xOffset: -40, yOffset: 50 },
  { Icon: CreditCard, color: "text-blue-500", delay: 0.6, xOffset: 60, yOffset: -20 },
  { Icon: Truck, color: "text-yellow-500", delay: 0.9, xOffset: -30, yOffset: 40 },
  { Icon: AlertCircle, color: "text-red-500", delay: 1.2, xOffset: 10, yOffset: -50 },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background" />
      
      {/* Animated chat bubbles floating in background */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 0.7, 0.7, 0],
              scale: [0.5, 1, 1, 0.8],
              x: [msg.x * 0.5, msg.x, msg.x * 1.2],
              y: [msg.y * 0.5, msg.y, msg.y * 1.3],
            }}
            transition={{ 
              duration: 4,
              delay: msg.delay,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="absolute top-1/2 left-1/2 bg-card/80 backdrop-blur-sm border border-border rounded-2xl px-4 py-2 shadow-lg"
          >
            <p className="text-sm text-foreground/80 whitespace-nowrap">{msg.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Notification icons floating */}
      <div className="absolute inset-0 pointer-events-none">
        {notificationIcons.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              y: [100, -50, -100, -200],
              x: [item.xOffset, item.xOffset * 2],
            }}
            transition={{ 
              duration: 3,
              delay: item.delay,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="absolute bottom-1/4"
            style={{ left: `${20 + i * 15}%` }}
          >
            <item.Icon className={`w-6 h-6 ${item.color}`} />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-primary font-medium">Kwa wafanyabiashara wa WhatsApp</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance"
        >
          <span className="text-foreground">Biashara yako</span>
          <br />
          <span className="text-primary">haiko salama</span>
          <br />
          <span className="text-muted-foreground">ndani ya chat</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Customers wanakupigia simu, messages zinapotea, orders zinasahaulika. 
          Scroll down uone ukweli wa biashara yako.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex items-center justify-center gap-2 text-muted-foreground"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
          <span className="text-sm">Scroll down</span>
        </motion.div>
      </div>
    </section>
  )
}
