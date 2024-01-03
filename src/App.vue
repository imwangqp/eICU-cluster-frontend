<script setup>
import DataTable from "./components/DataTable.vue";
import PatientRecord from "./components/PatientRecord.vue";
import ScatterPlot from "./components/ScatterPlot.vue";
import HeatMap from "./components/HeatMap.vue";
import ConfigForm from "./components/ConfigForm.vue";
import {watch} from "vue";


</script>

<template>
<!--  <TestComponent></TestComponent>-->
  <div class="grid-container bg-[#ecf5ff]">
    <div class="col-span-2 bg-[#ecf5ff] font-bold text-left text-[#409eff] text-2xl align-middle">
      EICU - Cluster
    </div>
    <div class="row-span-3 chart-component">
      <ScatterPlot></ScatterPlot>
    </div>
    <div class="row-span-2 chart-component">
      <DataTable></DataTable>
    </div>
    <div class="row-span-3 chart-component">
<!--      <TestComponent></TestComponent>-->
      <PatientRecord></PatientRecord>
    </div>
    <div class="row-span-2 chart-component">
<!--      <AidCharts></AidCharts>-->
      <HeatMap></HeatMap>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  height: 100vh;
  width: 100%;
  display: grid;
  grid-template-rows: 2rem repeat(5, 1fr); /* 第一行的高度为20px，其余的行平均分配剩余空间 */
  grid-template-columns: 1fr 1fr; /* 两列平均分配空间 */
}
</style>
