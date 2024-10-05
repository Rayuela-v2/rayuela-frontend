<template>
  <v-container>
    <h1 class="mb-6">Gestión de Tareas</h1>
    <div style="display: flex; margin:1em 0; justify-content: end;">
      <!-- Botón para agregar tarea nueva -->
      <v-btn color="primary" @click="addNewTask" class="mt-4">
        Nueva tarea
      </v-btn>
    </div>
    <!-- Tabla de Tareas -->
    <v-data-table
        :headers="headers"
        :items="tasks"
        item-value="name"
        class="elevation-1"
    >
      <template #item.actions="{ item }">
        <v-btn icon variant="text" @click="editTask(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon variant="text" @click="duplicateTask(item)">
          <v-icon>mdi-content-duplicate</v-icon>
        </v-btn>
        <v-btn icon variant="text" @click="deleteTask(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="taskDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}</span>
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="taskForm.name" label="Nombre de la tarea" required />
          <v-text-field v-model="taskForm.description" label="Descripción de la tarea" required />
          <v-select v-model="taskForm.type" :items="taskTypes" label="Tipo de tarea" required />
          <v-select v-model="taskForm.timeIntervalId" :items="timeIntervals" label="Intervalo de tiempo" required />
          <v-select v-model="taskForm.areaId" :items="areas" label="Área" required />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="saveTask">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const projectId = route.params.id;
import {toast} from 'vue3-toastify';
import ProjectsService from "@/services/ProjectsService";
import TaskService from "@/services/TaskService";

const tasks = ref([]);
const project = ref(null);
const taskTypes = ref([]);
const timeIntervals = ref([]);
const areas = ref([]);

onMounted(async () => {
  project.value = await ProjectsService.getProjectById(projectId);
  tasks.value = await TaskService.getTaskForProject(projectId);
  taskTypes.value = project.value.taskTypes;
  timeIntervals.value = project.value.timeIntervals.map(ti => ti.name);
  areas.value = project.value.areas.features.map(f => f.properties.id);
});

const taskDialog = ref(false);
const taskForm = ref({
  name: '',
  description: '',
  projectId: '',
  timeIntervalId: '',
  areaId: '',
  type: ''
});
const editingTask = ref(false);

const headers = [
  { text: 'Nombre', value: 'name' },
  { text: 'Descripción', value: 'description' },
  { text: 'Tipo', value: 'type' },
  { text: 'Área', value: 'areaId' },
  { text: 'Intervalo de Tiempo', value: 'timeIntervalId' },
  { text: 'Acciones', value: 'actions', sortable: false }
];

const addNewTask = () => {
  taskForm.value = {
    name: '',
    description: '',
    projectId: '123',
    timeIntervalId: '',
    areaId: '',
    type: ''
  };
  editingTask.value = false;
  taskDialog.value = true;
};

const editTask = (task) => {
  taskForm.value = { ...task };
  editingTask.value = true;
  taskDialog.value = true;
};

const duplicateTask = (task) => {
  const newTask = { ...task, name: `${task.name} (Duplicado)` };
  tasks.value.push(newTask);
  toast.success(`Tarea duplicada: ${newTask.name}`);
};

const deleteTask = (task) => {
  const index = tasks.value.indexOf(task);
  if (index > -1) {
    tasks.value.splice(index, 1);
    toast.info('Tarea eliminada');
  }
};

const saveTask = () => {
  if (editingTask.value) {
    toast.success('Tarea actualizada');
  } else {
    tasks.value.push({ ...taskForm.value });
    toast.success('Tarea añadida');
  }
  taskDialog.value = false;
};

const closeDialog = () => {
  taskDialog.value = false;
};
</script>
