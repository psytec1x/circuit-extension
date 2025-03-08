"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface KnobProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: number
  color?: string
  className?: string
}

export function Knob({ value, onChange, min = 0, max = 1, size = 60, color = "#a855f7", className = "" }: KnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const knobRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const startValueRef = useRef<number>(0)

  // Convert value to angle (0 to 270 degrees)
  const normalizedValue = (value - min) / (max - min)
  const angle = normalizedValue * 270 - 135

  // Handle mouse/touch events
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return

      // Get Y position from mouse or touch event
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

      // Calculate value change based on vertical movement
      // Moving up increases value, moving down decreases
      const deltaY = startYRef.current - clientY
      const sensitivity = 200 // Adjust for sensitivity

      const deltaValue = (deltaY / sensitivity) * (max - min)
      let newValue = startValueRef.current + deltaValue

      // Clamp value to min/max
      newValue = Math.max(min, Math.min(max, newValue))

      onChange(newValue)
    }

    const handleUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMove)
      document.addEventListener("touchmove", handleMove)
      document.addEventListener("mouseup", handleUp)
      document.addEventListener("touchend", handleUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("touchmove", handleMove)
      document.removeEventListener("mouseup", handleUp)
      document.removeEventListener("touchend", handleUp)
    }
  }, [isDragging, min, max, onChange])

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)

    // Store starting position and value
    startYRef.current = "touches" in e ? e.touches[0].clientY : e.clientY
    startValueRef.current = value
  }

  // Calculate dimensions
  const centerX = size / 2
  const centerY = size / 2
  const radius = (size / 2) * 0.8

  return (
    <div
      ref={knobRef}
      className={`relative select-none ${className}`}
      style={{ width: size, height: size }}
      onMouseDown={handleDown}
      onTouchStart={handleDown}
    >
      {/* Knob background */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle cx={centerX} cy={centerY} r={radius} fill="transparent" stroke="#3f3f46" strokeWidth={size * 0.1} />

        {/* Value track */}
        <path
          d={`
            M ${centerX} ${centerY}
            m 0 ${-radius}
            a ${radius} ${radius} 0 1 1 -0.01 0
          `}
          fill="transparent"
          stroke={color}
          strokeWidth={size * 0.1}
          strokeDasharray={`${normalizedValue * 2 * Math.PI * radius} ${2 * Math.PI * radius}`}
          strokeLinecap="round"
        />

        {/* Indicator line */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.sin((angle * Math.PI) / 180) * radius * 0.7}
          y2={centerY - Math.cos((angle * Math.PI) / 180) * radius * 0.7}
          stroke="white"
          strokeWidth={size * 0.05}
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx={centerX} cy={centerY} r={size * 0.1} fill="#27272a" stroke={color} strokeWidth={size * 0.02} />
      </svg>

      {/* Value display */}
      <div
        className="absolute inset-0 flex items-center justify-center text-xs font-mono text-purple-200"
        style={{ fontSize: size * 0.2 }}
      >
        {Math.round(normalizedValue * 100)}
      </div>
    </div>
  )
}

