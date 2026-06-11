import { useState } from 'react'
import QRCode from 'qrcode'
import type { Product } from '@passaporto/shared'
import { Button } from '@/components/ui/Button'
import t from '@/i18n/it.json'

interface QRDownloadProps {
  product: Product
}

const PUBLIC_APP_URL = import.meta.env.VITE_PUBLIC_APP_URL ?? window.location.origin

export function QRDownload({ product }: QRDownloadProps) {
  const [loading, setLoading] = useState<'png' | 'svg' | null>(null)

  const url = product.gtin
    ? `${PUBLIC_APP_URL}/01/${product.gtin}`
    : `${PUBLIC_APP_URL}/p/${product.slug}`

  const downloadPNG = async () => {
    setLoading('png')
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `qr-${product.slug}.png`
      a.click()
    } finally {
      setLoading(null)
    }
  }

  const downloadSVG = async () => {
    setLoading('svg')
    try {
      const svgString = await QRCode.toString(url, { type: 'svg', margin: 2 })
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `qr-${product.slug}.svg`
      a.click()
      URL.revokeObjectURL(blobUrl)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" loading={loading === 'png'} onClick={downloadPNG}>
        {t.btn_download} PNG
      </Button>
      <Button variant="secondary" size="sm" loading={loading === 'svg'} onClick={downloadSVG}>
        {t.btn_download} SVG
      </Button>
    </div>
  )
}
