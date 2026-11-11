/**
 * graficasnasve.art
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { schemaPresupuesto, type DatosPresupuesto } from '@/lib/validaciones/presupuesto'
import type { ProductoPresupuesto } from '@/types/supabase'
import { Campo } from '@/components/ui/Campo'
import { Boton } from '@/components/ui/Boton'

const MAX_ARCHIVO_BYTES = 50 * 1024 * 1024 // 50 MB
const TIPOS_ARCHIVO = '.pdf,.ai,.eps,.zip,.jpg,.jpeg,.png'

type EstadoEnvio = 'idle' | 'loading' | 'success' | 'error'

interface PropiedadesFormulario {
  /** Tipo de producto preseleccionado (p. ej. al llegar desde la tienda). */
  productoInicial?: ProductoPresupuesto
  /** Texto inicial del campo «detalles» (resumen del producto de la tienda). */
  detallesInicial?: string
}

export function FormularioPresupuesto({ productoInicial, detallesInicial }: PropiedadesFormulario = {}) {
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>('idle')
  const [mensajeError, setMensajeError] = useState<string>('')
  const [errorArchivo, setErrorArchivo] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DatosPresupuesto>({
    resolver: zodResolver(schemaPresupuesto),
    defaultValues: {
      producto: productoInicial,
      detalles: detallesInicial,
    },
  })

  function validarArchivo(archivo: File): string {
    if (archivo.size > MAX_ARCHIVO_BYTES) {
      return `El archivo supera el límite de 50 MB (tamaño actual: ${(archivo.size / 1024 / 1024).toFixed(1)} MB)`
    }
    const extensionesPermitidas = ['.pdf', '.ai', '.eps', '.zip', '.jpg', '.jpeg', '.png']
    const extension = '.' + archivo.name.split('.').pop()?.toLowerCase()
    if (!extensionesPermitidas.includes(extension)) {
      return 'Tipo de archivo no permitido. Acepta: PDF, AI, EPS, ZIP, JPG, PNG'
    }
    return ''
  }

  async function onSubmit(datos: DatosPresupuesto) {
    setEstadoEnvio('loading')
    setMensajeError('')

    const archivoInput = document.getElementById('archivo') as HTMLInputElement
    const archivo = archivoInput?.files?.[0]

    // Validación de archivo en cliente
    if (archivo) {
      const errArch = validarArchivo(archivo)
      if (errArch) {
        setErrorArchivo(errArch)
        setEstadoEnvio('idle')
        return
      }
    }

    const formData = new FormData()
    Object.entries(datos).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        formData.append(clave, String(valor))
      }
    })
    if (archivo) {
      formData.append('archivo', archivo)
    }

    try {
      const res = await fetch('/api/presupuesto', {
        method: 'POST',
        body: formData,
      })

      const json = (await res.json()) as { ok?: boolean; error?: string }

      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? 'Error desconocido al enviar la solicitud')
      }

      setEstadoEnvio('success')
      reset()
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'
      setMensajeError(mensaje)
      setEstadoEnvio('error')
    }
  }

  if (estadoEnvio === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <CheckCircle size={48} className="text-verde" />
        <h2 className="font-display text-2xl font-bold text-negro">¡Solicitud enviada!</h2>
        <p className="font-sans text-base text-gris max-w-md">
          Hemos recibido tu solicitud de presupuesto. Nuestro equipo te responderá en un plazo máximo de 24–48 horas
          laborables.
        </p>
        <Boton variant="secondary" size="md" onClick={() => setEstadoEnvio('idle')} className="mt-4">
          Enviar otra solicitud
        </Boton>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
      aria-label="Formulario de solicitud de presupuesto"
    >
      {/* Datos personales */}
      <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
        <legend className="font-mono text-xs text-gris uppercase tracking-widest mb-2">Datos de contacto</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo
            label="Nombre *"
            id="nombre"
            type="text"
            autoComplete="name"
            placeholder="María García"
            error={errors.nombre?.message}
            {...register('nombre')}
          />
          <Campo
            label="Empresa"
            id="empresa"
            type="text"
            autoComplete="organization"
            placeholder="Mi empresa S.L."
            error={errors.empresa?.message}
            {...register('empresa')}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo
            label="Email *"
            id="email"
            type="email"
            autoComplete="email"
            placeholder="maria@empresa.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Campo
            label="Teléfono"
            id="telefono"
            type="tel"
            autoComplete="tel"
            placeholder="96X XX XX XX"
            error={errors.telefono?.message}
            {...register('telefono')}
          />
        </div>
      </fieldset>

      {/* Detalles del trabajo */}
      <fieldset className="flex flex-col gap-4 border-0 p-0 m-0 border-t border-borde pt-6">
        <legend className="font-mono text-xs text-gris uppercase tracking-widest mb-2">Detalles del trabajo</legend>

        {/* Producto */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="producto" className="font-mono text-xs font-medium uppercase tracking-widest text-gris">
            Tipo de producto *
          </label>
          <select
            id="producto"
            className={[
              'w-full rounded-card border bg-paper-0 text-key font-sans text-base px-4 py-3 transition-colors duration-150 focus:outline-none focus:border-ambar focus:ring-2 focus:ring-ambar/25',
              errors.producto ? 'border-coral' : 'border-taupe',
            ].join(' ')}
            {...register('producto')}
          >
            <option value="">Selecciona un tipo de producto</option>
            <option value="papeleria">Papelería comercial</option>
            <option value="catalogo">Catálogos y revistas</option>
            <option value="libro">Libros</option>
            <option value="carpeteria">Carpetería</option>
            <option value="otro">Personalizados / Otro</option>
          </select>
          {errors.producto && (
            <p className="text-xs font-sans text-rojo" role="alert">
              {errors.producto.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo
            label="Tirada estimada"
            id="tirada"
            type="text"
            placeholder="Ej: 500 ejemplares"
            error={errors.tirada?.message}
            {...register('tirada')}
          />
          <Campo
            label="Fecha de entrega deseada"
            id="entrega"
            type="date"
            error={errors.entrega?.message}
            {...register('entrega')}
          />
        </div>

        <Campo
          as="textarea"
          label="Detalles del proyecto"
          id="detalles"
          rows={4}
          placeholder="Describe el proyecto: formato, número de páginas, colores, papel, etc."
          error={errors.detalles?.message}
          {...register('detalles')}
        />

        <Campo
          as="textarea"
          label="Acabados y tratamientos especiales"
          id="acabados"
          rows={3}
          placeholder="Ej: laminado soft-touch, stamping oro, barniz UVI selectivo..."
          error={errors.acabados?.message}
          {...register('acabados')}
        />
      </fieldset>

      {/* Archivo */}
      <fieldset className="flex flex-col gap-4 border-0 p-0 m-0 border-t border-borde pt-6">
        <legend className="font-mono text-xs text-gris uppercase tracking-widest mb-2">
          Archivo de arte (opcional)
        </legend>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="archivo" className="font-mono text-xs font-medium uppercase tracking-widest text-gris">
            Sube tu archivo
          </label>
          <input
            id="archivo"
            type="file"
            accept={TIPOS_ARCHIVO}
            onChange={() => setErrorArchivo('')}
            className="w-full rounded-card border border-taupe bg-paper-0 font-sans text-sm text-gris file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-paper-50 file:font-sans file:text-sm file:text-key file:cursor-pointer hover:file:bg-key hover:file:text-paper-0 transition-colors"
          />
          <p className="font-mono text-xs text-gris">Formatos: PDF, AI, EPS, ZIP · Máximo 50 MB</p>
          {errorArchivo && (
            <p className="text-xs font-sans text-rojo" role="alert">
              {errorArchivo}
            </p>
          )}
        </div>
      </fieldset>

      {/* RGPD */}
      <div className="border-t border-borde pt-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-1 w-4 h-4 border-borde accent-negro" {...register('rgpd')} />
          <span className="font-sans text-sm text-gris leading-relaxed">
            He leído y acepto la{' '}
            <Link href="/privacidad" className="text-negro underline hover:text-ambar transition-colors">
              política de privacidad
            </Link>
            . Mis datos serán tratados por Gráficas NASVE, S.L. con la finalidad de gestionar mi solicitud de
            presupuesto (art. 6.1.b RGPD). *
          </span>
        </label>
        {errors.rgpd && (
          <p className="text-xs font-sans text-rojo mt-2" role="alert">
            {errors.rgpd.message}
          </p>
        )}
      </div>

      {/* Error global */}
      {estadoEnvio === 'error' && mensajeError && (
        <div className="flex items-start gap-3 p-4 bg-rojo/5 border border-rojo/20">
          <AlertCircle size={18} className="text-rojo shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-rojo">{mensajeError}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Boton type="submit" variant="primary" size="lg" disabled={estadoEnvio === 'loading'} className="min-w-48">
          {estadoEnvio === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar solicitud'
          )}
        </Boton>
        <p className="font-sans text-xs text-gris">* Campos obligatorios</p>
      </div>
    </form>
  )
}
