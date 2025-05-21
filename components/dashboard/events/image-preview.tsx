"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ImagePreviewProps {
  url: string
}

export function ImagePreview({ url }: ImagePreviewProps) {
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!url) {
      setIsValid(false)
      setIsLoading(false)
      return
    }

    const img = new Image()
    img.onload = () => {
      setIsValid(true)
      setIsLoading(false)
    }
    img.onerror = () => {
      setIsValid(false)
      setIsLoading(false)
    }
    img.src = url
  }, [url])

  if (!url || isLoading) {
    return (
      <div className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center">
        {isLoading ? "Loading..." : "No image provided"}
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center text-red-500">
        Invalid image URL
      </div>
    )
  }

  return (
    <div className="relative w-full h-40 rounded-md overflow-hidden">
      <img src={url || "/placeholder.svg"} alt="Event cover" className="object-cover w-full h-full" />
    </div>
  )
}
