<template>
    <div class="flex flex-col gap-2">
        <p>{{ label }}:</p>
        <el-select-v2
            v-model="value"
            :options="options"
            placeholder="Нет"
            style="width: 240px"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue';


const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    options: {
        type: Array,
        default: () => [],
        required: true
    }
    
});

const value = ref('');

</script>