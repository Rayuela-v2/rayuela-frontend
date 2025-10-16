<template>
  <v-container>
    <BreadCrumb items="taskManagerPath" />
    <h1 class="mb-6">Gestión de Tareas</h1>
    <div style="display: flex; margin: 1em 0; justify-content: space-between;">
      <v-btn color="secondary" @click="generateTasks" :disabled="tasks.length !== 0" class="mt-4">
        Generar tareas automáticas
      </v-btn>
      <v-btn color="primary" @click="addNewTask" class="mt-4">
        Nueva tarea
      </v-btn>
    </div>

    <v-data-table
        :headers="headers"
        :items="tasks"
        item-value="name"
        class="elevation-1"
    >
      <template #item.index="{ index }">
        {{ index + 1 }}
      </template>

      <template #item.actions="{ item, index }">
        <v-btn icon variant="text" @click="editTask(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon variant="text" @click="duplicateTask(item, index)">
          <v-icon>mdi-content-duplicate</v-icon>
        </v-btn>
        <v-btn icon variant="text" @click="deleteTask(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-btn icon variant="text" @click="moveItem(item, -1)" :disabled="isFirst(item)">
          <v-icon>mdi-arrow-up</v-icon>
        </v-btn>
        <v-btn icon variant="text" @click="moveItem(item, 1)" :disabled="isLast(item)">
          <v-icon>mdi-arrow-down</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="taskDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form :ref="taskFormRef">
            <v-text-field
                v-model="taskForm.name"
                label="Nombre de la tarea"
            />
            <v-text-field
                v-model="taskForm.description"
                label="Descripción de la tarea"
            />
            <v-select
                v-model="taskForm.type"
                :items="taskTypes"
                label="Tipo de tarea"
                :rules="[v => !!v || 'Este campo es obligatorio']"
                required
            />
            <v-select
                v-model="taskForm.timeIntervalId"
                :items="timeIntervals"
                label="Intervalo de tiempo"
                :rules="[v => !!v || 'Este campo es obligatorio']"
                required
            />
            <v-select
                v-model="taskForm.areaId"
                :items="areas"
                label="Área"
                :rules="[v => !!v || 'Este campo es obligatorio']"
                required
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="saveTask">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn color="success" large block class="mt-6" @click="saveAllTasks">
      Guardar todas las tareas
    </v-btn>
  </v-container>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();
const projectId = route.params.projectId;
import {toast} from 'vue3-toastify';
import ProjectsService from "@/services/ProjectsService";
import TaskService from "@/services/TaskService";
import router from "@/router";
import BreadCrumb from "@/components/utils/BreadCrumb.vue";

const tasks = ref([]);
const project = ref(null);
const taskTypes = ref([]);
const timeIntervals = ref([]);
const areas = ref([]);
const editingIndex = ref(null);

onMounted(async () => {
  project.value = await ProjectsService.getProjectById(projectId);
  tasks.value = (await TaskService.getTaskForProject(projectId) || []);
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
const taskFormRef = ref(null);

const headers = [
  {title: 'Orden', value: 'index'},
  {title: 'Nombre', value: 'name'},
  {title: 'Tipo', value: 'type'},
  {title: 'Área', value: 'areaId'},
  {title: 'Int. de tiempo', value: 'timeIntervalId'},
  {title: 'Acciones', value: 'actions', sortable: false}
];

const addNewTask = () => {
  taskForm.value = {
    name: '',
    description: '',
    projectId: '',
    timeIntervalId: '',
    areaId: '',
    type: ''
  };
  editingTask.value = false;
  editingIndex.value = null;
  taskDialog.value = true;
};

const editTask = (task) => {
  editingIndex.value = tasks.value.indexOf(task);
  taskForm.value = {...task};
  editingTask.value = true;
  taskDialog.value = true;
};

const isValidForm = () => {
  return taskForm.value.timeIntervalId && taskForm.value.areaId && taskForm.value.type;
}
const saveTask = () => {
  if (isValidForm()) {
    if (editingTask.value) {
      tasks.value.splice(editingIndex.value, 1, {...taskForm.value});
      toast.success('Tarea actualizada');
    } else {
      tasks.value.push({...taskForm.value});
      toast.success('Tarea añadida');
    }
    taskDialog.value = false;
    editingIndex.value = null;
  } else {
    toast.error('Por favor, completa todos los campos obligatorios.');
  }
};

const closeDialog = () => {
  taskDialog.value = false;
};

const generateTasks = () => {
  taskTypes.value.forEach(type => {
    timeIntervals.value.forEach(timeInterval => {
      areas.value.forEach(area => {
        const newTask = {
          name: `Tarea ${type} - ${timeInterval} - Área ${area}`,
          description: `Automáticamente generada para ${type}, ${timeInterval}, área ${area}`,
          projectId: projectId,
          timeIntervalId: timeInterval,
          areaId: area,
          type: type
        };
        console.log(tasks.value)
        tasks.value = tasks.value.concat([newTask]);
      });
    });
  });
  toast.success('Tareas generadas automáticamente');
};

const duplicateTask = (task, i) => {
  const newTask = {...task, name: `${task.name} (Duplicado)`, _id: null};
  tasks.value.splice(i,0,newTask);
  toast.success(`Tarea duplicada: ${newTask.name}`);
};

const deleteTask = (task) => {
  const index = tasks.value.indexOf(task);
  if (index > -1) {
    tasks.value.splice(index, 1);
    toast.info('Tarea eliminada');
  }
};


const saveAllTasks = async () => {
  const projectId = route.params.projectId;
  console.log('projectid:',route)
  try {
    await TaskService.bulkSave(tasks.value.map(t => ({...t, projectId})),projectId);
    toast.success('Tareas guardadas con éxito');
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    toast.error('Error al guardar las tareas');
  }
};

const moveItem = (item, direction) => {
  const index = tasks.value.indexOf(item);
  const targetIndex = index + direction;

  if (targetIndex >= 0 && targetIndex < tasks.value.length) {
    const movedItem = tasks.value.splice(index, 1)[0];
    tasks.value.splice(targetIndex, 0, movedItem);
  }
};

const isFirst = (item) => {
  return tasks.value.indexOf(item) === 0;
};

const isLast = (item) => {
  return tasks.value.indexOf(item) === tasks.value.length - 1;
};
</script>
