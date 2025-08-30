import { useState, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { Upload, X, Camera } from 'lucide-react'
import { imageApi } from '../services/api'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  const { getToken } = useAuth()

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
      const token = await getToken()
      const { imageUrl } = await imageApi.upload(file, token)
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
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />
      
      {uploadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      {previewUrl ? (
        <Card className="overflow-hidden">
          <div className="relative group">
            <img 
              src={previewUrl} 
              alt="Recipe preview" 
              className="w-full h-40 object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
                </div>
              </div>
            )}
            {!isUploading && (
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <Button
                    type="button"
                    onClick={handleClick}
                    size="sm"
                    variant="secondary"
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Replace
                  </Button>
                  <Button
                    type="button"
                    onClick={removeImage}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card 
          className={`cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-dashed border-2 hover:border-primary/50'
          } ${isUploading ? 'cursor-not-allowed' : ''}`}
          onDragEnter={!isUploading ? handleDragEnter : undefined}
          onDragLeave={!isUploading ? handleDragLeave : undefined}
          onDragOver={!isUploading ? handleDragOver : undefined}
          onDrop={!isUploading ? handleDrop : undefined}
          onClick={!isUploading ? handleClick : undefined}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 px-4">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-medium mb-2">Uploading...</h3>
                <p className="text-muted-foreground text-center">Please wait, processing your image</p>
              </>
            ) : (
              <>
                <div className="mb-4">
                  {isDragging ? (
                    <Upload className="h-12 w-12 text-primary" />
                  ) : (
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {isDragging ? 'Drop to upload image' : 'Upload recipe photo'}
                </h3>
                <p className="text-muted-foreground text-center mb-3">
                  {isDragging 
                    ? 'Release to upload' 
                    : 'Drag and drop images here, or click to select files'
                  }
                </p>
                <div className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WebP formats • Max 5MB
                </div>
                <Button type="button" variant="outline" className="mt-4" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
