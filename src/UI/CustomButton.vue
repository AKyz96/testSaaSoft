<template>
    <el-button @click="$emit('click')">
        <el-icon v-if="$slots.default">
            <slot />
        </el-icon>
        <Plus v-else />
    </el-button>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

defineEmits<{
  click: []
}>()
</script>
