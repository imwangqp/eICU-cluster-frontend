<script setup>
import { LoadingOutlined } from '@ant-design/icons-vue';
</script>

<script>
import axios from "axios";
import * as d3 from "d3";
import {contourColor, scatterPlotColorList, treemap} from "../utils/global.js";
import _ from 'lodash'
import {useStore} from "../store/store.js";
import ContourIcon from '../assets/contour.svg'
import ScatterIcon from '../assets/scatter.svg'
import ContourBlank from '../assets/contour_black.svg'
import ScatterBlank from '../assets/scatter_black.svg'
import {watch, reactive} from "vue";
import 'vue-loaders/dist/vue-loaders.css'
// import temp from '/public/temp.json'
import {ElLoading} from "element-plus";


export default {
  name: "ScatterPlot",
  components: {
    ContourIcon,
    ScatterIcon,
    ContourBlank,
    ScatterBlank,
  },
  data() {
    return {
      panel:{
        checkboxList: ['BMI', '年龄', '性别', '人种','诊断结果'],
        methodList:['K-means', 'K-prototypes', 'Affinity propagation', 'Clara', 'Dbscan'],
        loading:true
      },
      form: {
        cluster_count:8,
        cluster_factor: [0,1,2,3,4],
        cluster_method: 0
      },
      size: {
        canvas: {
          width: 0,
          height: 0
        },
        margin: {
          top: 10,
          right: 10,
          left: 10,
          bottom: 10
        },
        chartHeight: 0,
        circleSize: 2,
        squareWidth: 20
      },
      scatter:{},
      showCenter: true,
      showScatter: true,
      showContour: true,
      checkAll: true,
      isIndeterminate: false,
      formItemList: ['性别', '年龄', '病史'],
      loading: false,
      initLoading:true,
      clusterScatter: [],
      radio: 1,
      slideValue: 6,
      chartHeight: 0,
      classList: ['All', 'Covid', 'Liver', 'Kidney', 'Coagulation', 'Nutritional Status', 'Infection Or Inflammation', 'Erythropoiesis', 'Immune System']
    }
  },
  mounted() {
    const loading = ElLoading.service({
      target:document.getElementById('scatter-chart')
    })
    let that = this
    this.size.chartHeight = this.$refs["whole-container"].offsetHeight - this.$refs["config-panel"].offsetHeight - 18
    // setTimeout(()=>{
    //   store.setScore(temp['cluster_score'])
    //   store.setSimilarity(temp['similarity'])
    //
    //   store.setScatter(_.pick(temp, ['center', 'point']))
    //   store.setTreemap(treemap)
    // })
    axios.post('/api/cluster', this.form).then(res=>{
      store.setScore(res.data['cluster_score'])
      store.setSimilarity(res.data['similarity'])

      store.setScatter(_.pick(res.data, ['center', 'point']))
      store.setCenter(-1)


      // this.fetchTreemap(-1)
    })

    const store=useStore()
    watch(()=> store.scatter, (scatter)=>{
      this.panel.loading=false
      this.size.canvas.width=document.getElementById("scatter-chart").offsetWidth
      this.size.canvas.height=document.getElementById("scatter-chart").offsetHeight
      this.scatter=scatter
      loading.close()
      this.initChart(this.scatter, this.size.canvas.width, this.size.canvas.height)
    })
  },
  methods: {
    // fetchTreemap(index){
    //   const store=useStore()
    //
    //   axios.post('/api/tree_map', {'cluster_index': index}).then(res=>{
    //     console.log(res.data)
    //     store.setTreemap(res.data)
    //   })
    // },
    handleShowScatter() {
      this.showScatter = !this.showScatter
      if (this.showScatter) {
        d3.selectAll('.scatter-plot').style('display', '')
      } else {
        d3.selectAll('.scatter-plot').style('display', 'none')
      }
    },
    handleShowContour() {
      this.showContour = !this.showContour
      if (this.showContour) {
        d3.select('.contour-group').style('display', '')
      } else {
        d3.select('.contour-group').style('display', 'none')
      }
    },
    handleShowGrid() {
      this.showCenter = !this.showCenter
      if (this.showCenter) {
        d3.selectAll('.special-rect').style('display', '')
      } else {
        d3.selectAll('.special-rect').style('display', 'none')
      }
    },
    onSubmit() {
      d3.select('#scatter-chart').selectAll('svg').remove()
      this.panel.loading=true
      const store=useStore()
      store.setCenter(-2)
      axios.post('/api/cluster', this.form).then(res=>{
        // this.panel.loading=false
        // this.size.canvas.width=document.getElementById("scatter-chart").offsetWidth
        // this.size.canvas.height=document.getElementById("scatter-chart").offsetHeight
        // this.scatter=_.pick(res.data, ['center', 'point'])
        // this.initChart(this.scatter, this.size.canvas.width, this.size.canvas.height)

        store.setScatter(_.pick(res.data, ['center', 'point']))
        store.setScore(res.data['cluster_score'])
        store.setSimilarity(res.data['similarity'])

        store.setCenter(-1)
      })
    },
    initChart(data, width, height) {
      let that = this

      d3.select('#scatter-chart').selectAll('svg').remove()

      let svg = d3.select('#scatter-chart')
          .append('svg')
          .attr('width', width)
          .attr('height', height)

      let tooltip = d3.select('#scatter-chart')
          .append('div')
          .attr('class', 'tool-tip')

      let id_tooltip=d3.select('#scatter-chart')
          .append('div')
          .attr('class', 'tool-tip-id')

      let zoom = d3.zoom()
          .scaleExtent([0.1, 10])
          .on("zoom", zoomed)

      let contourGroup = svg.append("g")
          .attr('class', 'zoom')

      let scatterGroup = svg.append("g")
          .attr('class', 'zoom')

      let rectGroup = svg.append("g")
          .attr('class', 'zoom')

      svg.call(zoom)

      function zoomed(event) {
        const zoomDelta = 1 / event.transform.k
        svg.selectAll('.zoom:not(.special)').attr("transform", event.transform)
        const specialElem = d3.selectAll('.special-rect')
        specialElem.attr('stroke-width', 2 * zoomDelta)
            .attr('x', function (d) {
              return xScale(d['x']) - that.size.squareWidth * 0.5 * zoomDelta
            })
            .attr('y', function (d) {
              return yScale(d['y']) - that.size.squareWidth * 0.5 * zoomDelta
            })
            .attr('width', that.size.squareWidth * zoomDelta)
            .attr('height', that.size.squareWidth * zoomDelta)
            .attr('rx', 5 * zoomDelta)
            .attr('ry', 5 * zoomDelta)
        // console.log(d3.select('.special-rect').node().width)
      }

      let xScale = d3.scaleLinear()
          .domain([
            d3.min(data['point'], (d) => d.x),
            d3.max(data['point'], (d) => d.x)
          ])
          .range([this.size.margin.left, width - this.size.margin.right])
      let yScale = d3.scaleLinear()
          .domain([
            d3.min(data['point'], (d) => d.y),
            d3.max(data['point'], (d) => d.y)
          ])
          .range([this.size.margin.top, height - this.size.margin.bottom])

      const contours = d3.contourDensity()
          .x((d) => xScale(d['x']))
          .y(d => yScale(d['y']))
          .size([width, height])
          .thresholds(30)(data['point'])

      const colorScale = d3.scaleSequential(['white', contourColor])
          .domain([
            d3.min(contours, (d) => d.value) * 0.9,
            d3.max(contours, (d) => d.value) * 1.1
          ])

      contourGroup.append("g")
          .attr('class', 'contour-group')
          .attr("fill", "none")
          .attr("stroke", "none")
          .attr("stroke-linejoin", "round")
          .selectAll('path')
          .data(contours)
          .join("path")
          .attr("fill", (d) => colorScale(d.value))
          .attr("d", d3.geoPath());

      let scatterPlot = scatterGroup.selectAll('circle')

      scatterPlot
          .data(data['point'])
          .enter()
          .append('circle')
          .attr('cx', d => xScale(d['x']))
          .attr('cy', d => yScale(d['y']))
          .attr('r', 1)
          .attr('fill', d => scatterPlotColorList[d['cluster_id']])
          .attr('id', d => 'scatter-id-' + d['id'])
          .attr('class', 'scatter-plot')
          .style('cursor', 'pointer')
          .style('filter', 'saturate(90%)')
          .on('click', (d, item) => {
            axios.post('api/fetch_patients_by_id', {'patients_id': [_.split(d.target.id, '-')[2]]}).then(res => {
              const patient = res.data.patient[0]
              tooltip.style('left', d.offsetX + 5 + 'px')
                  .style('top', d.offsetY + 5 + 'px')
                  .style('display', 'inline-block')
                  .html(`
                    <div class="tool-tip">
                      <div class="tooltip-row">
                        <div class="font-bold leading-8">${patient['id']}</div>
                        <div>
                          <img class="w-8 h-8" src="/src/assets/female.svg"/>


                        </div>
                      </div>
                      <div class="tooltip-row">
                        <div class="tooltip-title">年龄</div>
                        <div class="tooltip-content">${patient['age']}</div>
                      </div>
                      <div class="tooltip-row bg-[#f2f2f2]">
                        <div class="tooltip-title">入院时长</div>
                        <div class="tooltip-content">${patient['unitdischargeoffset']}</div>
                      </div>
                      <div class="tooltip-row">
                        <div class="tooltip-title">人种</div>
                        <div class="tooltip-content">${patient['ethnicity']}</div>
                      </div>
                      <div class="tooltip-row bg-[#f2f2f2]">
                        <div class="tooltip-title">BMI</div>
                        <div class="tooltip-content">${patient['BMI']}</div>
                      </div>
                    </div>
                  `)
              d3.select('#' + d['target']['id'])
                  .attr('r', 2)
            })
          })
          .on('mouseout', d => {
            tooltip.style('display', 'none')
            d3.select('#' + d['target']['id'])
                .attr('r', 1)
          })
      const squareWidth = 20
      const store = useStore()
      let rectPlot = rectGroup.selectAll('rect')
      rectPlot
          .data(data['center'])
          .enter()
          .append('rect')
          .attr('class', 'special-rect')
          .attr('x', d => xScale(d['x']) - squareWidth * 0.5)
          .attr('y', d => yScale(d['y']) - squareWidth * 0.5)
          .attr('width', squareWidth)
          .attr('height', squareWidth)
          .attr('fill', 'rgba(255,255,255,0)')
          .attr('stroke', 'black')
          .attr('stroke-width', 2)
          .attr('rx', 5)
          .attr('ry', 5)
          .style('cursor', 'pointer')
          .on('click', (d, item) => {
            const store=useStore()
            store.setCenter(item['id'])
            // this.fetchTreemap(item['id'])
          })
          .on('mousemove', (d, item) => {
            id_tooltip.style('left', d.offsetX + 5 + 'px')
                .style('top', d.offsetY + 5 + 'px')
                .style('display', 'inline-block')
                .html(`簇 - ${item['id']+1}`
                )})
          .on('mouseout', d => {
            id_tooltip.style('display', 'none')
          })
    }
  }
}
</script>

<template>
    <div class="h-full w-full" ref="whole-container">
      <div ref="config-panel">
        <a-form layout="inline">
          <a-form-item>
            <el-checkbox-group v-model="form.cluster_factor" size="small" :min="1">
              <el-checkbox v-for="(item, index) in panel.checkboxList" :label="index" :key="index">{{item}}</el-checkbox>
            </el-checkbox-group>
          </a-form-item>
          <a-form-item>
            <el-input-number v-model="form.cluster_count" :min="2" :max="12" size="small" />
          </a-form-item>
<!--          <a-form-item>-->
<!--            <el-checkbox-group v-model="" size="small" >-->
<!--              <el-checkbox v-for="(item, index) in panel.checkboxList" :label="index" :key="index">{{item}}</el-checkbox>-->
<!--            </el-checkbox-group>-->
<!--            <el-radio-group v-model="form.cluster_method" size="small">-->
<!--              <el-radio v-for="(item, index) in panel.methodList" :label="index">{{item}}</el-radio>-->
<!--            </el-radio-group>-->
<!--            <el-select v-model="form.method" class="m-2" placeholder="聚类方法" size="small">-->
<!--              <el-option-->
<!--                  v-for="(item, index) in "-->
<!--                  :key="index"-->
<!--                  :label="item"-->
<!--                  :value="index"-->
<!--              />-->
<!--            </el-select>-->
<!--          </a-form-item>-->
          <a-form-item>
            <el-button :disabled="panel.loading" size="small" type="primary" @click="onSubmit">提交</el-button>
          </a-form-item>
        </a-form>
      </div>
      <div id="scatter-chart" ref="chart-container" class="relative" :style="{height:size.chartHeight+'px'}">
        <div v-if="!panel.loading" class="absolute top-1 left-1">
          <a-space>
            <el-button @click="handleShowScatter" size="small" type="primary" :plain="showScatter">
              显示数据点
            </el-button>
            <el-button @click="handleShowContour" size="small" type="primary" :plain="showContour">
              显示密度
            </el-button>
            <el-button @click="handleShowGrid" size="small" type="primary" :plain="showCenter">
              显示簇中心
            </el-button>
<!--            <a-button @click="handleShowScatter" type="primary" :ghost="!showScatter" size="small">显示数据点</a-button>-->
<!--            <a-button @click="handleShowContour" type="primary" :ghost="!showContour" size="small">显示密度</a-button>-->
<!--            <a-button @click="handleShowGrid" type="primary" :ghost="!showCenter" size="small">显示簇中心</a-button>-->
          </a-space>
        </div>
<!--        <a-spin v-if="panel.loading" :indicator="LoadingOutlined" size="large" class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />-->
      </div>

    </div>
</template>

<style>
.tooltip-row{
  @apply flex py-0.5 px-1;
  justify-content: space-between;
}
.tool-tip{
  @apply bg-[#ffffff5a];
  padding: 5px;
  border-radius: 1px;
  position: absolute;
  width: 200px;
  height: auto;
  z-index: 10;
}
.tool-tip-id{
  @apply bg-[#ffffff5a];
  padding: 5px;
  border-radius: 1px;
  position: absolute;
  width: 80px;
  height: auto;
}
.tool-tip-line{
  @apply w-full;
}
.title-str {
  @apply font-semibold;
}
.info-str {
  @apply font-normal float-right;
}
.tooltip-title{
  @apply font-bold text-sm;
}
.tooltip-content{
  @apply text-sm;
}
</style>