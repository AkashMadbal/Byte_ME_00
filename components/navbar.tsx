"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-gradient-to-r from-gray-900/90 via-indigo-950/80 to-purple-900/70 backdrop-blur-md shadow-lg border-b border-indigo-500/30" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <span className="text-2xl md:text-3xl font-bold bg-clip-text  text-blue whitespace-nowrap drop-shadow-sm">
                  Atlas AI
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex   items-center space-x-8">
            <NavLink   href="#features">Features</NavLink>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="rounded-full px-6 border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/api/auth/signup">
                <Button className="rounded-full px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-indigo-500/20">Sign Up</Button>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-indigo-500/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-gradient-to-br from-gray-900/95 via-indigo-950/90 to-purple-900/85 backdrop-blur-md border border-indigo-500/30 rounded-lg shadow-lg"
        >
          <div className="px-4  pt-2 pb-6 space-y-4">
            <MobileNavLink href="#features" onClick={() => setIsMobileMenuOpen(false)}>
             <div className="text-white">Features </div>
            </MobileNavLink>

            <div className="pt-4 flex flex-col space-y-3">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full rounded-full border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/api/auth/signup" className="w-full">
                <Button className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-indigo-500/20">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-white hover:text-indigo-300 transition-colors font-medium">
      <motion.span whileHover={{ y: -2 }} whileTap={{ y: 0 }} className="inline-block">
        {children}
      </motion.span>
    </Link>
  )
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-3 text-white hover:text-indigo-300 transition-colors font-medium border-b border-indigo-500/20"
    >
      {children}
    </Link>
  )
}