import {defineStore} from "pinia";

export const useStore=defineStore('global_data', {
    state: ()=> {
        return {
            'scatter': [],
            'score':[],
            'selectedPatients':[],
            'similarity':[],
            'treemap':{},
            'center':-2
        }
    },
    actions: {
        setCenter(center){
            this.center=center
        },
        setScatter(scatter){
            this.scatter=scatter
        },
        setScore(score){
            this.score=score
        },
        setTreemap(treemap){
            this.treemap=treemap
        },
        setSimilarity(similarity){
            this.similarity=similarity
        },
        setSelectedPatients(selectedPatients){
            this.selectedPatients=selectedPatients
        }
    }
})