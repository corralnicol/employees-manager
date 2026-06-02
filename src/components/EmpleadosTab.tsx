import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Departamento, EmpleadoInsert, EmpleadoWithDepartamento } from '../types'

interface EmpleadosTabProps {
  empleados: EmpleadoWithDepartamento[]
  loadingEmpleados: boolean
  savingEmpleado: boolean
  empleadoError: string | null
  empleadoFormError: string | null
  empleadoForm: EmpleadoInsert
  setEmpleadoForm: Dispatch<SetStateAction<EmpleadoInsert>>
  editingEmpleadoId: string | null
  fetchEmpleados: () => Promise<void>
  handleEmpleadoSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleEmpleadoDelete: (empleado: EmpleadoWithDepartamento) => Promise<void>
  startEmpleadoEdit: (empleado: EmpleadoWithDepartamento) => void
  resetEmpleadoForm: () => void
  departamentos: Departamento[]
}

export function EmpleadosTab({
  empleados,
  loadingEmpleados,
  savingEmpleado,
  empleadoError,
  empleadoFormError,
  empleadoForm,
  setEmpleadoForm,
  editingEmpleadoId,
  fetchEmpleados,
  handleEmpleadoSubmit,
  handleEmpleadoDelete,
  startEmpleadoEdit,
  resetEmpleadoForm,
  departamentos,
}: EmpleadosTabProps) {
  const hasDepartamentos = departamentos.length > 0

  return (
    <section className="content-grid" aria-live="polite">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              {editingEmpleadoId ? 'Editar empleado' : 'Nuevo empleado'}
            </h2>
            <p className="card-subtitle">Completa todos los campos para guardar.</p>
          </div>
          {editingEmpleadoId ? (
            <button type="button" className="ghost-btn" onClick={resetEmpleadoForm}>
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
                  setEmpleadoForm((prev) => ({ ...prev, nombre: event.target.value }))
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
                  setEmpleadoForm((prev) => ({ ...prev, puesto: event.target.value }))
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
                  setEmpleadoForm((prev) => ({ ...prev, salario: event.target.value }))
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
            <p className="card-subtitle">{empleados.length} registros activos</p>
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
  )
}
