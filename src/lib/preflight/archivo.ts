/**
 * graficasnasve.art — Preflight de archivos de arte (servidor).
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 *
 * Valida tamaño, magic bytes (MIME real) y, en raster JPEG/PNG, resolución
 * mínima por lado corto. No afirma sangre/CMYK/tipografías (Fase 3).
 */

export const MAX_ARCHIVO_BYTES = 50 * 1024 * 1024 // 50 MB

/** Lado corto mínimo en px (~300 ppp en A6). Solo aplica a JPEG/PNG. */
export const MIN_LADO_CORTO_PX = 1200

export const ALLOWED_EXTENSIONS = ['pdf', 'ai', 'eps', 'zip', 'jpg', 'jpeg', 'png'] as const

export type ExtensionPermitida = (typeof ALLOWED_EXTENSIONS)[number]

export type MimeDetectado =
  | 'application/pdf'
  | 'application/zip'
  | 'application/postscript'
  | 'image/jpeg'
  | 'image/png'
  | 'unknown'

export interface ChequeoPreflight {
  id: 'tamano' | 'tipo' | 'resolucion'
  titulo: string
  estado: 'ok' | 'error' | 'info'
  detalle: string
}

export interface ResultadoPreflight {
  ok: boolean
  error?: string
  mime?: MimeDetectado
  extension?: string
  anchoPx?: number
  altoPx?: number
  chequeos: ChequeoPreflight[]
}

function startsWith(bytes: Uint8Array, ascii: string): boolean {
  if (bytes.length < ascii.length) return false
  for (let i = 0; i < ascii.length; i++) {
    if (bytes[i] !== ascii.charCodeAt(i)) return false
  }
  return true
}

/** Detecta el tipo real por magic bytes (no por File.type del navegador). */
export function detectarMime(bytes: Uint8Array): MimeDetectado {
  if (bytes.length >= 4 && startsWith(bytes, '%PDF')) return 'application/pdf'
  if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b) return 'application/zip'
  if (bytes.length >= 5 && (startsWith(bytes, '%!PS') || startsWith(bytes, '%!Adobe'))) {
    return 'application/postscript'
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }
  return 'unknown'
}

function extensionDeNombre(nombre: string): string {
  const base = nombre.split(/[/\\]/).pop() ?? nombre
  const partes = base.toLowerCase().split('.')
  return partes.length > 1 ? (partes.pop() ?? '') : ''
}

/** Extensiones coherentes con el MIME detectado. */
function extensionCoincide(ext: string, mime: MimeDetectado): boolean {
  switch (mime) {
    case 'application/pdf':
      return ext === 'pdf'
    case 'application/zip':
      return ext === 'zip'
    case 'application/postscript':
      return ext === 'ai' || ext === 'eps'
    case 'image/jpeg':
      return ext === 'jpg' || ext === 'jpeg'
    case 'image/png':
      return ext === 'png'
    default:
      return false
  }
}

/** Dimensiones JPEG leyendo el primer SOF0/SOF2. */
export function dimensionesJpeg(bytes: Uint8Array): { ancho: number; alto: number } | null {
  let i = 2
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i++
      continue
    }
    const marker = bytes[i + 1]
    if (marker === 0xd9 || marker === 0xda) break
    const length = (bytes[i + 2]! << 8) | bytes[i + 3]!
    // SOF0 (baseline) o SOF2 (progressive)
    if (marker === 0xc0 || marker === 0xc2) {
      const alto = (bytes[i + 5]! << 8) | bytes[i + 6]!
      const ancho = (bytes[i + 7]! << 8) | bytes[i + 8]!
      return { ancho, alto }
    }
    i += 2 + length
  }
  return null
}

/** Dimensiones PNG desde IHDR. */
export function dimensionesPng(bytes: Uint8Array): { ancho: number; alto: number } | null {
  if (bytes.length < 24) return null
  // Signature (8) + length (4) + "IHDR" (4) + width (4) + height (4)
  const tipo = String.fromCharCode(bytes[12]!, bytes[13]!, bytes[14]!, bytes[15]!)
  if (tipo !== 'IHDR') return null
  const ancho = ((bytes[16]! << 24) | (bytes[17]! << 16) | (bytes[18]! << 8) | bytes[19]!) >>> 0
  const alto = ((bytes[20]! << 24) | (bytes[21]! << 16) | (bytes[22]! << 8) | bytes[23]!) >>> 0
  return { ancho, alto }
}

/**
 * Preflight puro sobre el contenido del archivo.
 * `nombre` se usa solo para la extensión declarada.
 */
export function validarPreflightArchivo(bytes: Uint8Array, nombre: string): ResultadoPreflight {
  const chequeos: ChequeoPreflight[] = []
  const extension = extensionDeNombre(nombre)

  if (bytes.length === 0) {
    const error = 'El archivo está vacío'
    chequeos.push({ id: 'tamano', titulo: 'Tamaño', estado: 'error', detalle: error })
    return { ok: false, error, extension, chequeos }
  }

  if (bytes.length > MAX_ARCHIVO_BYTES) {
    const mb = (bytes.length / 1024 / 1024).toFixed(1)
    const error = `El archivo supera el límite de 50 MB (tamaño actual: ${mb} MB)`
    chequeos.push({ id: 'tamano', titulo: 'Tamaño', estado: 'error', detalle: error })
    return { ok: false, error, extension, chequeos }
  }

  chequeos.push({
    id: 'tamano',
    titulo: 'Tamaño',
    estado: 'ok',
    detalle: `${(bytes.length / 1024).toFixed(0)} KB · dentro del límite de 50 MB`,
  })

  if (!ALLOWED_EXTENSIONS.includes(extension as ExtensionPermitida)) {
    const error = 'Extensión de archivo no permitida. Acepta: PDF, AI, EPS, ZIP, JPG, PNG'
    chequeos.push({ id: 'tipo', titulo: 'Tipo de archivo', estado: 'error', detalle: error })
    return { ok: false, error, extension, chequeos }
  }

  const mime = detectarMime(bytes)
  if (mime === 'unknown' || !extensionCoincide(extension, mime)) {
    const error =
      mime === 'unknown'
        ? 'No reconocemos el contenido del archivo (magic bytes). Sube PDF, AI, EPS, ZIP, JPG o PNG reales.'
        : `La extensión .${extension} no coincide con el contenido real del archivo`
    chequeos.push({ id: 'tipo', titulo: 'Tipo de archivo', estado: 'error', detalle: error })
    return { ok: false, error, mime, extension, chequeos }
  }

  chequeos.push({
    id: 'tipo',
    titulo: 'Tipo de archivo',
    estado: 'ok',
    detalle: `Detectado ${mime} · extensión .${extension}`,
  })

  let anchoPx: number | undefined
  let altoPx: number | undefined

  if (mime === 'image/jpeg' || mime === 'image/png') {
    const dims = mime === 'image/jpeg' ? dimensionesJpeg(bytes) : dimensionesPng(bytes)
    if (!dims) {
      const error = 'No se pudieron leer las dimensiones de la imagen'
      chequeos.push({ id: 'resolucion', titulo: 'Resolución', estado: 'error', detalle: error })
      return { ok: false, error, mime, extension, chequeos }
    }
    anchoPx = dims.ancho
    altoPx = dims.alto
    const ladoCorto = Math.min(dims.ancho, dims.alto)
    if (ladoCorto < MIN_LADO_CORTO_PX) {
      const error = `Resolución insuficiente: el lado corto mide ${ladoCorto} px (mínimo ${MIN_LADO_CORTO_PX} px)`
      chequeos.push({ id: 'resolucion', titulo: 'Resolución', estado: 'error', detalle: error })
      return { ok: false, error, mime, extension, anchoPx, altoPx, chequeos }
    }
    chequeos.push({
      id: 'resolucion',
      titulo: 'Resolución',
      estado: 'ok',
      detalle: `${dims.ancho}×${dims.alto} px · lado corto ≥ ${MIN_LADO_CORTO_PX} px`,
    })
  } else {
    chequeos.push({
      id: 'resolucion',
      titulo: 'Resolución',
      estado: 'info',
      detalle:
        'PDF/AI/EPS/ZIP: la resolución de imágenes embebidas se revisa en taller (Fase 3). Contenido y tamaño OK.',
    })
  }

  return { ok: true, mime, extension, anchoPx, altoPx, chequeos }
}
