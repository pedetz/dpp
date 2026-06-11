import { QRCodeSVG } from 'qrcode.react'
import type { Product } from '@passaporto/shared'

interface QRCodeDisplayProps {
  product: Product
}

const PUBLIC_APP_URL = import.meta.env.VITE_PUBLIC_APP_URL ?? window.location.origin

export function QRCodeDisplay({ product }: QRCodeDisplayProps) {
  const url = product.gtin
    ? `${PUBLIC_APP_URL}/01/${product.gtin}`
    : `${PUBLIC_APP_URL}/p/${product.slug}`

  return (
    <div className="flex flex-col items-center gap-3">
      <QRCodeSVG value={url} size={200} level="M" includeMargin />
      <p className="text-xs text-gray-500 break-all max-w-xs text-center">{url}</p>
    </div>
  )
}
