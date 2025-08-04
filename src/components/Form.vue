<template>
  <section class="accounts-form">
    <div class="accounts-form__header">
      <h2>Учетные записи</h2>
      <button @click="addRow" class="accounts-form__add-btn">+</button>
    </div>
    <div class="accounts-form__hint">
      <span class="accounts-form__hint-icon">?</span>
      <span>Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;</span>
    </div>
    <div class="accounts-form__table">
      <div class="accounts-form__row accounts-form__row--header">
        <span>Метки</span>
        <span>Тип записи</span>
        <span>Логин</span>
        <span>Пароль</span>
        <span></span>
      </div>
      <div v-for="account in accounts" :key="account.id" class="accounts-form__row">
        <div class="accounts-form__field">
          <input 
            v-model="account.labels" 
            placeholder="Значение" 
            @blur="updateField(account.id, 'labels', account.labels)"
            :class="{ 'error': account.errors?.labels }"
            maxlength="50"
          />
          <span v-if="account.errors?.labels" class="error-message">{{ account.errors.labels }}</span>
        </div>
        <div class="accounts-form__field">
          <select 
            v-model="account.type"
            @change="updateField(account.id, 'type', account.type)"
          >
            <option value="local">Локальная</option>
            <option value="ldap">LDAP</option>
          </select>
        </div>
        <div class="accounts-form__field">
          <input 
            v-model="account.login" 
            placeholder="Значение" 
            @blur="updateField(account.id, 'login', account.login)"
            :class="{ 'error': account.errors?.login }"
            maxlength="100"
          />
          <span v-if="account.errors?.login" class="error-message">{{ account.errors.login }}</span>
        </div>
        <div class="accounts-form__field">
          <div v-if="account.type === 'local'" class="accounts-form__password">
            <input 
              :type="account.showPassword ? 'text' : 'password'" 
              v-model="account.password" 
              placeholder="Значение" 
              @blur="updateField(account.id, 'password', account.password)"
              :class="{ 'error': account.errors?.password }"
              maxlength="100"
            />
            <button type="button" @click="togglePassword(account.id)">
              <span v-if="account.showPassword">🙈</span>
              <span v-else>👁️</span>
            </button>
          </div>
          <span v-if="account.errors?.password" class="error-message">{{ account.errors.password }}</span>
        </div>
        <button type="button" @click="removeRow(account.id)" class="accounts-form__delete-btn">🗑️</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAccountsStore } from '../stores/accounts'
import type { Account } from '../types/accounts'

const accountsStore = useAccountsStore()

const accounts = computed((): Account[] => accountsStore.getAccounts)

onMounted((): void => {
  // Загружаем данные из localStorage
  accountsStore.loadFromStorage()
  
  // Если нет записей, создаем первую
  if (accounts.value.length === 0) {
    accountsStore.addAccount()
  }
})

function addRow(): void {
  accountsStore.addAccount()
}

function removeRow(id: number): void {
  accountsStore.removeAccount(id)
}

function updateField(id: number, field: keyof Account, value: string): void {
  accountsStore.updateAccount(id, field, value)
}

function togglePassword(id: number): void {
  const account = accounts.value.find(acc => acc.id === id)
  if (account) {
    account.showPassword = !account.showPassword
  }
}
</script>

<style scoped>
.accounts-form {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.accounts-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.accounts-form__add-btn {
  font-size: 22px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  cursor: pointer;
}
.accounts-form__hint {
  display: flex;
  align-items: center;
  background: #f6f8fa;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  color: #555;
  margin-bottom: 18px;
}
.accounts-form__hint-icon {
  background: #e0e7ef;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-weight: bold;
}
.accounts-form__table {
  width: 100%;
}
.accounts-form__row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 2fr 2fr 40px;
  gap: 12px;
  align-items: start;
  margin-bottom: 8px;
}
.accounts-form__row--header {
  font-weight: bold;
  color: #888;
  background: #f6f8fa;
  border-radius: 4px;
  padding: 6px 0;
  align-items: center;
}
.accounts-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.accounts-form__field input,
.accounts-form__field select {
  padding: 6px 10px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  font-size: 15px;
}
.accounts-form__field input.error {
  border-color: #d32f2f;
  background-color: #fff5f5;
}
.accounts-form__password {
  display: flex;
  align-items: center;
}
.accounts-form__password button {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-size: 18px;
}
.accounts-form__delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #d32f2f;
}
.error-message {
  font-size: 12px;
  color: #d32f2f;
  margin-top: 2px;
}
</style>
