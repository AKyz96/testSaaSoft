<template>
  <section class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
    <div class="flex gap-2 mb-3">
      <h2 class="text-2xl font-bold text-gray-900">Учетные записи</h2>
      <CustomButton @click="addRow">
        <Plus />
      </CustomButton>
    </div>
    <div class="flex items-center bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
      <span class="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold mr-3">?</span>
      <span class="text-sm text-blue-800">Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;</span>
    </div>
    <div class="w-full">
      <div class="grid grid-cols-[2fr_1.2fr_2fr_2fr_40px] gap-3 font-semibold text-gray-600 bg-gray-50 rounded-md p-2 mb-2">
        <span>Метки</span>
        <span>Тип записи</span>
        <span>Логин</span>
        <span>Пароль</span>
        <span></span>
      </div>
      <div v-for="account in accounts" :key="account.id" class="grid grid-cols-[2fr_1.2fr_2fr_2fr_40px] gap-3 items-center mb-2">
        <div class="flex flex-col gap-1">
          <el-input
            v-model="labelsInputs[account.id]"
            placeholder="Значение"
            @blur="saveLabels(account.id)"
            :class="errors[account.id]?.labels ? 'border-red-500' : ''"
            maxlength="50"
          />
        </div>
        <div class="flex flex-col gap-1">
          <CustomSelect
            v-model="account.type"
            :options="[
              { label: 'Локальная', value: 'local' },
              { label: 'LDAP', value: 'ldap' }
            ]"
            placeholder="Выберите тип"
            @update:modelValue="(value) => updateField(account.id, 'type', value)"
          />
        </div>
        <div class="flex flex-col gap-1">
          <el-input
            v-model="account.login"
            placeholder="Значение"
            @blur="updateField(account.id, 'login', account.login)"
            :class="errors[account.id]?.login ? 'border-red-500' : ''"
            maxlength="100"
          />
        </div>
        <div class="flex flex-col gap-1">
          <div v-if="account.type === 'local'">
            <el-input
              v-model="account.password"
              type="password"
              placeholder="Значение"
              show-password
              @blur="updateField(account.id, 'password', account.password)"
              :class="errors[account.id]?.password ? 'border-red-500' : ''"
              maxlength="100"
            />
          </div>
        </div>
        <button 
          type="button" 
          @click="removeRow(account.id)" 
          class="text-lg"
        >
          <el-icon><Delete color="black" size="20" class="cursor-pointer hover:text-red-700 transition-colors duration-200" /></el-icon>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAccountsStore } from '../stores/accounts'
import type { Account } from '../types/accounts'
import CustomButton from '../UI/CustomButton.vue'
import CustomSelect from '../UI/CustomSelect.vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const accountsStore = useAccountsStore()
const accounts = computed((): Account[] => accountsStore.getAccounts)

// Локальное хранилище ошибок для покраски
const errors = reactive<Record<number, { labels?: boolean; login?: boolean; password?: boolean }>>({})

// Локальное хранилище строк для инпутов меток
const labelsInputs = reactive<Record<number, string>>({})

onMounted((): void => {
  accountsStore.loadFromStorage()
  if (accounts.value.length === 0) {
    accountsStore.addAccount()
  }
  // Инициализация строк для всех аккаунтов
  accounts.value.forEach(account => {
    labelsInputs[account.id] = account.labels.map(l => l.text).join('; ')
  })
})

watch(accounts, (newAccounts) => {
  newAccounts.forEach(account => {
    if (!(account.id in labelsInputs)) {
      labelsInputs[account.id] = account.labels.map(l => l.text).join('; ')
    }
  })
})

function addRow(): void {
  accountsStore.addAccount()
}

function removeRow(id: number): void {
  accountsStore.removeAccount(id)
  delete errors[id]
  delete labelsInputs[id]
}

function validateField(account: Account, field: keyof Account) {
  if (!errors[account.id]) errors[account.id] = {}
  // labels - проверяем общую длину всех меток
  if (field === 'labels') {
    const totalLabelsLength = account.labels.reduce((total, label) => total + label.text.length, 0)
    errors[account.id].labels = totalLabelsLength > 50
  }
  // login
  if (field === 'login') {
    errors[account.id].login = !account.login.trim() || account.login.length > 100
  }
  // password - только для локальных записей
  if (field === 'password' && account.type === 'local') {
    errors[account.id].password = !account.password?.trim() || account.password.length > 100
  }
  if (field === 'type') {
    // при смене типа сбрасываем ошибку пароля
    errors[account.id].password = false
  }
}

function isAccountValid(account: Account): boolean {
  // Проверяем обязательные поля
  const hasValidLogin = account.login.trim() && account.login.length <= 100
  const hasValidPassword = account.type === 'ldap' || (account.password?.trim() && account.password.length <= 100)
  const totalLabelsLength = account.labels.reduce((total, label) => total + label.text.length, 0)
  const hasValidLabels = totalLabelsLength <= 50
  
  return hasValidLogin && hasValidPassword && hasValidLabels
}

function updateField(id: number, field: keyof Account, value: string | number): void {
  accountsStore.updateAccount(id, field, String(value))
  const account = accounts.value.find(acc => acc.id === id)
  if (account) {
    // Если изменился тип на LDAP, сбрасываем пароль
    if (field === 'type' && value === 'ldap') {
      accountsStore.updateAccount(id, 'password', null)
    }
    validateField(account, field)
    // Сохраняем только если все поля валидны
    if (isAccountValid(account)) {
      accountsStore.saveToStorage()
    }
  }
}

function saveLabels(id: number) {
  const labels = labelsInputs[id]
    .split(';')
    .map(label => label.trim())
    .filter(label => label.length > 0)
    .map(label => ({ text: label }))
  accountsStore.updateAccountLabels(id, labels)
  const account = accounts.value.find(acc => acc.id === id)
  if (account) {
    validateField(account, 'labels')
    if (isAccountValid(account)) {
      accountsStore.saveToStorage()
    }
  }
}

function getLabelsString(account: Account): string {
  if (!Array.isArray(account.labels)) {
    return ''
  }
  return account.labels.map(label => label.text).join('; ')
}
</script>


