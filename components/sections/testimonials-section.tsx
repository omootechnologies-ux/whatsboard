"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Amina Juma",
    role: "Fashion Boutique Owner",
    location: "Dar es Salaam, Tanzania",
    image: "AJ",
    quote: "Nilikuwa napoteza orders kila siku. Sasa ninajua exactly kila order iko stage gani. WhatsBoard imenisaidia ku-double biashara yangu.",
    rating: 5,
  },
  {
    name: "Grace Wanjiku",
    role: "Beauty Products Seller",
    location: "Nairobi, Kenya",
    image: "GW",
    quote: "Payment tracking imekuwa game changer. Sasa najua nani amelipa, nani hajalipa - bila kuangalia messages 100.",
    rating: 5,
  },
  {
    name: "Blessing Okonkwo",
    role: "Electronics Dealer",
    location: "Lagos, Nigeria",
    image: "BO",
    quote: "WhatsBoard imenipa peace of mind. Customers wangu wanapata service bora, na mimi napumzika usiku.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Wafanyabiashara kama wewe<br />
            <span className="text-primary">wanasema hivi</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of African entrepreneurs already using WhatsBoard.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-6 relative"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground leading-relaxed mb-6">&ldquo;{testimonial.quote}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-semibold">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-primary">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
