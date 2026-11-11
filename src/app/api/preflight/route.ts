/**
 * graficasnasve.art — Preflight de archivo sin persistir en Storage.
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 */

import { NextRequest, NextResponse } from 'next/server'
import { validarPreflightArchivo } from '@/lib/preflight/archivo'

export async function POST(request: NextRequest) {
  try {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'No se pudo procesar la solicitud' }, { status: 400 })
    }

    const archivo = formData.get('archivo')
    if (!archivo || !(archivo instanceof File) || archivo.size === 0) {
      return NextResponse.json({ error: 'Falta el archivo a validar' }, { status: 422 })
    }

    const bytes = new Uint8Array(await archivo.arrayBuffer())
    const resultado = validarPreflightArchivo(bytes, archivo.name)

    if (!resultado.ok) {
      return NextResponse.json(resultado, { status: 422 })
    }

    return NextResponse.json(resultado, { status: 200 })
  } catch (err) {
    console.error('[api/preflight] Error inesperado:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
