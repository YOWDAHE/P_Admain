'use client';

import QRCode from "react-qr-code";
import { EventType } from "@/app/models/Event";
import { Button } from "@/components/ui/button";

interface EventQRPreviewProps {
  event: EventType;
  onClick: () => void;
}

export function EventQRPreview({ event, onClick }: EventQRPreviewProps) {
  return (
    <Button
      variant="ghost"
      className="p-0 h-auto hover:bg-transparent"
      onClick={onClick}
    >
      <div className="w-8 h-8">
        <QRCode
          value={JSON.stringify(event)}
          size={32}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox={`0 0 32 32`}
        />
      </div>
    </Button>
  );
} 