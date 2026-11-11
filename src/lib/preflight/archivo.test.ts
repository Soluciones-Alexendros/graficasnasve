/**
 * graficasnasve.art — Tests del preflight de archivos.
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 */

import { describe, expect, it } from 'vitest'
import { MAX_ARCHIVO_BYTES, MIN_LADO_CORTO_PX, detectarMime, validarPreflightArchivo } from './archivo'

/** PDF mínimo válido a efectos de magic bytes. */
function pdfMinimo(): Uint8Array {
  return new TextEncoder().encode('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')
}

/** JPEG sintético con SOF0 y dimensiones dadas. */
function jpegConDimensiones(ancho: number, alto: number): Uint8Array {
  const sof = new Uint8Array([
    0xff,
    0xc0,
    0x00,
    0x0b,
    0x08,
    (alto >> 8) & 0xff,
    alto & 0xff,
    (ancho >> 8) & 0xff,
    ancho & 0xff,
    0x01,
    0x11,
    0x00,
  ])
  const out = new Uint8Array(2 + sof.length + 2)
  out[0] = 0xff
  out[1] = 0xd8
  out.set(sof, 2)
  out[out.length - 2] = 0xff
  out[out.length - 1] = 0xd9
  return out
}

/** PNG sintético con firma + IHDR (sin CRC válido; solo leemos dimensiones). */
function pngConDimensiones(ancho: number, alto: number): Uint8Array {
  const out = new Uint8Array(33)
  out.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0)
  // length IHDR = 13
  out[11] = 13
  out.set([0x49, 0x48, 0x44, 0x52], 12)
  out[16] = (ancho >>> 24) & 0xff
  out[17] = (ancho >>> 16) & 0xff
  out[18] = (ancho >>> 8) & 0xff
  out[19] = ancho & 0xff
  out[20] = (alto >>> 24) & 0xff
  out[21] = (alto >>> 16) & 0xff
  out[22] = (alto >>> 8) & 0xff
  out[23] = alto & 0xff
  return out
}

describe('detectarMime', () => {
  it('reconoce PDF, ZIP, JPEG y PNG', () => {
    expect(detectarMime(pdfMinimo())).toBe('application/pdf')
    expect(detectarMime(new Uint8Array([0x50, 0x4b, 0x03, 0x04]))).toBe('application/zip')
    expect(detectarMime(jpegConDimensiones(10, 10))).toBe('image/jpeg')
    expect(detectarMime(pngConDimensiones(10, 10))).toBe('image/png')
  })

  it('devuelve unknown para HTML', () => {
    expect(detectarMime(new TextEncoder().encode('<!DOCTYPE html><html></html>'))).toBe('unknown')
  })
})

describe('validarPreflightArchivo', () => {
  it('acepta un PDF mínimo con extensión correcta', () => {
    const r = validarPreflightArchivo(pdfMinimo(), 'arte.pdf')
    expect(r.ok).toBe(true)
    expect(r.mime).toBe('application/pdf')
  })

  it('acepta JPEG con lado corto ≥ mínimo', () => {
    const r = validarPreflightArchivo(jpegConDimensiones(1600, 1200), 'foto.jpg')
    expect(r.ok).toBe(true)
    expect(r.anchoPx).toBe(1600)
    expect(r.altoPx).toBe(1200)
  })

  it('rechaza JPEG por debajo de la resolución mínima', () => {
    const r = validarPreflightArchivo(jpegConDimensiones(800, 600), 'peque.jpg')
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/Resolución insuficiente/)
    expect(r.error).toContain(String(MIN_LADO_CORTO_PX))
  })

  it('rechaza HTML renombrado a .pdf', () => {
    const r = validarPreflightArchivo(new TextEncoder().encode('<html>x</html>'), 'fake.pdf')
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/magic bytes|No reconocemos/i)
  })

  it('rechaza archivo vacío', () => {
    const r = validarPreflightArchivo(new Uint8Array(0), 'vacio.pdf')
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/vacío/)
  })

  it('rechaza archivo mayor de 50 MB', () => {
    const grande = new Uint8Array(MAX_ARCHIVO_BYTES + 1)
    grande[0] = 0x25 // %
    grande[1] = 0x50 // P
    grande[2] = 0x44 // D
    grande[3] = 0x46 // F
    const r = validarPreflightArchivo(grande, 'enorme.pdf')
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/50 MB/)
  })

  it('rechaza extensión que no coincide con el contenido', () => {
    const r = validarPreflightArchivo(pdfMinimo(), 'arte.jpg')
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/no coincide/)
  })

  it('acepta PNG grande', () => {
    const r = validarPreflightArchivo(pngConDimensiones(2000, 1500), 'cartel.png')
    expect(r.ok).toBe(true)
  })
})
