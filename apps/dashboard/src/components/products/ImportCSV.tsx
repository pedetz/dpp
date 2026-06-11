import { useState, useRef } from 'react'
import { Upload, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useProducts } from '@/hooks/useProducts'
import { slugify } from '@/lib/utils'
import t from '@/i18n/it.json'

type Step = 'upload' | 'mapping' | 'preview' | 'import'

interface ImportCSVProps {
  onDone?: () => void
}

const SYSTEM_COLUMNS = [
  { value: '', label: 'Non importare' },
  { value: 'name', label: t.product_name },
  { value: 'sku', label: t.product_sku },
  { value: 'gtin', label: t.product_gtin },
]

function parseCsv(text: string): string[][] {
  return text.trim().split('\n').map((line) =>
    line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''))
  )
}

export function ImportCSV({ onDone }: ImportCSVProps) {
  const [step, setStep] = useState<Step>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<Array<{ row: number; message: string }>>([])
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { create } = useProducts()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseCsv(text)
      if (parsed.length < 2) return
      setHeaders(parsed[0])
      setRows(parsed.slice(1))
      setMapping(Object.fromEntries(parsed[0].map((h) => [h, ''])))
      setStep('mapping')
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setStep('import')
    const errs: Array<{ row: number; message: string }> = []
    const nameKey = Object.entries(mapping).find(([, v]) => v === 'name')?.[0]
    const skuKey = Object.entries(mapping).find(([, v]) => v === 'sku')?.[0]
    const gtinKey = Object.entries(mapping).find(([, v]) => v === 'gtin')?.[0]

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const getValue = (key: string | undefined) =>
        key ? row[headers.indexOf(key)] ?? '' : ''

      const name = getValue(nameKey)
      if (!name) {
        errs.push({ row: i + 2, message: 'Nome mancante' })
        setProgress(Math.round(((i + 1) / rows.length) * 100))
        continue
      }

      try {
        await create.mutateAsync({
          name,
          sku: getValue(skuKey) || undefined,
          gtin: getValue(gtinKey) || undefined,
          category: 'tessile',
        })
      } catch {
        errs.push({ row: i + 2, message: `Errore importazione riga ${i + 2}` })
      }

      setProgress(Math.round(((i + 1) / rows.length) * 100))
    }

    setErrors(errs)
    setDone(true)
  }

  if (step === 'upload') {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">{t.csv_upload}</h3>
        <label className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-12 cursor-pointer hover:border-green-400 transition-colors">
          <Upload className="h-8 w-8 text-gray-400" />
          <span className="text-sm text-gray-600">Trascina o clicca per caricare un file CSV</span>
          <input ref={fileRef} type="file" accept=".csv" className="sr-only" onChange={handleFile} />
        </label>
      </div>
    )
  }

  if (step === 'mapping') {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">{t.csv_mapping}</h3>
        <div className="space-y-3">
          {headers.map((header) => (
            <div key={header} className="flex items-center gap-4">
              <span className="w-40 text-sm text-gray-600 font-mono">{header}</span>
              <Select
                options={SYSTEM_COLUMNS}
                value={mapping[header] ?? ''}
                onChange={(e) => setMapping((prev) => ({ ...prev, [header]: e.target.value }))}
                className="flex-1"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setStep('upload')}>Indietro</Button>
          <Button onClick={() => setStep('preview')}>Avanti</Button>
        </div>
      </div>
    )
  }

  if (step === 'preview') {
    const preview = rows.slice(0, 5)
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">{t.csv_preview}</h3>
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-gray-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">{rows.length} righe totali</p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setStep('mapping')}>Indietro</Button>
          <Button onClick={handleImport}>{t.csv_import}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">{t.csv_import}</h3>
      {!done ? (
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-3 rounded-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">{progress}% completato</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Importazione completata</span>
          </div>
          {errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-700">{t.csv_errors}</p>
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600">Riga {err.row}: {err.message}</p>
              ))}
            </div>
          )}
          <Button onClick={onDone}>Chiudi</Button>
        </div>
      )}
    </div>
  )
}
