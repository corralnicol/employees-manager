import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type {
  Departamento,
  DepartamentoInsert,
  EmpleadoInsert,
  EmpleadoWithDepartamento,
} from './types'
import { supabase } from './utils/supabase'
import './App.css'

type ActiveTab = 'empleados' | 'departamentos'

const emptyEmpleadoForm: EmpleadoInsert = {
  nombre: '',
  puesto: '',
  salario: '',
  departamento_id: '',
}

const emptyDepartamentoForm: DepartamentoInsert = {
  nombre: '',
  ubicacion: '',
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('empleados')
  const [empleados, setEmpleados] = useState<EmpleadoWithDepartamento[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loadingEmpleados, setLoadingEmpleados] = useState(false)
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false)
  const [savingEmpleado, setSavingEmpleado] = useState(false)
  const [savingDepartamento, setSavingDepartamento] = useState(false)
  const [empleadoError, setEmpleadoError] = useState<string | null>(null)
  const [departamentoError, setDepartamentoError] = useState<string | null>(null)
  const [empleadoFormError, setEmpleadoFormError] = useState<string | null>(null)
  const [departamentoFormError, setDepartamentoFormError] = useState<string | null>(null)
  const [empleadoForm, setEmpleadoForm] = useState<EmpleadoInsert>(emptyEmpleadoForm)
  const [departamentoForm, setDepartamentoForm] =
    useState<DepartamentoInsert>(emptyDepartamentoForm)
  const [editingEmpleadoId, setEditingEmpleadoId] = useState<string | null>(null)
  const [editingDepartamentoId, setEditingDepartamentoId] =
    useState<string | null>(null)

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

      return {
        ...row,
        departamento,
      }
    })

    setEmpleados(normalized as EmpleadoWithDepartamento[])
    setLoadingEmpleados(false)
  }

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

  useEffect(() => {
    fetchEmpleados()
    fetchDepartamentos()
  }, [])

  const resetEmpleadoForm = () => {
    setEmpleadoForm(emptyEmpleadoForm)
    setEditingEmpleadoId(null)
    setEmpleadoFormError(null)
  }

  const resetDepartamentoForm = () => {
    setDepartamentoForm(emptyDepartamentoForm)
    setEditingDepartamentoId(null)
    setDepartamentoFormError(null)
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

  const validateDepartamentoForm = () => {
    if (!departamentoForm.nombre.trim() || !departamentoForm.ubicacion?.trim()) {
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
      await fetchEmpleados()
      resetDepartamentoForm()
    } finally {
      setSavingDepartamento(false)
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

  const startDepartamentoEdit = (departamento: Departamento) => {
    setDepartamentoForm({
      nombre: departamento.nombre ?? '',
      ubicacion: departamento.ubicacion ?? '',
    })
    setEditingDepartamentoId(departamento.id)
    setDepartamentoFormError(null)
  }

  const handleEmpleadoDelete = async (empleado: EmpleadoWithDepartamento) => {
    const confirmed = window.confirm(
      `Seguro que deseas eliminar a ${empleado.nombre}?`,
    )

    if (!confirmed) {
      return
    }

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

  const handleDepartamentoDelete = async (departamento: Departamento) => {
    const confirmed = window.confirm(
      `Seguro que deseas eliminar el departamento ${departamento.nombre}?`,
    )

    if (!confirmed) {
      return
    }

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
    await fetchEmpleados()
  }

  const hasDepartamentos = departamentos.length > 0

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Employees Manager</p>
          <h1>Empleados y departamentos</h1>
          <p className="app-subtitle">
            Administra altas, ediciones y bajas con datos siempre actualizados.
          </p>
        </div>
        <div className="tabs" role="tablist" aria-label="Secciones">
          <button
            className={`tab ${activeTab === 'empleados' ? 'active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === 'empleados'}
            onClick={() => setActiveTab('empleados')}
          >
            Empleados
          </button>
          <button
            className={`tab ${activeTab === 'departamentos' ? 'active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === 'departamentos'}
            onClick={() => setActiveTab('departamentos')}
          >
            Departamentos
          </button>
        </div>
      </header>

      <main className="panel">
        {activeTab === 'empleados' ? (
          <section className="content-grid" aria-live="polite">
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    {editingEmpleadoId ? 'Editar empleado' : 'Nuevo empleado'}
                  </h2>
                  <p className="card-subtitle">
                    Completa todos los campos para guardar.
                  </p>
                </div>
                {editingEmpleadoId ? (
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={resetEmpleadoForm}
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>

              <form className="form" onSubmit={handleEmpleadoSubmit}>
                <div className="form-grid">
                  <label className="field">
                    Nombre
                    <input
                      type="text"
                      value={empleadoForm.nombre}
                      onChange={(event) =>
                        setEmpleadoForm((prev) => ({
                          ...prev,
                          nombre: event.target.value,
                        }))
                      }
                      placeholder="Nombre completo"
                      required
                    />
                  </label>
                  <label className="field">
                    Puesto
                    <input
                      type="text"
                      value={empleadoForm.puesto}
                      onChange={(event) =>
                        setEmpleadoForm((prev) => ({
                          ...prev,
                          puesto: event.target.value,
                        }))
                      }
                      placeholder="Rol o cargo"
                      required
                    />
                  </label>
                  <label className="field">
                    Salario
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={empleadoForm.salario}
                      onChange={(event) =>
                        setEmpleadoForm((prev) => ({
                          ...prev,
                          salario: event.target.value,
                        }))
                      }
                      placeholder="0.00"
                      required
                    />
                  </label>
                  <label className="field">
                    Departamento
                    <select
                      value={empleadoForm.departamento_id}
                      onChange={(event) =>
                        setEmpleadoForm((prev) => ({
                          ...prev,
                          departamento_id: event.target.value,
                        }))
                      }
                      required
                      disabled={departamentos.length === 0}
                    >
                      <option value="">Selecciona un departamento</option>
                      {departamentos.map((departamento) => (
                        <option key={departamento.id} value={departamento.id}>
                          {departamento.nombre}
                        </option>
                      ))}
                    </select>
                    {departamentos.length === 0 ? (
                      <span className="helper">
                        Crea un departamento para asignar empleados.
                      </span>
                    ) : null}
                  </label>
                </div>

                {!hasDepartamentos ? (
                  <p className="status warning" role="alert">
                    Crea un departamento antes de registrar empleados.
                  </p>
                ) : null}
                {empleadoFormError ? (
                  <p className="status error" role="alert">
                    {empleadoFormError}
                  </p>
                ) : null}
                {empleadoError ? (
                  <p className="status error" role="alert">
                    {empleadoError}
                  </p>
                ) : null}

                <div className="actions">
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={savingEmpleado || !hasDepartamentos}
                  >
                    {savingEmpleado
                      ? 'Guardando...'
                      : editingEmpleadoId
                        ? 'Guardar cambios'
                        : 'Crear empleado'}
                  </button>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={resetEmpleadoForm}
                    disabled={savingEmpleado}
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Lista de empleados</h2>
                  <p className="card-subtitle">
                    {empleados.length} registros activos
                  </p>
                </div>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={fetchEmpleados}
                  disabled={loadingEmpleados}
                >
                  {loadingEmpleados ? 'Actualizando...' : 'Refrescar'}
                </button>
              </div>

              {loadingEmpleados ? (
                <p className="status">Cargando empleados...</p>
              ) : empleados.length === 0 ? (
                <p className="empty">Sin empleados cargados.</p>
              ) : (
                <div className="list">
                  {empleados.map((empleado) => (
                    <article key={empleado.id} className="list-card">
                      <div>
                        <h3>{empleado.nombre}</h3>
                        <p className="muted">
                          {empleado.puesto} - Salario {empleado.salario}
                        </p>
                        <p className="muted">
                          Departamento:{' '}
                          {empleado.departamento?.nombre ?? 'Sin departamento'}
                        </p>
                      </div>
                      <div className="list-actions">
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => startEmpleadoEdit(empleado)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => handleEmpleadoDelete(empleado)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="content-grid" aria-live="polite">
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    {editingDepartamentoId
                      ? 'Editar departamento'
                      : 'Nuevo departamento'}
                  </h2>
                  <p className="card-subtitle">
                    Completa todos los campos para guardar.
                  </p>
                </div>
                {editingDepartamentoId ? (
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={resetDepartamentoForm}
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>

              <form className="form" onSubmit={handleDepartamentoSubmit}>
                <div className="form-grid">
                  <label className="field">
                    Nombre
                    <input
                      type="text"
                      value={departamentoForm.nombre}
                      onChange={(event) =>
                        setDepartamentoForm((prev) => ({
                          ...prev,
                          nombre: event.target.value,
                        }))
                      }
                      placeholder="Nombre del departamento"
                      required
                    />
                  </label>
                  <label className="field">
                    Ubicacion
                    <input
                      type="text"
                      value={departamentoForm.ubicacion ?? ''}
                      onChange={(event) =>
                        setDepartamentoForm((prev) => ({
                          ...prev,
                          ubicacion: event.target.value,
                        }))
                      }
                      placeholder="Sede o ciudad"
                      required
                    />
                  </label>
                </div>

                {departamentoFormError ? (
                  <p className="status error" role="alert">
                    {departamentoFormError}
                  </p>
                ) : null}
                {departamentoError ? (
                  <p className="status error" role="alert">
                    {departamentoError}
                  </p>
                ) : null}

                <div className="actions">
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={savingDepartamento}
                  >
                    {savingDepartamento
                      ? 'Guardando...'
                      : editingDepartamentoId
                        ? 'Guardar cambios'
                        : 'Crear departamento'}
                  </button>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={resetDepartamentoForm}
                    disabled={savingDepartamento}
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Lista de departamentos</h2>
                  <p className="card-subtitle">
                    {departamentos.length} registros activos
                  </p>
                </div>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={fetchDepartamentos}
                  disabled={loadingDepartamentos}
                >
                  {loadingDepartamentos ? 'Actualizando...' : 'Refrescar'}
                </button>
              </div>

              {loadingDepartamentos ? (
                <p className="status">Cargando departamentos...</p>
              ) : departamentos.length === 0 ? (
                <p className="empty">Sin departamentos cargados.</p>
              ) : (
                <div className="list">
                  {departamentos.map((departamento) => (
                    <article key={departamento.id} className="list-card">
                      <div>
                        <h3>{departamento.nombre}</h3>
                        <p className="muted">
                          Ubicacion: {departamento.ubicacion ?? 'Sin ubicacion'}
                        </p>
                        <p className="muted">
                          Empleados: {empleadosByDepartamento[departamento.id] ?? 0}
                        </p>
                      </div>
                      <div className="list-actions">
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => startDepartamentoEdit(departamento)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => handleDepartamentoDelete(departamento)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
