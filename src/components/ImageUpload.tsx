import { useState, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { imageApi } from '../services/api'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  currentImageUrl?: string
  className?: string
}

export default function ImageUpload({ onImageUploaded, currentImageUrl, className = '' }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = async (file: File) => {
    // Clear any previous errors
    setUploadError(null)
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB')
      return
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setPreviewUrl(previewUrl)
    
    // Upload the image
    setIsUploading(true)
    try {
      const { imageUrl } = await imageApi.upload(file)
      onImageUploaded(imageUrl)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
      // Remove preview on error
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`image-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />
      
      {uploadError && (
        <div className="upload-error mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">{uploadError}</p>
        </div>
      )}
      
      {previewUrl ? (
        <div className="image-preview">
          <div className="relative group">
            <img 
              src={previewUrl} 
              alt="Recipe preview" 
              className="w-full h-32 object-cover rounded-xl"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Uploading...</p>
                </div>
              </div>
            )}
            {!isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-xl flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-3">
                  <Button
                    type="button"
                    onClick={handleClick}
                    size="sm"
                    variant="secondary"
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    onClick={removeImage}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
          onDragEnter={!isUploading ? handleDragEnter : undefined}
          onDragLeave={!isUploading ? handleDragLeave : undefined}
          onDragOver={!isUploading ? handleDragOver : undefined}
          onDrop={!isUploading ? handleDrop : undefined}
          onClick={!isUploading ? handleClick : undefined}
        >
          <div className="upload-content">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="upload-title">Uploading your image...</h3>
                <p className="upload-description">Please wait while we process your photo</p>
              </>
            ) : (
              <>
                <div className="upload-icon">
                  📸
                </div>
                <h3 className="upload-title">
                  {isDragging ? 'Drop your image here' : 'Upload recipe photo'}
                </h3>
                <p className="upload-description">
                  {isDragging 
                    ? 'Release to upload' 
                    : 'Drag & drop an image, or click to browse'
                  }
                </p>
                <div className="upload-specs">
                  JPG, PNG, WebP • Max 5MB
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}