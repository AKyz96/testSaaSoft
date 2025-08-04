export interface AccountLabel {
  text: string
}

export interface Account {
  id: number
  labels: string
  type: 'local' | 'ldap'
  login: string
  password: string
  showPassword: boolean
  errors: Record<string, string>
}

export interface AccountData {
  id: number
  labels: AccountLabel[]
  type: 'local' | 'ldap'
  login: string
  password: string | null
}

export interface AccountErrors {
  labels?: string
  login?: string
  password?: string
} 