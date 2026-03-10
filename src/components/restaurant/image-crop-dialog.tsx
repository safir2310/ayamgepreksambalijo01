'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ZoomIn, ZoomOut, RotateCw, Crop as CropIcon } from 'lucide-react';

interface ImageCropDialogProps {
  open: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedImageFile: File) => void;
}

// Helper function to center the crop with 1:1 (square) aspect ratio for menu grid view
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageCropDialog({ open, onClose, imageFile, onCropComplete }: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imageSrc, setImageSrc] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [processing, setProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);

  // Load image when file changes
  React.useEffect(() => {
    if (!imageFile) {
      setImageSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
      setScale(1);
      setRotate(0);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Initialize crop when image loads
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Set initial crop to center and square aspect (1:1) for menu grid view
    const initialCrop = centerAspectCrop(width, height, 1);
    setCrop(initialCrop);
  };

  // Handle crop completion
  const handleCropComplete = useCallback((_: Crop, pixelCrop: PixelCrop) => {
    setCompletedCrop(pixelCrop);
  }, []);

  // Crop and get the image blob
  const handleConfirmCrop = async () => {
    if (!completedCrop || !imgRef.current) return;

    setProcessing(true);

    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No canvas context');
      }

      // Calculate the actual crop dimensions considering scale and rotation
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      // Apply rotation
      if (rotate !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Apply scale
      if (scale !== 1) {
        ctx.scale(scale, scale);
      }

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          
          // Create a new File object from the blob
          const croppedFile = new File([blob], imageFile?.name || 'cropped-image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          onCropComplete(croppedFile);
          onClose();
        },
        'image/jpeg',
        0.95
      );
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="w-5 h-5" />
            Crop Gambar
          </DialogTitle>
        </DialogHeader>
        
        {imageSrc && (
          <div className="space-y-4">
            {/* Image with Crop */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={handleCropComplete}
                aspect={1}
                minWidth={50}
                minHeight={50}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imageSrc}
                  style={{ 
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxHeight: '500px',
                    maxWidth: '100%',
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-16 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={scale >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Instructions */}
            <p className="text-xs text-gray-500 text-center">
              Geser area crop untuk menyesuaikan tampilan gambar menu (square). Gunakan zoom dan rotate untuk mengatur gambar.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processing}>
            Batal
          </Button>
          <Button 
            onClick={handleConfirmCrop} 
            disabled={processing || !completedCrop}
            className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              'Gunakan Gambar Ini'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
