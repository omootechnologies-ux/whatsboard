"use client"

import { motion } from "framer-motion"
import { 
  MessageSquare, CreditCard, Truck, BarChart3, 
  Bell, Users, Shield, Zap 
} from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "WhatsApp Integration",
    description: "Connect your WhatsApp business. Orders auto-capture from chats.",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20"
  },
  {
    icon: CreditCard,
    title: "Payment Tracking",
    description: "M-Pesa, Tigo Pesa, bank transfers - all in one view.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  {
    icon: Truck,
    title: "Delivery Management",
    description: "Track every order from packing to delivered.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20"
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description: "Know your numbers. Best products, peak hours, trends.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Never miss a payment or an overdue order again.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20"
  },
  {
    icon: Users,
    title: "Customer Database",
    description: "Build relationships. Remember every customer.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20"
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your business data protected. Always available.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  {
    icon: Zap,
    title: "Fast Setup",
    description: "Start in minutes. No technical skills needed.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20"
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Kila kitu unachohitaji,<br />
            <span className="text-primary">mahali pamoja</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            WhatsBoard inakupa tools zote za kuendesha biashara yako kwa urahisi.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`${feature.bg} border ${feature.border} rounded-2xl p-6 transition-all duration-300`}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
