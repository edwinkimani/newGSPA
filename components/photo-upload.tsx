"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Camera, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhotoUploadProps {
  onPhotoChange: (file: File | null) => void
  value?: File | string | null
  label?: string
  required?: boolean
  error?: string
}

export function PhotoUpload({ onPhotoChange, value, label = "Passport Photo", required, error }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onPhotoChange(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removePhoto = () => {
    setPreview(null)
    onPhotoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Trigger file input click when the upload area is clicked
  const handleUploadAreaClick = () => {
    if (!preview && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div
        className={cn(
          "photo-upload-area p-6 text-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors",
          dragOver && "border-blue-500 bg-blue-50",
          !preview && "hover:border-gray-400"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={handleUploadAreaClick}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="w-24 h-32 sm:w-32 sm:h-40 object-cover rounded-lg border-2 border-gray-200"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation()
                removePhoto()
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Upload your passport photo</p>
              <p className="text-xs text-gray-500">Drag and drop or click to browse</p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="mx-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}

        <input
          id="photo-upload-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Photo Requirements:</p>
            <ul className="space-y-1 text-blue-600">
              <li>• Recent passport-style photo</li>
              <li>• Clear, well-lit, facing forward</li>
              <li>• Plain background preferred</li>
              <li>• File size: Max 5MB</li>
            </ul>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
