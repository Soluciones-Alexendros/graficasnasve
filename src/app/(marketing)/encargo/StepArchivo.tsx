/**
 * graficasnasve.art — Paso 2: subida de archivo y preflight del encargo asistido.
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 */

'use client'

import { useState } from 'react'
import { Check, Loader2, Upload } from 'lucide-react'
import { Baldosa } from '@/components/ui/Baldosa'
import { IconoEstado } from './EncargoComun'
import type { ChequeoPreflight } from '@/lib/preflight/archivo'

interface PropsStepArchivo {
  archivoNombre: string
  sinArte: boolean
  onArchivo: (nombre: string) => void
  onSinArte: (sinArte: boolean) => void
}

export function StepArchivo({ archivoNombre, sinArte, onArchivo, onSinArte }: PropsStepArchivo) {
  const [chequeos, setChequeos] = useState<ChequeoPreflight[]>([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function onSeleccionar(file: File | undefined) {
    setError('')
    setChequeos([])
    if (!file) {
      onArchivo('')
      return
    }

    setCargando(true)
    onSinArte(false)
    try {
      const formData = new FormData()
      formData.append('archivo', file)
      const res = await fetch('/api/preflight', { method: 'POST', body: formData })
      const json = (await res.json()) as {
        ok?: boolean
        error?: string
        chequeos?: ChequeoPreflight[]
      }
      setChequeos(json.chequeos ?? [])
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'El archivo no pasó el preflight')
        onArchivo('')
        return
      }
      onArchivo(file.name)
    } catch {
      setError('No se pudo validar el archivo. Inténtalo de nuevo.')
      onArchivo('')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display font-bold text-2xl text-key">Sube tu archivo de impresión</h2>
      <p className="font-sans text-sm text-gris -mt-2">
        Lo revisamos al instante (tipo real, tamaño y resolución en imágenes). Si no tienes arte listo, también lo
        preparamos nosotros.
      </p>

      <label className="flex items-center gap-4 rounded-card border border-dashed border-taupe bg-paper-50 px-5 py-6 cursor-pointer hover:border-key transition-colors">
        <Baldosa color="coral" cuadrada={false} className="w-12 h-12 shrink-0">
          {cargando ? <Loader2 size={22} className="animate-spin" /> : <Upload size={22} />}
        </Baldosa>
        <div className="min-w-0">
          <span className="block font-sans text-sm font-medium text-key truncate">
            {archivoNombre || 'Selecciona tu archivo (PDF, AI, EPS, ZIP, JPG, PNG)'}
          </span>
          <span className="block font-mono text-xs text-gris">Máximo 50 MB · JPEG/PNG: lado corto ≥ 1200 px</span>
        </div>
        <input
          type="file"
          accept=".pdf,.ai,.eps,.zip,.jpg,.jpeg,.png"
          className="sr-only"
          disabled={cargando}
          onChange={(e) => {
            void onSeleccionar(e.target.files?.[0])
          }}
        />
      </label>

      <button
        type="button"
        onClick={() => {
          onSinArte(!sinArte)
          onArchivo('')
          setChequeos([])
          setError('')
        }}
        className={[
          'flex items-center justify-between gap-2 rounded-card border px-4 py-3 font-sans text-sm font-medium text-left transition-colors',
          sinArte ? 'border-ambar bg-ambar/10' : 'border-taupe hover:border-key',
        ].join(' ')}
      >
        <span>
          <span className="font-mono text-xs uppercase tracking-widest text-gris mr-2">¿Sin arte final?</span>
          Que lo diseñe Nasve
        </span>
        {sinArte && <Check size={16} className="text-ambar-700" />}
      </button>

      {error && (
        <p role="alert" className="font-sans text-sm text-rojo">
          {error}
        </p>
      )}

      {chequeos.length > 0 && (
        <div className="rounded-card border border-key/10 overflow-hidden">
          <div className={['flex items-center gap-2 px-4 py-3', error ? 'bg-ambar/15' : 'bg-cyan/15'].join(' ')}>
            {error ? (
              <span className="font-sans text-sm font-semibold text-key">Preflight: hay que corregir el archivo</span>
            ) : (
              <>
                <Check size={16} className="text-cyan" />
                <span className="font-sans text-sm font-semibold text-key">Preflight OK</span>
              </>
            )}
          </div>
          <ul className="divide-y divide-key/5">
            {chequeos.map((f) => (
              <li key={f.id} className="flex items-start gap-3 px-4 py-3">
                <IconoEstado estado={f.estado === 'error' ? 'aviso' : f.estado === 'info' ? 'info' : 'ok'} />
                <div>
                  <p className="font-sans text-sm font-semibold text-key">{f.titulo}</p>
                  <p className="font-sans text-xs text-gris">{f.detalle}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
