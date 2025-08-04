export interface AccountLabel {
  text: string
}

export interface Account {
  id: number
  labels: AccountLabel[]
  type: 'local' | 'ldap'
  login: string
  password: string | null
}

export interface AccountData {
  id: number
  labels: AccountLabel[]
  type: 'local' | 'ldap'
  login: string
  password: string | null
} 