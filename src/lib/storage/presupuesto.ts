/**
 * graficasnasve.art — Subida de archivos de presupuesto a Supabase Storage.
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 */

import { randomUUID } from 'crypto'
import path from 'path'
import { createAdminClient } from '@/lib/supabase/admin'
import { MAX_ARCHIVO_BYTES, validarPreflightArchivo } from '@/lib/preflight/archivo'

export { MAX_ARCHIVO_BYTES }

export const ALLOWED_EXTENSIONS = ['pdf', 'ai', 'eps', 'zip', 'jpg', 'jpeg', 'png']

/**
 * Sanea el nombre de archivo original:
 * - elimina cualquier componente de ruta,
 * - conserva solo caracteres seguros,
 * - normaliza a minúsculas.
 */
export function sanitizeFileName(name: string): string {
  const base = path.basename(name)
  return base
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[._-]+|[._-]+$/g, '')
    .toLowerCase()
}

/**
 * Validación ligera por metadatos del File (cliente / capa previa).
 * La fuente de verdad es `validarPreflightArchivo` sobre los bytes.
 */
export function validateFile(archivo: File): { ok: boolean; error?: string } {
  const safeName = sanitizeFileName(archivo.name)
  const ext = safeName.split('.').pop() ?? ''
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { ok: false, error: 'Extensión de archivo no permitida' }
  }
  return { ok: true }
}

export interface ResultadoSubida {
  url: string | null
  nombre: string | null
}

/**
 * Sube un archivo al bucket privado `arte-files` y devuelve una signed URL
 * de 1 h. Rechaza con Error si el preflight falla (no se sube nada).
 * Si falla Storage tras validar, devuelve nulls sin romper el presupuesto.
 */
export async function subirArchivoPresupuesto(archivo: File): Promise<ResultadoSubida> {
  const buffer = await archivo.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const preflight = validarPreflightArchivo(bytes, archivo.name)
  if (!preflight.ok) {
    throw new Error(preflight.error ?? 'Archivo no válido')
  }

  const supabaseAdmin = createAdminClient()
  if (!supabaseAdmin) {
    return { url: null, nombre: null }
  }

  const uuid = randomUUID()
  const safeName = sanitizeFileName(archivo.name)
  const storagePath = `presupuestos/${uuid}/${safeName}`

  const { error: uploadError } = await supabaseAdmin.storage.from('arte-files').upload(storagePath, buffer, {
    contentType: preflight.mime ?? (archivo.type || 'application/octet-stream'),
    upsert: false,
  })

  if (uploadError) {
    console.error('[storage/presupuesto] Error subiendo archivo:', uploadError.message)
    return { url: null, nombre: null }
  }

  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from('arte-files')
    .createSignedUrl(storagePath, 3600)

  if (signedError) {
    console.error('[storage/presupuesto] Error generando signed URL:', signedError.message)
    return { url: null, nombre: null }
  }

  return { url: signedData.signedUrl, nombre: safeName }
}
