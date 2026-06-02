import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Departamento, DepartamentoInsert } from '../types'

interface DepartamentosTabProps {
  departamentos: Departamento[]
  loadingDepartamentos: boolean
  savingDepartamento: boolean
  departamentoError: string | null
  departamentoFormError: string | null
  departamentoForm: DepartamentoInsert
  setDepartamentoForm: Dispatch<SetStateAction<DepartamentoInsert>>
  editingDepartamentoId: string | null
  fetchDepartamentos: () => Promise<void>
  handleDepartamentoSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleDepartamentoDelete: (departamento: Departamento) => Promise<void>
  startDepartamentoEdit: (departamento: Departamento) => void
  resetDepartamentoForm: () => void
  empleadosByDepartamento: Record<string, number>
}

export function DepartamentosTab({
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
  empleadosByDepartamento,
}: DepartamentosTabProps) {
  return (
    <section className="content-grid" aria-live="polite">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              {editingDepartamentoId ? 'Editar departamento' : 'Nuevo departamento'}
            </h2>
            <p className="card-subtitle">Completa todos los campos para guardar.</p>
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
            <p className="card-subtitle">{departamentos.length} registros activos</p>
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
  )
}
