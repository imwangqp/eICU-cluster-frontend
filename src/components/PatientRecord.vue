<script setup>
import {VerticalAlignTopOutlined, ArrowUpOutlined, ArrowDownOutlined, VerticalAlignBottomOutlined, CloseOutlined} from "@ant-design/icons-vue";

</script>

<script>
import * as d3 from "d3";
import {ref} from "vue";
import {watch} from "vue";
import {ArrowDown, ArrowUp, Close, Download, Upload} from "@element-plus/icons-vue";
import {GlobalColorList, recordColor} from "../utils/global.js";
import _ from "lodash";
import axios from "axios";
import {useStore} from "../store/store.js";
import * as echarts from 'echarts';
// import {ElMessage} from "element-plus";

export default {
  name: "PatientRecord",
  data(){
    return {
      propertiesList:['vitalPeriodic','lab','medication', 'infusiondrug', 'diagnosis','treatment'],
      selectedProperty: [0],
      value:0,
      options: [
        {name:'体温', value:'temperature'},
        {name:'血氧饱和度', value:'sao2'},
        {name:'心率', value:'heartrate'},
        {name:'呼吸频率', value:'respiration'},
        {name:'中心静脉压', value:'cvp'},
        {name:'呼气末二氧化碳', value:'etco2'},
        {name:'血压收缩压', value:'systemicsystolic'},
        {name:'血压舒张压', value:'systemicdiastolic'},
        {name:'平均动脉压', value:'systemicmean'},
        {name:'肺动脉收缩压', value:'pasystolic'},
        {name:'肺动脉舒张压', value:'padiastolic'},
        {name:'平均肺动脉压', value:'pamean'},
        {name:'st1', value:'st1'},
        {name:'st2', value:'st2'},
        {name:'st3', value:'st3'},
        {name:'颅内压', value:'icp'},
      ],
      block:{
        size: 0,
        topSize: 0,
        rowBlockCount:40,
        lineBlockCount:5,
        blockMargin:2
      },
      sideButton: {
        left: [],
        top:[]
      },
      selected: [false, false, false, false],
      selectedPatients: [],
      selectedPatientsData: []
    }
  },
  mounted() {
    const store=useStore()
    watch(()=> store.selectedPatients, (data)=>{
      // console.log('record', data)
      this.selectedPatients=data
      for (let i = 0; i < data.length; i++) {
        this.selectedPatientsData.push({
          data:[],
          index1: 0,
          index2: 0,
          show:0
        })
      }
      _.forEach(this.selectedPatients, (item, index)=>{
        // console.log(item)
        this.initDetail(item, index)
        this.$nextTick(()=>{
          this.bindScroll(item.id)
        })

      })
    })
  },
  computed: {
    Close() {
      return Close
    },
    ArrowDown() {
      return ArrowDown
    },
    ArrowUp() {
      return ArrowUp
    },
    Upload() {
      return Upload
    },
    Download() {
      return Download
    }
  },
  methods: {
    fetchDetail(index){
      this.initDetail(this.selectedPatients[index], index)
    },

    handleScroll(e){
      if (e.deltaY){
        this.$refs['scrollRef'+_.split(e.target.id, '-')[3]][0].scrollTo(this.$refs['scrollRef'+_.split(e.target.id, '-')[3]][0].scrollLeft+e.deltaY,0)
      }
    },
    bindScroll(id){
      const div=document.getElementById('patient-record-container'+id)
      if (div.addEventListener){
        div.addEventListener('mousewheel', this.handleScroll, false)
      }
    },
    fetchDetail2(id, index, property){
      axios.post('api/fetch_all_detail', {'patient_id': id}).then(res=>{
        this.selectedPatientsData[index]['data']=res.data[property]
        this.selectedPatientsData[index]['index2']=_.indexOf(this.propertiesList, property)
        this.selectedPatientsData[index].show=2
      })
    },
    fetchDetail1(id,index,property){
      axios.post('api/fetch_all_detail', {'patient_id': id}).then(res=>{
        // console.log(id, index, property)
        // console.log(_.pick(res.data, this.options[index]['value']))
        // this.selectedPatientsData[index]['data']=res.data[property]
        // console.log(res.data[property])
        // =property
        let result=_.pick(res.data, this.options[this.selectedPatientsData[index]['index1']]['value'])
        // console.log(res.data, this.options[this.selectedPatientsData[index]['index1']]['value'], result)
        if (!_.isEqual(result, {})){
          this.selectedPatientsData[index].show=1
          this.drawDetailChart(result[this.options[this.selectedPatientsData[index]['index1']]['value']], id, this.options[this.selectedPatientsData[index]['index1']]['value'])
        }else {
          ElMessage.error('本项为空！')
        }
        // this.drawDetailChart(, id, this.options[index-1]['value'])
      })
    },
    drawDetailChart(data, id, property){
      setInterval(()=>{
        let chart=echarts.init(document.getElementById('patient-record-chart-container'+id))
        let option = {
          tooltip:{
            formatter: '{c}',
            borderWidth: 0,
            backgroundColor:'#ffffff3e',
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              animate: false
            },
            textStyle:{
              color:'black'
            }
          },
          grid: {
            top:8,
            right:12,
            left:0,
            bottom:0,
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: _.orderBy(data, 'offset').map(d=>d.offset)
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: data.map(d=>d[property]),
              type: 'line',
              smooth: true
            }
          ]
        };
        chart.setOption(option)
      }, 1)


    },
     initDetail(patient, index){

      const lineBlockCount=6,blockMargin=2

      const contrastColorList=['#7AA290','#7A88A2','#A2927A','#95A27A']
      let that=this
      //纵坐标
      function getRowIndex(id){
        return id%lineBlockCount
      }

      //横坐标
      function getLineIndex(id){
        return Math.floor(id/lineBlockCount)
      }

      function addBox(index, width, height){
        d3.select('#patient-record-svg').select('g.box').remove()
        let g = d3.select('#patient-record-svg')
            .append('g')
            .attr('class', 'box')
        let boxAppend=g.selectAll('rect')
            .append('rect')
            .attr('class', 'box')
            .attr('x', ()=>{
              return index*that.block.size+(index-1)*blockMargin-1+3
            })
            .attr('y', 0)
            .attr('width', width+2)
            .attr('height', 4*blockMargin+4*that.block.size+that.block.topSize)
            .attr('fill', 'rgba(255,255,255,0)')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)

      }
      // console.log(this.selectedPatientsData[index]['index1'])
      axios.post("api/fetch_detail_by_id",{'patient_id': patient.id,'vitalPeriodic_choice': this.selectedPatientsData[index]['index1']+1,'offset_interval':120}).then((res)=>{
        // console.log(res.data)
        const rowBlockCount=res.data.intervalCount,
            height=160-blockMargin*(lineBlockCount-1)
        this.block.size=height/(lineBlockCount)
        d3.select('#patient-record-container'+patient.id).selectAll('*').remove()
        let svg=d3.select('#patient-record-container'+patient.id)
            .append('svg')
            .attr('id', 'patient-record-svg')
            .attr('class', 'h-full')
            .attr('width', this.block.size*rowBlockCount+blockMargin*(rowBlockCount-1)+3)
            .attr('ref', 'scrollRef-'+patient.id)
        let g=svg.append('g')
        let rectAppend=g.selectAll('rect')
        // console.log(rowBlockCount)
        // console.log('array', new Array(rowBlockCount*lineBlockCount))
        let textGroup=svg.append('g')
        // textGroup.selectAll('rect')
        //     .data(this.propertiesList)
        //     .enter()
        //     .append('rect')
        //     .attr('x',0)
        //     .attr('y', (d,index)=>{
        //       return (this.block.size+blockMargin)*index
        //     })
        //     .attr('width', 82)
        //     .attr('height', this.block.size)
        //     .style('fill','#f2f2f2')
        //     .attr('rx',2)
        //     .attr('ry',2)
        textGroup.selectAll('text')
            .data(this.propertiesList)
            .enter()
            .append('text')
            .attr('class', 'property-str')
            .attr('x',41)
            .attr('y', (d,index)=>{
              return this.block.size*(index+0.5)+index*blockMargin
            })
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .text(d=>d)
            .on('click', (d,i)=>{
              if (_.indexOf(this.propertiesList, i)===0){
                // console.log(this.selectedPatientsData[index]['index1'])
                this.fetchDetail1(patient.id, index, this.selectedPatientsData[index]['index1'])
              }else {
                this.fetchDetail2(patient.id, index, i)
              }
            })

        rectAppend.data(new Array(rowBlockCount*lineBlockCount))
            .enter()
            .append('rect')
            .attr('class', (d, index)=>{
              const rowIndex=getRowIndex(index), lineIndex=getLineIndex(index)
              if (this.getContextLength(rowIndex, lineIndex,res.data)){
                return 'full-block'
              }else {
                return 'block'
              }
            })
            .attr('id', (d, index)=> {
              return 'block-'+getRowIndex(index)+'-'+getLineIndex(index)+'-'+patient.id
            })
            .attr('x', (d,index)=>{
              const lineIndex=getLineIndex(index)
              return lineIndex*this.block.size+(lineIndex-1)*blockMargin+85
            })
            .attr('y', (d, index)=>{
              const rowIndex=getRowIndex(index)
              return (rowIndex)*this.block.size+rowIndex*blockMargin
            })
            .attr('width', this.block.size)
            .attr('height', this.block.size)
            .attr('fill', (d, index)=>{
              const rowIndex=getRowIndex(index), lineIndex=getLineIndex(index)
              return this.getFillColor(rowIndex, lineIndex,res.data)
            })
            .style('cursor', (d, index)=>{
              const rowIndex=getRowIndex(index), lineIndex=getLineIndex(index)
              if (this.getContextLength(rowIndex, lineIndex,res.data)){
                return 'pointer'
              }
            })
            .attr('rx',2)
            .attr('ry',2)
            .on('click', (d, i)=>{
              if (d.target.className.baseVal==='full-block'){
                const id=d.target.id
                const rowIndex=_.split(id,'-')[1], lineIndex=_.split(id,'-')[2]
                if (rowIndex==='0'){
                  this.selectedPatientsData[index].show=1
                  this.drawDetailChart(res.data['time_block'][lineIndex]['context']['vitalPeriodic'], patient.id, this.options[this.selectedPatientsData[index].index1]['value'])

                  // console.log('vite',)
                }else {

                  this.selectedPatientsData[index].data= this.getContext(rowIndex, lineIndex, res.data)
                  this.selectedPatientsData[index].index2=parseInt(rowIndex)
                  this.selectedPatientsData[index].show=2
                }
              }
            })
        // let lineScale=d3.scaleLinear([0,100],[this.block.topSize-2/2, 0])
        // rectAppend.data(new Array(rowBlockCount*5))
        //     .enter()
        //     .append('rect')
        //     .attr('class', 'line')
        //     .attr('x',(d, index)=>{
        //       const lineIndex=getLineIndex(index)
        //       return lineIndex*this.block.size+(index%5)*(this.block.size/5)+(lineIndex-1)*this.block.blockMargin+3
        //     })
        //     .attr('y', ()=>{
        //       return lineScale(_.random(0,100))+1
        //     })
        //     .attr('height', 1)
        //     .attr('width', this.block.size/5)
        //     .attr('fill', '#6A7869')
      })

    },
    getContext(row, line, data){
      const propertiesList=['vitalPeriodic','lab','medication', 'infusiondrug', 'diagnosis','treatment']
      return data['time_block'][line]['context'][propertiesList[row]]
    },
    getContextLength(row, line, data){
      const propertiesList=['vitalPeriodic','lab','medication', 'infusiondrug', 'diagnosis','treatment']
      return data['time_block'][line]['context'][propertiesList[row]].length
    },
    getFillColor(row,line,data){
      const propertiesList=['vitalPeriodic','lab','medication', 'infusiondrug', 'diagnosis','treatment']

      if (data['time_block'][line]['context'][propertiesList[row]].length){

        return recordColor[row]
      }else {
        return '#f2f2f2'
      }
    },
    initChart(id,data){

    },
    addSelectedOption(index){
      // if(index>0){
      //   this.selected.currentState=0
      //
      // }else {
      //   this.$refs['side-button-'+index].setAttribute(
      //       'class',
      //       'bg-black'
      //   )
      //   console.log(this.$refs['side-button-0'])
      // }
      // console.log(index)
    }
  }
}
</script>

<template>
<!--  <TestComponent></TestComponent>-->
<!--  <div class="bg-amber-400" v-for="(i, index) in selectedPatients">{{index}}</div>-->
  <div class="h-full overflow-y-scroll overflow-y-hidden">
    <div v-for="(i, index) in selectedPatients">
      <a-card class="mb-2" size="small">
        <template #title>
          <div class="float-left">
            <a-space>
            <span class="font-bold">
            {{i.id}}
            </span>
            </a-space>
          </div>
        </template>
        <template #extra>
          <el-select @change="fetchDetail(index)" v-model="this.selectedPatientsData[index]['index1']" placeholder="生理指标" size="small">
            <el-option
                v-for="(item, index1) in options"
                :key="index1"
                :label="item.name"
                :value="index1"
            />
          </el-select>
        </template>
<!--          &lt;!&ndash;        <a-select&ndash;&gt;-->
<!--          &lt;!&ndash;            size="small"&ndash;&gt;-->
<!--          &lt;!&ndash;            v-model:value="form.cluster_method"&ndash;&gt;-->
<!--          &lt;!&ndash;            :options="options.map((i,k)=>{return{label:i,value:k}})"&ndash;&gt;-->
<!--          &lt;!&ndash;            style="width: 160px"&ndash;&gt;-->
<!--          &lt;!&ndash;        ></a-select>&ndash;&gt;-->
<!--          <a-button size="small" type="text" @click="goTop(i.id)">-->
<!--            <template #icon>-->
<!--              <VerticalAlignTopOutlined />-->
<!--            </template>-->
<!--          </a-button>-->
<!--          <a-button size="small" type="text" @click="goUp(i.id)">-->
<!--            <template #icon>-->
<!--              <ArrowUpOutlined />-->
<!--            </template>-->
<!--          </a-button>-->
<!--          <a-button size="small" type="text" @click="goDown(i.id)">-->
<!--            <template #icon>-->
<!--              <ArrowDownOutlined />-->
<!--            </template>-->
<!--          </a-button>-->
<!--          <a-button size="small" type="text" @click="goBottom(i.id)">-->
<!--            <template #icon>-->
<!--              <VerticalAlignBottomOutlined />-->
<!--            </template>-->
<!--          </a-button>-->
<!--          <span class="inline-block w-6"></span>-->
<!--          <a-button size="small" danger>-->
<!--            <template #icon>-->
<!--              <CloseOutlined />-->
<!--            </template>-->
<!--          </a-button>-->
<!--        </template>-->
        <div :id="'patient-record-container'+i.id" class="w-full h-40 relative overflow-x-hidden overflow-y-hidden" :ref="'scrollRef'+i.id" @scroll="handleScroll">
          <div @click="addSelectedOption(index)" v-for="(item, index) in sideButton.top" class="side-button absolute" :style="{top: item+'px',height:index===0?block.topSize+'px':block.size+'px','background-color': selected[index]?'#409eff':'#ecf5ff'}"></div>
        </div>
        <hr class="my-2 border-[#f0f0f0]" v-if="selectedPatientsData[index].show">
        <div :id="'patient-record-chart-container'+i.id" class="w-full h-40 relative" v-if="selectedPatientsData[index].show===1">
        </div>
<!--          {{selectedPatientsData[index]}}-->
<!--          <div class="w-full">-->
<!--            <el-checkbox-group v-model="checkedCities" :min="1" :max="2">-->
<!--              <el-checkbox v-for="city in cities" :key="city" :label="city">{{-->
<!--                  city-->
<!--                }}</el-checkbox>-->
<!--            </el-checkbox-group>-->
<!--          </div>-->
          <el-table height="160" size="small" :data="selectedPatientsData[index].data" v-if="selectedPatientsData[index].show===2&&selectedPatientsData[index].index2===1" style="width: 100%">
            <el-table-column sortable prop="offset" label="实验时间" />
            <el-table-column prop="labname" label="实验名称" />
            <el-table-column prop="labmeasurenameinterface" label="测量单位" />
            <el-table-column prop="labresult" label="实验结果" />
          </el-table>
          <el-table height="160" size="small" :data="selectedPatientsData[index].data" v-if="selectedPatientsData[index].show===2&&selectedPatientsData[index].index2===2" style="width: 100%">
            <el-table-column sortable prop="offset" label="开始时间" />
            <el-table-column prop="drugname" label="药物名称" />
            <el-table-column prop="dosage" label="剂量" />
            <el-table-column prop="frequency" label="频率" />
            <el-table-column prop="routeadmin" label="给药途径" />
            <el-table-column prop="drugstopoffset" label="结束时间" />
          </el-table>
          <el-table height="160" size="small" :data="selectedPatientsData[index].data" v-if="selectedPatientsData[index].show===2&&selectedPatientsData[index].index2===3" style="width: 100%">
            <el-table-column sortable prop="infusionoffset" label="开始时间" />
            <el-table-column prop="drugname" label="药物名称" />
            <el-table-column prop="drugrate" label="给药速率" />
            <el-table-column prop="drugamount" label="给药数量" />
            <el-table-column prop="volumeoffluid" label="输液液量" />
          </el-table>
          <el-table height="160" size="small" :data="selectedPatientsData[index].data" v-if="selectedPatientsData[index].show===2&&selectedPatientsData[index].index2===4" style="width: 100%">
            <el-table-column sortable prop="diagnosisoffset" label="诊断时间" />
            <el-table-column prop="diagnosispriority" label="诊断优先级" />
            <el-table-column prop="diagnosisstring" label="诊断信息" />
            <el-table-column prop="activeupondischarge" label="是否有效">
              <template #default="scope">
                <el-tag
                    :type="scope.row.activeupondischarge?'success':'warning'"
                    disable-transitions
                    size="small"
                >{{ scope.row.activeupondischarge?'有效':'无效' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-table height="160" size="small" :data="selectedPatientsData[index].data" v-if="selectedPatientsData[index].show===2&&selectedPatientsData[index].index2===5" style="width: 100%">
            <el-table-column sortable prop="treatmentoffset" label="治疗时间" />
            <el-table-column prop="treatmentstring" label="治疗信息" />
            <el-table-column prop="activeupondischarge" label="是否有效">
              <template #default="scope">
                <el-tag
                    :type="scope.row.activeupondischarge?'success':'warning'"
                    disable-transitions
                    size="small"
                >{{ scope.row.activeupondischarge?'有效':'无效' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
      </a-card>
    </div>
  </div>


<!--  <div class="border-black rounded-sm border-solid" >{{index}}</div>-->
<!--  <el-card v-for="(i, index) in selectedPatients" class="box-card" shadow="never" :body-style="{ padding: '10px' }">-->
<!--    <div class="flex-row">-->
<!--      <div class="float-left mt-2">-->
<!--        <span class="font-bold">{{i.id}}</span>-->
<!--        <span class="w-6 inline-block"></span>-->
<!--        <span>{{i.gender==='Male'?'男':'女'}}</span>-->
<!--        <span class="w-6 inline-block"></span>-->
<!--        <span>{{i.age}}</span>-->
<!--      </div>-->
<!--      <div>-->
<!--        <div class="float-right">-->

<!--          <span class="w-6 inline-block"></span>-->
<!--          <a-space>-->

<!--            <a-button>secondary</a-button>-->
<!--            <a-dropdown>-->
<!--              <template #overlay>-->
<!--                <a-menu @click="handleMenuClick">-->
<!--                  <a-menu-item key="1">1st item</a-menu-item>-->
<!--                  <a-menu-item key="2">2nd item</a-menu-item>-->
<!--                  <a-menu-item key="3">3rd item</a-menu-item>-->
<!--                </a-menu>-->
<!--              </template>-->
<!--              <a-button>-->
<!--                Actions-->
<!--                <DownOutlined />-->
<!--              </a-button>-->
<!--            </a-dropdown>-->
<!--          </a-space>-->
<!--          <span class="w-6 inline-block"></span>-->
<!--          <el-button size="small" type="danger" plain :icon="Close" />-->
<!--        </div>-->
<!--      </div>-->
<!--      </div>-->


<!--  </el-card>-->
</template>

<style scoped>
.side-button{
  width: 8px;
  left: 0;
  cursor: pointer;
}

</style>

<style>
#patient-record-svg{
  left: 12px;
  position: absolute;
}
.property-str{
  cursor: pointer;
}

.property-str:hover{
  fill:#409eff;
  text-decoration: underline;
}
</style>