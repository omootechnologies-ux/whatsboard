"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { 
  ShoppingBag, Clock, CreditCard, CheckCircle, Package, Truck, 
  ArrowRight, User, Calendar, DollarSign, MoreHorizontal
} from "lucide-react"

const orderStages = [
  { id: "new", label: "New Order", icon: ShoppingBag, color: "bg-blue-500", count: 12 },
  { id: "pending", label: "Payment Pending", icon: Clock, color: "bg-yellow-500", count: 5 },
  { id: "paid", label: "Paid", icon: CreditCard, color: "bg-green-500", count: 8 },
  { id: "packing", label: "Packing", icon: Package, color: "bg-orange-500", count: 6 },
  { id: "dispatch", label: "Dispatch", icon: Truck, color: "bg-purple-500", count: 4 },
  { id: "delivered", label: "Delivered", icon: CheckCircle, color: "bg-emerald-500", count: 23 },
]

const sampleOrders = [
  { id: "ORD-001", customer: "Fatima Hassan", amount: "TZS 125,000", items: "3 items", time: "2 min ago", stage: "new" },
  { id: "ORD-002", customer: "Joseph Mwangi", amount: "TZS 85,000", items: "2 items", time: "15 min ago", stage: "new" },
  { id: "ORD-003", customer: "Grace Okonkwo", amount: "TZS 250,000", items: "5 items", time: "1 hour ago", stage: "paid" },
  { id: "ORD-004", customer: "Abdul Rashid", amount: "TZS 45,000", items: "1 item", time: "3 hours ago", stage: "packing" },
]

export function DashboardSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStage, setActiveStage] = useState("new")
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])

  return (
    <section ref={containerRef} className="relative min-h-[200vh] py-20">
      <div className="sticky top-0 min-h-screen flex items-center py-10">
        <motion.div
          style={{ opacity }}
          className="max-w-7xl mx-auto px-4 w-full"
        >
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Order Pipeline <span className="text-primary">yenye nguvu</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kila order ina stage yake. Hakuna kitu kinachopotea.
            </p>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Dashboard header */}
            <div className="bg-secondary/50 border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">W</span>
                  </div>
                  <span className="font-bold text-foreground">WhatsBoard</span>
                </div>
                <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:block text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Today: <span className="text-foreground font-medium">March 30, 2026</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-sm">
                  A
                </div>
              </div>
            </div>

            {/* Stage tabs */}
            <div className="border-b border-border overflow-x-auto">
              <div className="flex min-w-max">
                {orderStages.map((stage, i) => (
                  <motion.button
                    key={stage.id}
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => setActiveStage(stage.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      activeStage === stage.id
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <stage.icon className="w-4 h-4" />
                    <span className="text-sm font-medium whitespace-nowrap">{stage.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeStage === stage.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {stage.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Order list */}
            <div className="p-6">
              <div className="space-y-3">
                {sampleOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-secondary/30 border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">{order.id} • {order.items}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="font-semibold text-foreground">{order.amount}</p>
                          <p className="text-xs text-muted-foreground">{order.time}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Process <ArrowRight className="w-3 h-3" />
                        </motion.button>
                        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stats bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Today&apos;s Orders</p>
                  <p className="text-2xl font-bold text-primary">58</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-emerald-500">TZS 2.4M</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-blue-500">94%</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Avg. Process Time</p>
                  <p className="text-2xl font-bold text-yellow-500">2.3h</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
