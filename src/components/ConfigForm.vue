<script>
import axios from "axios";
import {useStore} from "../store/store.js";
import {ElLoading, ElMessage} from "element-plus";
import _ from 'lodash'

export default {
  name: "ConfigForm",
  data(){
    return{


      radio:[0,1,2,3],
      checkAll: true,
      isIndeterminate: false,
      slideValue: 6,
      loading:false,

    }
  },
  mounted() {
    const store=useStore()

    axios.post('/api/cluster', this.form).then(res=>{
      // console.log(res)
      store.setScatter(_.pick(res.data, ['center', 'point']))
      store.setScore(res.data['cluster_score'])
      store.setSimilarity(res.data['similarity'])
      axios.post('/api/tree_map', {'cluster_index': -1}).then(res=>{
        // console.log('treemap', res)
      })
    })

  },
  methods:{
    onSubmit(){
      if (this.form.impact.length===0){
        ElMessage.error('请至少选择一个影响因素')
        return
      }
      this.loading=true
      axios.post('api/cluster',this.form).then(res=>{
        this.loading=false
        store.setScatter(_.pick(res.data, ['center', 'point']))
      })
    }
  }
}
</script>

<template>
  <el-form size="small">
    <el-form-item>

      <span class="w-6 inline-block"></span>
    </el-form-item>
    <el-form-item>

      <span class="w-6 inline-block"></span>
      <el-button size="small" type="primary" plain @click="onSubmit" :loading="loading">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>

</style>