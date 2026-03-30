"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Check, Sparkles } from "lucide-react"

export function TransformationSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const lightness = useTransform(scrollYProgress, [0, 0.5], [0, 1])

  return (
    <section ref={containerRef} className="relative min-h-[150vh] py-20">
      {/* Background transition from dark to lighter */}
      <motion.div
        style={{
          background: useTransform(
            lightness,
            [0, 1],
            ["rgb(13, 17, 23)", "rgb(22, 27, 34)"]
          )
        }}
        className="absolute inset-0"
      />

      <div className="sticky top-0 min-h-screen flex items-center justify-center">
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">The Transformation</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Sasa ona <span className="text-primary">WhatsBoard</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dashboard moja. Control kamili. Biashara organized.
            </p>
          </motion.div>

          {/* Before/After comparison */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            
            {/* Before - Chaos (faded) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 bg-destructive/20 text-destructive text-sm font-medium px-3 py-1 rounded-full">
                KABLA
              </div>
              <div className="bg-card/50 border border-border rounded-2xl p-6 opacity-60 blur-[1px]">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm">Messages scattered everywhere</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm">Payment confusion</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm">Lost orders</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm">Stress & overwhelm</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* After - Calm seller */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full z-10">
                BAADA
              </div>
              <div className="bg-card border border-primary/30 rounded-2xl p-6 shadow-lg shadow-primary/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl">
                      <span role="img" aria-label="happy seller">😌</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Amina - Online Seller</h3>
                    <p className="text-primary text-sm font-medium">In control. Organized. Growing.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">All orders in one place</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Clear payment tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Delivery status visible</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Peace of mind</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
