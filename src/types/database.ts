export interface Departamento {
  id: string
  nombre: string
  ubicacion: string | null
}

export interface DepartamentoInsert {
  nombre: string
  ubicacion?: string | null
}

export interface DepartamentoUpdate {
  nombre?: string
  ubicacion?: string | null
}

export interface Empleado {
  id: string
  nombre: string
  puesto: string
  salario: string
  departamento_id: string
}

export interface EmpleadoInsert {
  nombre: string
  puesto: string
  salario: string
  departamento_id: string
}

export interface EmpleadoUpdate {
  nombre?: string
  puesto?: string
  salario?: string
  departamento_id?: string
}

export interface EmpleadoWithDepartamento extends Empleado {
  departamento: Departamento | null
}

export interface DepartamentoWithEmpleados extends Departamento {
  empleados: Empleado[]
}