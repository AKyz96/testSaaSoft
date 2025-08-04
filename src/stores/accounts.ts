import { defineStore } from 'pinia'
import type { Account, AccountData, AccountLabel } from '../types/accounts'

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
          const accounts = JSON.parse(stored)
          // Миграция данных: преобразуем строки labels в массив объектов
          this.accounts = accounts.map((account: any) => {
            if (typeof account.labels === 'string') {
              // Если labels - строка, преобразуем в массив объектов
              const labelsArray = account.labels
                .split(';')
                .map((label: string) => label.trim())
                .filter((label: string) => label.length > 0)
                .map((label: string) => ({ text: label }))
              return { ...account, labels: labelsArray }
            }
            return account
          })
        }
      } catch (error) {
        console.error('Ошибка загрузки данных из localStorage:', error)
        this.accounts = []
      }
    },
    
    // Сохранение в localStorage только валидных аккаунтов
    saveToStorage(): void {
      try {
        const validAccounts = this.accounts.filter(account => this.validateAccount(account))
        localStorage.setItem('accounts', JSON.stringify(validAccounts))
      } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error)
      }
    },
    
    addAccount(): void {
      const newAccount: Account = {
        id: Date.now(),
        labels: [],
        type: 'local',
        login: '',
        password: ''
      }
      this.accounts.push(newAccount)
      // Не сохраняем в localStorage при добавлении
    },
    
    removeAccount(id: number): void {
      const index = this.accounts.findIndex(account => account.id === id)
      if (index > -1) {
        this.accounts.splice(index, 1)
        // Сохраняем только валидные аккаунты после удаления
        this.saveToStorage()
      }
    },
    
    updateAccount(id: number, field: keyof Account, value: string | boolean): void {
      const account = this.accounts.find(acc => acc.id === id)
      if (account) {
        ;(account as any)[field] = value
        // Не сохраняем автоматически при обновлении
      }
    },
    
    // Валидация возвращает true/false, ошибки не сохраняются
    validateAccount(account: Account): boolean {
      // Валидация логина
      if (!account.login.trim() || account.login.length > 100) {
        return false
      }
      // Валидация пароля для локальных записей
      if (account.type === 'local' && (!account.password?.trim() || account.password.length > 100)) {
        return false
      }
      // Валидация меток - проверяем общую длину всех меток
      const totalLabelsLength = account.labels.reduce((total, label) => total + label.text.length, 0)
      if (totalLabelsLength > 50) {
        return false
      }
      return true
    },

    // Обновление меток из массива объектов
    updateAccountLabels(id: number, labels: AccountLabel[]): void {
      const account = this.accounts.find(acc => acc.id === id)
      if (account) {
        account.labels = labels
        this.saveToStorage()
      }
    },

    // Преобразование массива меток в строку для отображения
    labelsArrayToString(labels: AccountLabel[]): string {
      return labels.map(label => label.text).join('; ')
    },

    getAccountData(id: number): AccountData | null {
      const account = this.accounts.find(acc => acc.id === id)
      if (!account) return null
      
      return {
        id: account.id,
        labels: account.labels,
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