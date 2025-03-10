"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Box = {
  id: number
  x: number
  y: number
  size: number
  color: string
  opacity: number
  isClicked: boolean
  clickProgress: number
}

type Star = {
  id: number
  x: number
  y: number
  angle: number
  distance: number
  size: number
  opacity: number
  speed: number
}

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [stars, setStars] = useState<Star[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const requestRef = useRef<number | null>(null)
  const lastBoxAddedTimeRef = useRef(0)
  const lastClickTimeRef = useRef(0)
  const nextBoxIdRef = useRef(0)
  const nextStarIdRef = useRef(0)

  // Color palette - muted/dimmed colors matching the Nexi blue theme
  const colors = [
    "bg-blue-500/30",
    "bg-blue-600/30",
    "bg-blue-700/30",
    "bg-indigo-500/20",
    "bg-indigo-600/20",
    "bg-indigo-700/20",
    "bg-slate-500/20",
  ]

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Animation loop
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const animate = (time: number) => {
      // Add new boxes occasionally
      if (time - lastBoxAddedTimeRef.current > 800 && boxes.length < 30) {
        lastBoxAddedTimeRef.current = time
        setBoxes((prevBoxes) => [
          ...prevBoxes,
          {
            id: nextBoxIdRef.current++,
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            size: 20 + Math.random() * 60,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 0,
            isClicked: false,
            clickProgress: 0,
          },
        ])
      }

      // Simulate a random click
      if (time - lastClickTimeRef.current > 3000 && boxes.length > 5) {
        lastClickTimeRef.current = time
        const nonClickedBoxes = boxes.filter((box) => !box.isClicked)
        if (nonClickedBoxes.length > 0) {
          const randomIndex = Math.floor(Math.random() * nonClickedBoxes.length)
          const boxToClick = nonClickedBoxes[randomIndex]

          setBoxes((prevBoxes) =>
            prevBoxes.map((box) => (box.id === boxToClick.id ? { ...box, isClicked: true } : box)),
          )

          // Create stars for the clicked box
          const newStars = Array.from({ length: 8 }, (_, i) => ({
            id: nextStarIdRef.current++,
            x: boxToClick.x + boxToClick.size / 2,
            y: boxToClick.y + boxToClick.size / 2,
            angle: (Math.PI * 2 * i) / 8,
            distance: 0,
            size: 3 + Math.random() * 4,
            opacity: 1,
            speed: 1 + Math.random() * 2,
          }))

          setStars((prevStars) => [...prevStars, ...newStars])
        }
      }

      // Update boxes
      setBoxes(
        (prevBoxes) =>
          prevBoxes
            .map((box) => {
              // Fade in new boxes
              let newOpacity = box.opacity
              if (box.opacity < 1) {
                newOpacity = Math.min(1, box.opacity + 0.02)
              }

              // Handle clicked boxes
              let newSize = box.size
              let newClickProgress = box.clickProgress

              if (box.isClicked) {
                newClickProgress = Math.min(1, box.clickProgress + 0.04)
                newSize = box.size * (1 + newClickProgress * 0.5)

                if (newClickProgress >= 1) {
                  return null // Remove fully expanded boxes
                }
              }

              return {
                ...box,
                opacity: newOpacity,
                size: newSize,
                clickProgress: newClickProgress,
              }
            })
            .filter(Boolean) as Box[],
      )

      // Update stars
      setStars((prevStars) =>
        prevStars
          .map((star) => {
            const newDistance = star.distance + star.speed
            const newOpacity = Math.max(0, star.opacity - 0.02)

            return {
              ...star,
              distance: newDistance,
              x: star.x + Math.cos(star.angle) * star.speed,
              y: star.y + Math.sin(star.angle) * star.speed,
              opacity: newOpacity,
            }
          })
          .filter((star) => star.opacity > 0),
      )

      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [boxes, stars, dimensions])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {boxes.map((box) => (
        <div
          key={box.id}
          className={cn("absolute rounded-lg transition-opacity", box.color)}
          style={{
            left: box.x,
            top: box.y,
            width: box.size,
            height: box.size,
            opacity: box.opacity,
            transform: box.isClicked ? `scale(${1 + box.clickProgress * 0.5})` : "scale(1)",
            transition: box.isClicked ? "transform 0.5s ease-out" : "none",
          }}
        />
      ))}

      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-yellow-200"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            boxShadow: "0 0 5px 2px rgba(255, 255, 200, 0.7)",
          }}
        />
      ))}
    </div>
  )
}

