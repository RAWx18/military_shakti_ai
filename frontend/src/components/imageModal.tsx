import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaSrc: string;
  mediaType: 'image' | 'video' | 'pdf';
}

export function MediaModal({ isOpen, onClose, mediaSrc, mediaType }: MediaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] p-4 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Full Size Media</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-full">
          {mediaType === 'image' ? (
            mediaSrc.startsWith('data:') ? (
              <img
                src={mediaSrc}
                alt="Full size image"
                className="w-full h-full object-contain"
              />
            ) : (
              <Image
                src={mediaSrc}
                alt="Full size image"
                layout="responsive"
                width={1920}
                height={1080}
                objectFit="contain"
              />
            )
          ) : mediaType === 'video' ? (
            <video
              src={mediaSrc}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <embed
              src={mediaSrc}
              type="application/pdf"
              className="w-full h-full object-contain"
              title="Full size PDF"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}