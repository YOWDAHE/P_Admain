'use client';

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { EventType } from "@/app/models/Event";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useRef } from "react";
import { QRCodeData } from "@/app/models/qr-code";
import { useAuth } from "@/hooks/use-auth";

interface EventQRModalProps {
  event: EventType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventQRModal({ event, isOpen, onClose }: EventQRModalProps) {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  if (!event || !user) return null;

  const qrCodeData: QRCodeData = {
    eventId: event.id,
    eventName: event.title,
    organizerName: user.profile.name || user.email,
    organizerProfile: user.profile.logo_url,
  };

  const downloadQRCode = () => {
    const svg = qrContainerRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${event.title}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const shareQRCode = async () => {
    const svg = qrContainerRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          
          if (navigator.share) {
            await navigator.share({
              title: `${event.title} - QR Code`,
              files: [new File([blob], 'qr-code.png', { type: 'image/png' })]
            });
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${event.title}-qr-code.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl overflow-scroll">
        <DialogTitle className="text-xl font-semibold text-center">Share with staff</DialogTitle>
        <div className="flex flex-col items-center justify-center space-y-8 py-0">
          <div ref={qrContainerRef} className="bg-white p-1 rounded-lg">
            <QRCode
              value={JSON.stringify(qrCodeData)}
              size={512}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 512 512`}
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={downloadQRCode} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={shareQRCode} variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 