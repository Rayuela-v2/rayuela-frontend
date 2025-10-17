<template>
  <h2>Checkins</h2>
  <div class="user-checkins">
    <ul v-if="checkins && checkins.length">
      <li v-for="c in checkins" :key="c._id" class="checkin">
        <div class="row">
          <div class="datetime">{{ formatDate(c.datetime) }} </div>
          <div class="task">{{ c.taskType || '-' }}</div>
          <v-chip v-if="c.contributesTo" variant="outlined" color="green">Tarea resuelta</v-chip>
          <v-chip v-if="!c.contributesTo" variant="outlined" color="gray">No contribuye</v-chip>
        </div>
      </li>
    </ul>
    <div v-else class="empty">No hay checkins.</div>
  </div>
</template>

<script>
export default {
  name: 'UserCheckins',
  props: {
    checkins: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatDate (iso) {
      if (!iso) return ''
      const d = new Date(iso)
      return d.toLocaleString()
    }
  }
}
</script>

<style scoped>
.user-checkins { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
.checkin { border: 1px solid #eee; padding: 10px; margin-bottom: 8px; border-radius: 6px; background: #fff; }
.row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-weight: 600; }
.coords { color: #444; font-size: 0.95em; }
.meta { margin-top: 6px; font-size: 0.85em; color: #666; display: flex; gap: 12px; flex-wrap: wrap; }
.empty { color: #888; padding: 12px; text-align: center; }
</style>
