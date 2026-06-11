import QRCodeLib from "qrcode";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { t } from "@/i18n";

interface QRDownloadProps {
  value: string;
  filename: string;
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
}

export function QRDownload({ value, filename }: QRDownloadProps) {
  const downloadPng = async () => {
    const dataUrl = await QRCodeLib.toDataURL(value, { width: 1024, margin: 1 });
    triggerDownload(dataUrl, `${filename}.png`);
  };

  const downloadSvg = async () => {
    const svg = await QRCodeLib.toString(value, { type: "svg", margin: 1 });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filename}.svg`);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => void downloadPng()}>
        <Download className="h-4 w-4" />
        {t("qr.downloadPng")}
      </Button>
      <Button variant="secondary" onClick={() => void downloadSvg()}>
        <Download className="h-4 w-4" />
        {t("qr.downloadSvg")}
      </Button>
    </div>
  );
}
