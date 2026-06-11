import { useEffect, useRef } from "react";
import QRCodeStyling from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 220 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    void QRCodeStyling.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
    });
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
}
