import { defineStore } from 'pinia'
import type { Account, AccountData, AccountErrors } from '../types/accounts'

interface AccountsState {
  accounts: Account[]
}

export const useAccountsStore = defineStore('accounts', {
  state: (): AccountsState => ({
    accounts: []
  }),
  
  getters: {
    getAccounts: (state): Account[] => state.accounts
  },
  
  actions: {
    // Загрузка данных из localStorage при инициализации
    loadFromStorage(): void {
      try {
        const stored = localStorage.getItem('accounts')
        if (stored) {
          this.accounts = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Ошибка загрузки данных из localStorage:', error)
        this.accounts = []
      }
    },
    
    // Сохранение в localStorage
    saveToStorage(): void {
      try {
        localStorage.setItem('accounts', JSON.stringify(this.accounts))
      } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error)
      }
    },
    
    addAccount(): void {
      const newAccount: Account = {
        id: Date.now(),
        labels: '',
        type: 'local',
        login: '',
        password: '',
        showPassword: false,
        errors: {}
      }
      this.accounts.push(newAccount)
      this.saveToStorage()
    },
    
    removeAccount(id: number): void {
      const index = this.accounts.findIndex(account => account.id === id)
      if (index > -1) {
        this.accounts.splice(index, 1)
        this.saveToStorage()
      }
    },
    
    updateAccount(id: number, field: keyof Account, value: string | boolean): void {
      const account = this.accounts.find(acc => acc.id === id)
      if (account) {
        ;(account as any)[field] = value
        this.validateAccount(id)
        this.saveToStorage()
      }
    },
    
    validateAccount(id: number): boolean {
      const account = this.accounts.find(acc => acc.id === id)
      if (!account) return false
      
      const errors: AccountErrors = {}
      
      // Валидация логина
      if (!account.login.trim()) {
        errors.login = 'Логин обязателен'
      } else if (account.login.length > 100) {
        errors.login = 'Логин не должен превышать 100 символов'
      }
      
      // Валидация пароля для локальных записей
      if (account.type === 'local') {
        if (!account.password.trim()) {
          errors.password = 'Пароль обязателен для локальных записей'
        } else if (account.password.length > 100) {
          errors.password = 'Пароль не должен превышать 100 символов'
        }
      }
      
      // Валидация меток
      if (account.labels.length > 50) {
        errors.labels = 'Метки не должны превышать 50 символов'
      }
      
      account.errors = errors
      return Object.keys(errors).length === 0
    },
    
    getAccountData(id: number): AccountData | null {
      const account = this.accounts.find(acc => acc.id === id)
      if (!account) return null
      
      // Преобразование меток в массив объектов
      const labelsArray = account.labels
        .split(';')
        .map(label => label.trim())
        .filter(label => label.length > 0)
        .map(label => ({ text: label }))
      
      return {
        id: account.id,
        labels: labelsArray,
        type: account.type,
        login: account.login,
        password: account.type === 'ldap' ? null : account.password
      }
    },
    
    getAllAccountsData(): AccountData[] {
      return this.accounts.map(account => this.getAccountData(account.id)!).filter(Boolean)
    }
  }
}) 