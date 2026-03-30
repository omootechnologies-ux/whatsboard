"use client"
<Button asChild variant="ghost">
  <Link href="/login">Log in</Link>
</Button>

<Button asChild>
  <Link href="/register">Get Started</Link>
</Button>
<Button asChild variant="ghost" className="w-full">
  <Link href="/login">Log in</Link>
</Button>

<Button asChild className="w-full">
  <Link href="/register">Get Started</Link>
</Button>
import Link from "next/link";
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "About", href: "#about" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo */}
            <motion.a
              href="/"
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-base">W</span>
              </div>
              <span className="text-lg font-bold text-foreground">WhatsBoard</span>
            </motion.a>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ y: -2 }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Log in
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-20 md:hidden"
          >
            <div className="px-4 py-8 space-y-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-xl font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              
              <div className="pt-6 border-t border-border space-y-4">
                <Button variant="outline" className="w-full justify-center">
                  Log in
                </Button>
                <Button className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
