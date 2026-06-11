import { serve } from 'jsr:@std/http/server'

const LABEL_COLS = 4
const LABEL_ROWS = 5
const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 30
const LABEL_WIDTH = (PAGE_WIDTH - MARGIN * 2) / LABEL_COLS
const LABEL_HEIGHT = (PAGE_HEIGHT - MARGIN * 2) / LABEL_ROWS
const QR_SIZE = Math.min(LABEL_WIDTH, LABEL_HEIGHT) * 0.6

interface LabelRequest {
  slugs: string[]
  baseUrl: string
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function buildPdf(labels: Array<{ slug: string; url: string }>): Uint8Array {
  const objects: string[] = []
  let objectCount = 0

  function addObject(content: string): number {
    objectCount++
    objects.push(`${objectCount} 0 obj\n${content}\nendobj`)
    return objectCount
  }

  const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>')

  const pageCount = Math.ceil(labels.length / (LABEL_COLS * LABEL_ROWS))
  const pageIds: number[] = []

  for (let pageIdx = 0; pageIdx < pageCount; pageIdx++) {
    const pageLabels = labels.slice(
      pageIdx * LABEL_COLS * LABEL_ROWS,
      (pageIdx + 1) * LABEL_COLS * LABEL_ROWS
    )

    let contentStream = 'BT\n/F1 8 Tf\n'

    for (let i = 0; i < pageLabels.length; i++) {
      const col = i % LABEL_COLS
      const row = Math.floor(i / LABEL_COLS)
      const x = MARGIN + col * LABEL_WIDTH
      const y = PAGE_HEIGHT - MARGIN - (row + 1) * LABEL_HEIGHT

      const centerX = x + LABEL_WIDTH / 2
      const qrX = centerX - QR_SIZE / 2
      const qrY = y + (LABEL_HEIGHT - QR_SIZE - 14) / 2

      contentStream += `${qrX} ${qrY + 14} ${QR_SIZE} ${QR_SIZE - 14} re S\n`

      const label = pageLabels[i]
      if (label) {
        const urlText = escapeString(label.url.slice(0, 40))
        const slugText = escapeString(label.slug.slice(0, 30))
        contentStream += `${x + 2} ${y + 4} Td (${slugText}) Tj\n`
        contentStream += `${x + 2} ${y - 4} Td (${urlText}) Tj\n`
        contentStream += `0 0 Td\n`
      }
    }

    contentStream += 'ET\n'

    const streamId = addObject(
      `<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream`
    )

    const pageId = addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${streamId} 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>`
    )
    pageIds.push(pageId)
  }

  const pagesObj = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  objects.splice(1, 0, `2 0 obj\n${pagesObj}\nendobj`)

  let pdfContent = '%PDF-1.4\n'
  const offsets: number[] = []

  for (const obj of objects) {
    offsets.push(pdfContent.length)
    pdfContent += obj + '\n'
  }

  const xrefOffset = pdfContent.length
  pdfContent += 'xref\n'
  pdfContent += `0 ${objects.length + 1}\n`
  pdfContent += '0000000000 65535 f \n'

  for (const offset of offsets) {
    pdfContent += offset.toString().padStart(10, '0') + ' 00000 n \n'
  }

  pdfContent += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
  pdfContent += `startxref\n${xrefOffset}\n%%EOF`

  return new TextEncoder().encode(pdfContent)
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: LabelRequest
  try {
    body = (await req.json()) as LabelRequest
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { slugs, baseUrl } = body

  if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
    return new Response(JSON.stringify({ error: 'slugs array required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!baseUrl || typeof baseUrl !== 'string') {
    return new Response(JSON.stringify({ error: 'baseUrl string required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const labels = slugs.map((slug: string) => ({
    slug,
    url: `${baseUrl}/p/${slug}`,
  }))

  const pdfBytes = buildPdf(labels)

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="etichette-passaporto.pdf"',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
