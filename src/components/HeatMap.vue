<script>
import {useStore} from "../store/store.js";
import * as d3 from "d3";
import * as echarts from 'echarts';
import {watch} from "vue";
import _ from "lodash";
import {contourColor, GlobalColorList, simtmp} from "../utils/global.js";
import {ElLoading} from "element-plus";
import axios from "axios";

export default {
  name: "HeatMap",
  data(){
    return {
      loading: [true, true, true]
    }
  },
  mounted() {
    const store = useStore()
    // alert(store)
    const chart1 = echarts.init(document.getElementById('rect-tree-map'))

    const chart2 = echarts.init(document.getElementById('line-chart'))
    const chart3 = echarts.init(document.getElementById('heat-map'))
    const loading1 = ElLoading.service({
      target:document.getElementById('rect-tree-map')
    })
    const loading2 = ElLoading.service({
      target:document.getElementById('line-chart')
    })
    const loading3 = ElLoading.service({
      target:document.getElementById('heat-map')
    })

    watch(() => store.similarity, (data) => {
      loading3.close()
      this.initHeatMap(chart3, data)
    })
    // this.initHeatMap(simtmp)
    watch(() => store.score, (data) => {
      loading2.close()
      this.initLineChart(chart2, data)
    })
    watch(() => store.center, (data) => {
      if (data!==-2){
        axios.post('/api/tree_map', {'cluster_index': data}).then(res=>{
          loading1.close()
          this.initTreeMap(chart1, res.data['treemap'])
        })
      }
    })

  },
  methods: {
    initTreeMap(chart, data) {
      function getLevelData(data, level, currentLevel) {
        // console.log('fun', data)
        if (level < currentLevel) return []

        data?.forEach(item => {
          let cur = currentLevel
          if (cur >= level) {
            delete item.children
          } else {
            getLevelData(item.children, level, ++cur)
          }
        })
      }

      getLevelData(data, 2, 1)
      // let colorList=[
      //   "#2ec7c9",
      //   "#b6a2de",
      //   "#5ab1ef",
      //   "#ffb980",
      //   "#d87a80",
      //   "#8d98b3",
      //   "#e5cf0d",
      //   "#97b552",
      //   "#95706d",
      //   "#dc69aa",
      //   "#07a2a4",
      //   "#9a7fd1",
      //   "#588dd5",
      //   "#f5994e",
      //   "#c05050",
      //   "#59678c",
      //   "#c9ab00",
      //   "#7eb00a",
      //   "#6f5553",
      //   "#c14089"
      // ].map(d=>{
      //   return {
      //     type: 'linear',
      //     x: 0,
      //     y: 0,
      //     x2: 1,
      //     y2: 1,
      //     colorStops: [{
      //       offset: 0, color: d // 0% 处的颜色
      //     }, {
      //       offset: 1, color: d+'40' // 100% 处的颜色
      //     }],
      //     global: false // 缺省为 false
      //   }
      // })
      let colorList=['#B3CDE3','#E3D1B3','#60798E', '#B3E3E0', '#E3DAB3']

        // {
        //   type: 'linear',
        //   x: 0,
        //   y: 0,
        //   x2: 1,
        //   y2: 1,
        //   colorStops: [{
        //     offset: 0, color: '#E3D1B3' // 0% 处的颜色
        //   }, {
        //     offset: 1, color: '#ffffffff' // 100% 处的颜色
        //   }],
        //   global: false // 缺省为 false
        // },
        // {
        //   type: 'linear',
        //   x: 0,
        //   y: 0,
        //   x2: 1,
        //   y2: 1,
        //   colorStops: [{
        //     offset: 0, color: '#60798E' // 0% 处的颜色
        //   }, {
        //     offset: 1, color: '#ffffffff' // 100% 处的颜色
        //   }],
        //   global: false // 缺省为 false
        // },
        // {
        //   type: 'linear',
        //   x: 0,
        //   y: 0,
        //   x2: 1,
        //   y2: 1,
        //   colorStops: [{
        //     offset: 0, color: '#B3E3E0' // 0% 处的颜色
        //   }, {
        //     offset: 1, color: '#ffffffff' // 100% 处的颜色
        //   }],
        //   global: false // 缺省为 false
        // },
        // {
        //   type: 'linear',
        //   x: 0,
        //   y: 0,
        //   x2: 1,
        //   y2: 1,
        //   colorStops: [{
        //     offset: 0, color: '##E3DAB3' // 0% 处的颜色
        //   }, {
        //     offset: 1, color: '#ffffffff' // 100% 处的颜色
        //   }],
        //   global: false // 缺省为 false
        // }
      // ]
      // console.log([...colorList,...colorList,...colorList])
      const option = {
        color: colorList,
        series: {
          name: 'root',
          type: 'treemap',
          data: data,
          breadcrumb: {
            show: false
          },
          itemStyle:{
            borderWidth:0.5
          },
          label: {
            show: false
          },
        },
        grid: [
          {
            top:0,
            left:0,
            bottom:0,
            right:0
          }
        ],
        tooltip: {
          formatter: function (info) {
            let result = []
            info.treePathInfo.map((d, index) => index>0?result.push(d.name):null)
            return _.join(result, ' / ') + '：' + info.value
          },
          backgroundColor:'#ffffff3e',
          borderWidth:0,
          axisPointer:{
            animate: false
          },
          position:'right',
          textStyle:{
            color:'black',
            fontSize:10
          }
        }
      };
      chart.setOption(option)
    },
    initLineChart(chart, data) {
      const option = {
        color:["#001852", "#e01f54"],
        legend: {},
        tooltip: {
          hideDelay:0,
          formatter: '{c}',
          backgroundColor:'#ffffff3e',
          borderWidth:0,
          textStyle:{
            color:'black'
          },
          trigger:'axis',
          axisPointer: {
            type:'cross',
            animate:false
          }
        },
        grid: [
          {
            top: 30,
            containLabel: true,
            bottom: 3
          }
        ],
        xAxis: {
          data: data.map(i => i['count'])
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'DB指数',
            type: 'line',
            data: data.map(i => i['db_score'])
          },
          {
            name: 'CH指数',
            type: 'line',
            data: data.map(i => i['ch_score'])
          }
        ]
      }
      chart.setOption(option)
    },
    initHeatMap(chart, data) {
      const option = {
        legend: {},
        tooltip: {
          formatter: function (info) {
            return info.value[2].toFixed(3)
          },
          backgroundColor:'#ffffff3e',
          borderWidth:0,
          axisPointer:{
            animate: false
          },
          textStyle:{
            color:'black'
          }
        },
        grid: [
          {
            top: 30,
            containLabel: true,
            bottom: 3
          }
        ],
        visualMap: {
          show: false,
          min: 0,
          max: d3.max(data, d => d.similarity),
          calculable: false,
          realtime: false,
          precision: 6,
          inRange: {
            color: [
              'white',
              contourColor
            ]
          }
        },
        label: {
          show: false
        },
        xAxis: {
          type: 'category',
          data: Array.from({length: Math.sqrt(data.length)}, (v, k) => '簇-' + (k + 1)),
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: 'category',
          data: Array.from({length: Math.sqrt(data.length)}, (v, k) => '簇-' + (k + 1)),
          splitArea: {
            show: true
          }
        },
        series: {
          type: 'heatmap',
          data: data.map(i => [i.x, i.y, i.similarity]),
          label: {
            show: false
          },
          // tooltip: {
          //   formatter: function (params, ticket, callback) {
          //     return `<span>${params.value[2]}</span>`;
          //   }
          // },
          // emphasis: {
          //   itemStyle: {
          //     shadowBlur: 10,
          //     shadowColor: 'rgba(0, 0, 0, 0.5)'
          //   }
          // },
          itemStyle:{
            borderWidth:2
          }
        }
      }
      chart.setOption(option)
    }
  }
}
</script>

<template>
  <div class="flex flex-row h-full">
    <div class="basis-1/3">
      <div id="rect-tree-map" class="chart-container">

      </div>
    </div>
    <div class="basis-1/3">
      <div id="heat-map" class="chart-container">

      </div>
    </div>
    <div class="basis-1/3">
      <div id="line-chart" class="chart-container">

      </div>
    </div>
  </div>

</template>

<style scoped>

</style>