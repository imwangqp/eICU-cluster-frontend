<script>
import axios from "axios";
import * as d3 from "d3";
import {useStore} from "../store/store.js";
import {watch} from "vue";
import _ from 'lodash';
import {GlobalColorList, tableColorList} from "../utils/global.js";
// import patient from '/public/main_patient.json'

export default {
  name: "DataTable",
  data(){
    return{
      patients: [],
      extremeValue: {
        actualHospitalLos:10,
        actualIcuLos:10,
        predictHospitalLos:10,
        predictIcuLos:10,
        predictedHospitalMortality:10,
        predictedIcuMortality:10
      },
      dialogVisible:false,
      dialog:{
        data:[],
        title:''
      },
      tableHeight:0,
      loading:false
    }
  },
  mounted() {
    const store=useStore()
    this.tableHeight=this.$refs['table-container'].offsetHeight
    watch(()=>store.center, (id)=>{
      if (id>=0){
        this.loading=true
        // console.log()
        axios.post('/api/fetch_patients_by_id', {'patients_id': _.filter(store.scatter['point'],['cluster_id', id]).map(i=>String(i['id']))}).then(res=>{
          // console.log(res)
          this.loading=false
          this.patients=res.data.patient
          this.setExtremeValue(this.patients)
          this.$nextTick(()=>{
            _.forEach(this.patients,p=>{
              this.drawLOSRect(p)
              this.drawMoralityRect(p)
            })
          })
        })
      }

    })
    // patient.map(d=>String(d.patientunitstayid))

  },
  methods:{
    processContentString(contentString){
      // console.log(contentString, _.split(contentString,'|'))
      return _.split(contentString,'|').map((item, key)=>{
        return key*'  '+item
      })
    },
    setExtremeValue(data){
      this.extremeValue.actualHospitalLos=d3.max(data,d=>d.LOS.actualhospitallos)
      this.extremeValue.actualIcuLos=d3.max(data,d=>d.LOS.actualiculos)
      this.extremeValue.predictHospitalLos=d3.max(data,d=>d.LOS.predictedhospitallos)
      this.extremeValue.predictIcuLos=d3.max(data,d=>d.LOS.predictediculos)
      this.extremeValue.predictedHospitalMortality=d3.max(data,d=>d.morality.predictedhospitalmortality)
      this.extremeValue.predictedIcuMortality=d3.max(data,d=>d.morality.predictedicumortality)
    },
    drawMoralityRect(data){
      const width=document.getElementById('Mortality-bar-container'+data.id).offsetWidth,
          height=32
      let svg=d3.select('#Mortality-bar-container'+data.id)
          .append('svg')
          .attr('width', width)
          .attr('height', height)

      let rectAppend=svg.append('g')
      let rectAppend1=svg.append('g')
      const xScale=d3.scaleLinear()
          .domain([0, d3.max([0.01,this.extremeValue.predictedIcuMortality])])
          .range([0, width])

      const colorScale1=d3.scaleSqrt()
          .domain([0, this.extremeValue.predictedIcuMortality])
          .range(['#ffffff00', tableColorList[2]])

      rectAppend.append('rect')
          .attr('x',0)
          .attr('y',height/2)
          .attr('width', width)
          .attr('height', height/2)
          .style('fill', ()=>{
            switch (data['morality']['actualicumortality']){
              case 'ALIVE':
                return tableColorList[3]
              case 'EXPIRE':
                return tableColorList[4]
              default:
                return tableColorList[5]
            }
          })

      rectAppend.append('text')
          .attr('x',width/2)
          .attr('y',height/4*3)
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'middle')
          .attr('font-size', 8)
          .text(()=>{
            // console.log(data['morality']['actualicumortality'])
            if (data['morality']['actualicumortality']===0){
              return 'UNKNOWN'
            }else {
              return data['morality']['actualicumortality']
            }
          })

      rectAppend1.selectAll('rect')
          .data([data.morality.predictedicumortality])
          .enter()
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', d=>{
            if(d>=0){
              return xScale(d)
            }else if (d===-1) {
              return 0
            }
          })
          .attr('height', height/2)
          .style('fill', (d)=>colorScale1(d))

    },
    drawLOSRect(data){
      const width=document.getElementById('LOS-bar-container'+data.id).offsetWidth,
          height=32

      let svg=d3.select('#LOS-bar-container'+data.id)
          .append('svg')
          .attr('width', width)
          .attr('height', height)

      let rectAppend=svg.append('g')
      const xScale=d3.scaleLinear()
          .domain([0, d3.max([this.extremeValue.actualHospitalLos, this.extremeValue.actualIcuLos, this.extremeValue.predictHospitalLos, this.extremeValue.predictIcuLos])])
          .range([0, width])

      const colorScale1=d3.scaleSqrt()
          .domain([0, d3.max([this.extremeValue.actualHospitalLos, this.extremeValue.actualIcuLos, this.extremeValue.predictHospitalLos, this.extremeValue.predictIcuLos])])
          .range(['#ffffff00', tableColorList[0]])
      const colorScale2=d3.scaleSqrt()
          .domain([0, d3.max([this.extremeValue.actualHospitalLos, this.extremeValue.actualIcuLos, this.extremeValue.predictHospitalLos, this.extremeValue.predictIcuLos])])
          .range(['#ffffff00', tableColorList[1]])
      rectAppend.selectAll('rect')
          .data([data.LOS.predictediculos,data.LOS.actualiculos])
          .enter()
          .append('rect')
          .attr('x',0)
          .attr('y', (d, i)=>i*(height/2))
          .attr('width', d=>{
            if(d>=0){
              return xScale(d)
            }else if (d===-1) {
              return 0
            }
          })
          .attr('height', height/2)
          .style('fill', (d,i)=>i===0?colorScale1(d):colorScale2(d))
    },
    handleSelectionChange(e){
      const store=useStore()
      store.setSelectedPatients(e)
      // console.log(e)
    },
    showDialog(i, data){
      this.dialogVisible=true
      switch (i) {
        case 0: {
          this.dialog.data=data.pastHistory
          this.dialog.title='病史'
          break
        }
        case 1: {
          this.dialog.data=data.diagnosis
          this.dialog.title='诊断结果'
          break
        }
        case 2: {
          this.dialog.data=data.treatment
          this.dialog.title='治疗方案'
          break
        }
      }
    }
  }
}
</script>

<template>
  <div class="h-full w-full" ref="table-container" >
    <el-table v-loading="loading" :height="tableHeight" empty-text="无" :data="patients" style="width: 100%" @selection-change="handleSelectionChange" size="small" table-layout="auto">
      <el-table-column type="selection" width="55" />
      <el-table-column type="expand">
        <template #default="props">
          <div>
            <el-descriptions column="4" size="small" border>
              <el-descriptions-item label="入院时间">
                {{props.row.unitadmittime24}}
              </el-descriptions-item>
              <el-descriptions-item label="出院时间">
                {{props.row.unitdischargetime24}}
              </el-descriptions-item>
              <el-descriptions-item span="2" label="入院类型">
                {{props.row.unittype}}
              </el-descriptions-item>
              <el-descriptions-item label="预测住院时长">
                {{props.row['LOS']['predictedhospitallos'].toFixed(3)+' 天'}}
              </el-descriptions-item>
              <el-descriptions-item label="实际住院时长">
                {{props.row['LOS']['actualhospitallos'].toFixed(3)+' 天'}}
              </el-descriptions-item>
              <el-descriptions-item label="预测ICU时长">
                {{props.row['LOS']['predictediculos'].toFixed(3)+' 天'}}
              </el-descriptions-item>
              <el-descriptions-item label="实际ICU时长">
                {{props.row['LOS']['actualiculos'].toFixed(3)+' 天'}}
              </el-descriptions-item>data.patients[0].morality.
              <el-descriptions-item label="预测住院死亡率">
                {{(props.row['morality']['predictedhospitalmortality']*100).toFixed(3)+'%'}}
              </el-descriptions-item>
              <el-descriptions-item label="实际住院死亡情况">
                <a-tag color="green" v-if="props.row['morality']['actualhospitalmortality']==='ALIVE'">{{props.row['morality']['actualhospitalmortality']}}</a-tag>
                <a-tag color="green" v-if="props.row['morality']['actualicumortality']==='EXPIRED'">{{props.row['morality']['actualicumortality']}}</a-tag>
                <a-tag v-if="props.row['morality']['actualhospitalmortality']==='0'">UNKNOWN</a-tag>
              </el-descriptions-item>
              <el-descriptions-item label="预测ICU死亡率">
                {{(props.row['morality']['predictedicumortality']*100).toFixed(3)+'%'}}
              </el-descriptions-item>
              <el-descriptions-item label="实际ICU死亡情况">
                <a-tag color="green" v-if="props.row['morality']['actualicumortality']==='ALIVE'">{{props.row['morality']['actualicumortality']}}</a-tag>
                <a-tag color="green" v-if="props.row['morality']['actualicumortality']==='EXPIRED'">{{props.row['morality']['actualicumortality']}}</a-tag>
                <a-tag v-if="props.row['morality']['actualicumortality']==='0'">UNKNOWN</a-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="110" prop="id" label="ID" />
      <el-table-column width="55" prop="age" label="年龄" />
      <el-table-column prop="gender" label="性别">
        <template #default="scope">
          <el-tag
              :type="scope.row.gender==='Male'?'primary':'danger'"
              disable-transitions
              size="small"
          >{{ scope.row.gender==='Male'?'男':'女' }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column width="55" prop="admissionheight" label="身高" />
      <el-table-column width="55" prop="admissionweight" label="体重" />
      <el-table-column width="55" prop="unitdischargeoffset" label="入院时长" />
      <el-table-column width="55" prop="apachescore" label="APACHE评分" />
      <!--    <el-table-column width="110" prop="dischargeTime" label="出院时间" />-->
      <el-table-column label="预测icu时长">
        <template #default="scope">
          <div class="w-full h-8" :id="'LOS-bar-container'+scope.row.id"></div>
        </template>
      </el-table-column>
      <el-table-column label="死亡率">
        <template #default="scope">
          <div class="w-full h-8" :id="'Mortality-bar-container'+scope.row.id"></div>
        </template>
      </el-table-column>
    </el-table>

  </div>
  <el-dialog v-model="dialogVisible" :title="dialog.title">
    <el-table :data="dialog.data" v-if="dialog.title==='病史'">
      <el-table-column property="pasthistoryid" label="ID" />
      <el-table-column property="pasthistoryoffset" label="时间" />
      <el-table-column property="pasthistoryvalue" label="内容" />
    </el-table>
    <el-table :data="dialog.data" v-if="dialog.title==='诊断结果'">
      <el-table-column property="diagnosisid" label="ID" />
      <el-table-column property="diagnosisoffset" label="时间" />
      <el-table-column label="内容">
        <template #default="scope">
          {{processContentString(scope.row.diagnosisstring)}}
        </template>
      </el-table-column>
      <el-table-column label="是否有效">
        <template #default="scope">
          <el-tag
              :type="scope.row.activeupondischarge?'success':'warning'"
              disable-transitions
              size="small"
          >{{ scope.row.activeupondischarge?'有效':'无效' }}</el-tag
          >
        </template>
      </el-table-column>
    </el-table>
    <el-table :data="dialog.data" v-if="dialog.title==='治疗方案'">
      <el-table-column property="treatmentid" label="ID" />
      <el-table-column property="treatmentoffset" label="时间" />
      <el-table-column label="内容">
        <template #default="scope">
          <el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick" />
        </template>
      </el-table-column>
      <el-table-column label="是否有效">
        <template #default="scope">
          <el-tag
              :type="scope.row.activeupondischarge?'success':'warning'"
              disable-transitions
              size="small"
          >{{ scope.row.activeupondischarge?'有效':'无效' }}</el-tag
          >
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<style scoped>

</style>