import { useEffect, useState } from 'react'
import { useEmpleados } from './hooks/useEmpleados'
import { useDepartamentos } from './hooks/useDepartamentos'
import { EmpleadosTab } from './components/EmpleadosTab'
import { DepartamentosTab } from './components/DepartamentosTab'
import './App.css'

type ActiveTab = 'empleados' | 'departamentos'

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('empleados')
  const empleados = useEmpleados()
  const departamentos = useDepartamentos({ onEmpleadosChange: empleados.fetchEmpleados })

  useEffect(() => {
    empleados.fetchEmpleados()
    departamentos.fetchDepartamentos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <EmpleadosTab
            {...empleados}
            departamentos={departamentos.departamentos}
          />
        ) : (
          <DepartamentosTab
            {...departamentos}
            empleadosByDepartamento={empleados.empleadosByDepartamento}
          />
        )}
      </main>
    </div>
  )
}
