import { useMemo, useState, type FormEvent } from 'react'
import type { EmpleadoInsert, EmpleadoWithDepartamento } from '../types'
import { supabase } from '../utils/supabase'

const emptyEmpleadoForm: EmpleadoInsert = {
  nombre: '',
  puesto: '',
  salario: '',
  departamento_id: '',
}

export function useEmpleados() {
  const [empleados, setEmpleados] = useState<EmpleadoWithDepartamento[]>([])
  const [loadingEmpleados, setLoadingEmpleados] = useState(false)
  const [savingEmpleado, setSavingEmpleado] = useState(false)
  const [empleadoError, setEmpleadoError] = useState<string | null>(null)
  const [empleadoFormError, setEmpleadoFormError] = useState<string | null>(null)
  const [empleadoForm, setEmpleadoForm] = useState<EmpleadoInsert>(emptyEmpleadoForm)
  const [editingEmpleadoId, setEditingEmpleadoId] = useState<string | null>(null)

  const empleadosByDepartamento = useMemo(() => {
    const counts: Record<string, number> = {}
    empleados.forEach((empleado) => {
      counts[empleado.departamento_id] =
        (counts[empleado.departamento_id] ?? 0) + 1
    })
    return counts
  }, [empleados])

  const fetchEmpleados = async () => {
    setLoadingEmpleados(true)
    setEmpleadoError(null)

    const { data, error } = await supabase
      .from('empleados')
      .select(
        'id,nombre,puesto,salario,departamento_id,departamento:departamentos(id,nombre,ubicacion)',
      )
      .order('nombre', { ascending: true })

    if (error) {
      setEmpleadoError('No se pudieron cargar los empleados.')
      setEmpleados([])
      setLoadingEmpleados(false)
      return
    }

    const normalized = (data ?? []).map((row) => {
      const departamento = Array.isArray(row.departamento)
        ? row.departamento[0] ?? null
        : row.departamento ?? null

      return { ...row, departamento }
    })

    setEmpleados(normalized as EmpleadoWithDepartamento[])
    setLoadingEmpleados(false)
  }

  const resetEmpleadoForm = () => {
    setEmpleadoForm(emptyEmpleadoForm)
    setEditingEmpleadoId(null)
    setEmpleadoFormError(null)
  }

  const validateEmpleadoForm = () => {
    if (
      !empleadoForm.nombre.trim() ||
      !empleadoForm.puesto.trim() ||
      !empleadoForm.salario.trim() ||
      !empleadoForm.departamento_id.trim()
    ) {
      return 'Completa todos los campos requeridos.'
    }
    return null
  }

  const handleEmpleadoSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = validateEmpleadoForm()

    if (message) {
      setEmpleadoFormError(message)
      return
    }

    setEmpleadoFormError(null)
    setSavingEmpleado(true)
    setEmpleadoError(null)

    try {
      if (editingEmpleadoId) {
        const { error } = await supabase
          .from('empleados')
          .update({
            nombre: empleadoForm.nombre.trim(),
            puesto: empleadoForm.puesto.trim(),
            salario: empleadoForm.salario.trim(),
            departamento_id: empleadoForm.departamento_id.trim(),
          })
          .eq('id', editingEmpleadoId)

        if (error) {
          setEmpleadoError('No se pudo actualizar el empleado.')
          return
        }
      } else {
        const { error } = await supabase.from('empleados').insert([
          {
            nombre: empleadoForm.nombre.trim(),
            puesto: empleadoForm.puesto.trim(),
            salario: empleadoForm.salario.trim(),
            departamento_id: empleadoForm.departamento_id.trim(),
          },
        ])

        if (error) {
          setEmpleadoError('No se pudo crear el empleado.')
          return
        }
      }

      await fetchEmpleados()
      resetEmpleadoForm()
    } finally {
      setSavingEmpleado(false)
    }
  }

  const startEmpleadoEdit = (empleado: EmpleadoWithDepartamento) => {
    setEmpleadoForm({
      nombre: empleado.nombre ?? '',
      puesto: empleado.puesto ?? '',
      salario: empleado.salario ?? '',
      departamento_id: empleado.departamento_id ?? '',
    })
    setEditingEmpleadoId(empleado.id)
    setEmpleadoFormError(null)
  }

  const handleEmpleadoDelete = async (empleado: EmpleadoWithDepartamento) => {
    const confirmed = window.confirm(
      `Seguro que deseas eliminar a ${empleado.nombre}?`,
    )

    if (!confirmed) return

    setEmpleadoError(null)
    const { error } = await supabase.from('empleados').delete().eq('id', empleado.id)

    if (error) {
      setEmpleadoError('No se pudo eliminar el empleado.')
      return
    }

    if (editingEmpleadoId === empleado.id) {
      resetEmpleadoForm()
    }

    await fetchEmpleados()
  }

  return {
    empleados,
    loadingEmpleados,
    savingEmpleado,
    empleadoError,
    empleadoFormError,
    empleadoForm,
    setEmpleadoForm,
    editingEmpleadoId,
    empleadosByDepartamento,
    fetchEmpleados,
    handleEmpleadoSubmit,
    handleEmpleadoDelete,
    startEmpleadoEdit,
    resetEmpleadoForm,
  }
}
