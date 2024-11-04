<template>
  <div class="rule-group">
    <v-select
        label="Operador Lógico"
        v-model="rules.logicalOperator"
        :items="['Todos', 'Alguno']"
        placeholder="Selecciona un operador"
    />

    <div v-for="(criterion, index) in rules.criteria" :key="index" class="criterion-item">
      <div v-if="criterion.criteria" class="sub-group">
        <RuleGroup :rules="criterion" />
      </div>
      <div v-else class="rule">
        <v-row>
          <v-col cols="4">
            <v-select
                label="Tipo de Atributo"
                v-model="criterion.attributeType"
                :items="['Área', 'Intervalo', 'Tipo de tarea']"
                placeholder="Selecciona un tipo de atributo"
            />
          </v-col>
          <v-col cols="4" v-if="criterion.attributeType === 'Tipo de tarea'">
            <v-select
                label="Tipo de Tarea"
                v-model="criterion.taskType"
                :items="taskTypes"
                placeholder="Selecciona un tipo"
            />
          </v-col>
          <v-col cols="4" v-if="criterion.attributeType === 'Área'">
            <v-select
                label="Área"
                v-model="criterion.area"
                :items="areas"
                placeholder="Selecciona un área"
            />
          </v-col>
          <v-col cols="4" v-if="criterion.attributeType === 'Intervalo'">
            <v-text-field
                label="Intervalo"
                v-model="criterion.interval"
                placeholder="Valor del intervalo"
            />
          </v-col>
          <v-btn icon @click="removeCriterion(index)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-row>
      </div>
    </div>

    <v-btn class="mt-2" color="secondary" @click="addSubGroup">Agregar Subgrupo</v-btn>
    <v-btn class="mt-2 ml-2" color="secondary" @click="addRule">Agregar Regla</v-btn>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  rules: {
    type: Object,
    required: true
  }
});

const taskTypes = ['Sacar fotos con camara', 'Sacar fotos con celular'];
const areas = ['1', '2', '3'];

const addSubGroup = () => {
  if (!props.rules.criteria) {
    props.rules.criteria = [];
  }
  props.rules.criteria.push({
    logicalOperator: 'Todos', // Por defecto se establece "Todos"
    criteria: []
  });
};

const addRule = () => {
  if (!props.rules.criteria) {
    props.rules.criteria = [];
  }
  props.rules.criteria.push({
    logicalOperator: 'Todos', // Por defecto se establece "Todos"
    attributeType: '',
    taskType: '',
    area: '',
    interval: '',
  });
};

const removeCriterion = (index) => {
  props.rules.criteria.splice(index, 1);
};
</script>

<style>
.rule-group {
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 4px;
  margin-top: 16px;
}
.criterion-item {
  margin-top: 16px;
}
</style>
