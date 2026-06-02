import { useState, type FormEvent } from 'react'
import type { Departamento, DepartamentoInsert } from '../types'
import { supabase } from '../utils/supabase'

const emptyDepartamentoForm: DepartamentoInsert = {
  nombre: '',
  ubicacion: '',
}

interface UseDepartamentosOptions {
  onEmpleadosChange: () => Promise<void>
}

export function useDepartamentos({ onEmpleadosChange }: UseDepartamentosOptions) {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false)
  const [savingDepartamento, setSavingDepartamento] = useState(false)
  const [departamentoError, setDepartamentoError] = useState<string | null>(null)
  const [departamentoFormError, setDepartamentoFormError] = useState<string | null>(null)
  const [departamentoForm, setDepartamentoForm] =
    useState<DepartamentoInsert>(emptyDepartamentoForm)
  const [editingDepartamentoId, setEditingDepartamentoId] =
    useState<string | null>(null)

  const fetchDepartamentos = async () => {
    setLoadingDepartamentos(true)
    setDepartamentoError(null)

    const { data, error } = await supabase
      .from('departamentos')
      .select('id,nombre,ubicacion')
      .order('nombre', { ascending: true })

    if (error) {
      setDepartamentoError('No se pudieron cargar los departamentos.')
      setDepartamentos([])
      setLoadingDepartamentos(false)
      return
    }

    setDepartamentos((data ?? []) as Departamento[])
    setLoadingDepartamentos(false)
  }

  const resetDepartamentoForm = () => {
    setDepartamentoForm(emptyDepartamentoForm)
    setEditingDepartamentoId(null)
    setDepartamentoFormError(null)
  }

  const validateDepartamentoForm = () => {
    if (!departamentoForm.nombre.trim() || !departamentoForm.ubicacion?.trim()) {
      return 'Completa todos los campos requeridos.'
    }
    return null
  }

  const handleDepartamentoSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = validateDepartamentoForm()

    if (message) {
      setDepartamentoFormError(message)
      return
    }

    setDepartamentoFormError(null)
    setSavingDepartamento(true)
    setDepartamentoError(null)

    try {
      if (editingDepartamentoId) {
        const { error } = await supabase
          .from('departamentos')
          .update({
            nombre: departamentoForm.nombre.trim(),
            ubicacion: departamentoForm.ubicacion?.trim() ?? '',
          })
          .eq('id', editingDepartamentoId)

        if (error) {
          setDepartamentoError('No se pudo actualizar el departamento.')
          return
        }
      } else {
        const { error } = await supabase.from('departamentos').insert([
          {
            nombre: departamentoForm.nombre.trim(),
            ubicacion: departamentoForm.ubicacion?.trim() ?? '',
          },
        ])

        if (error) {
          setDepartamentoError('No se pudo crear el departamento.')
          return
        }
      }

      await fetchDepartamentos()
      await onEmpleadosChange()
      resetDepartamentoForm()
    } finally {
      setSavingDepartamento(false)
    }
  }

  const startDepartamentoEdit = (departamento: Departamento) => {
    setDepartamentoForm({
      nombre: departamento.nombre ?? '',
      ubicacion: departamento.ubicacion ?? '',
    })
    setEditingDepartamentoId(departamento.id)
    setDepartamentoFormError(null)
  }

  const handleDepartamentoDelete = async (departamento: Departamento) => {
    const confirmed = window.confirm(
      `Seguro que deseas eliminar el departamento ${departamento.nombre}?`,
    )

    if (!confirmed) return

    setDepartamentoError(null)
    const { error } = await supabase
      .from('departamentos')
      .delete()
      .eq('id', departamento.id)

    if (error) {
      setDepartamentoError(
        'No se pudo eliminar el departamento. Revisa si tiene empleados asignados.',
      )
      return
    }

    if (editingDepartamentoId === departamento.id) {
      resetDepartamentoForm()
    }

    await fetchDepartamentos()
    await onEmpleadosChange()
  }

  return {
    departamentos,
    loadingDepartamentos,
    savingDepartamento,
    departamentoError,
    departamentoFormError,
    departamentoForm,
    setDepartamentoForm,
    editingDepartamentoId,
    fetchDepartamentos,
    handleDepartamentoSubmit,
    handleDepartamentoDelete,
    startDepartamentoEdit,
    resetDepartamentoForm,
  }
}
