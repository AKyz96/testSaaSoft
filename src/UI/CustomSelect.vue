<template>
  <div class="flex flex-col gap-1">
    <el-select
      :model-value="modelValue"
      :placeholder="placeholder"
      @update:model-value="$emit('update:modelValue', $event)"
      class="w-full"
    >
      <el-option
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
interface Option {
  label: string;
  value: string | number;
}

interface Props {
  modelValue: string | number;
  options: Option[];
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Выберите опцию'
});

defineEmits<{
  'update:modelValue': [value: string | number]
}>();
</script>