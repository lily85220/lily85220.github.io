const app = new Vue({
    el:'#app',
    data: {
        slide: 0,
        sliding: null,
        checked: [],
        isActive: 'timeout',
        showCheckbox: true
    },
    created(){
        this.disableBtn()
    },
    watch:{
        checked:{
            handler:function(){
                if(this.checked.length === 3){
                    this.isActive = 'ontime'
                }else{
                    this.isActive = 'timeout'
                }
            }
        }
    },
    methods: {
        onSlideStart(slide) {
            this.sliding = true
        },
        onSlideEnd(slide) {
            this.sliding = false
        },
        isOnTime(){
            let time = new Date().getHours()
            return time >= 9 && time < 17
        },
        disableBtn(){
            if(!this.isOnTime()){
                this.showCheckbox = false
                this.isActive = 'timeout'
            }
        },
        goApply(){
            if(!this.isOnTime()){
                alert('現在不是系統開放的報名時間，明天請早，早起的蟲兒被鳥吃')
                return
            }
            location.href = './organization.html'
        }
    }
})

