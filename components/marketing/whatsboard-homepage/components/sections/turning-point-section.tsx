"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function TurningPointSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.9])
  const y = useTransform(scrollYProgress, [0, 0.3], [100, 0])

  return (
    <section ref={containerRef} className="relative min-h-[150vh]">
      <div className="sticky top-0 min-h-screen flex items-center justify-center bg-background">
        {/* Dramatic background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          
          {/* Animated lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <motion.line
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
            <motion.line
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </svg>
        </div>

        <motion.div
          style={{ opacity, scale, y }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Pre-message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-muted-foreground mb-8"
          >
            Lakini subiri...
          </motion.p>

          {/* Main dramatic message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                viewport={{ once: true }}
                className="block text-foreground"
              >
                Tatizo si WhatsApp.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                viewport={{ once: true }}
                className="block text-primary mt-4"
              >
                Tatizo ni kuendesha biashara
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                viewport={{ once: true }}
                className="block text-muted-foreground mt-2"
              >
                ndani ya chat.
              </motion.span>
            </h2>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="w-32 h-1 bg-primary mx-auto mb-12 rounded-full"
          />

          {/* Sub message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            viewport={{ once: true }}
          >
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Unahitaji <span className="text-primary font-semibold">system</span>, 
              si chat ndefu zaidi.
            </p>
            <p className="text-lg text-muted-foreground/70">
              WhatsBoard inakupa control ambayo hukuwahi kuwa nayo.
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="text-sm">Ona mabadiliko</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
