"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  React.useEffect(() => {
    if (theme) {
      console.log("Theme updated to:", theme)
    }
  }, [theme]) // Runs every time `theme` changes

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
