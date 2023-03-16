const stepOne = new Vue({
    el: '#app',
    data:{
        mainMarginTop: 0,
        cityDataUrl: 'https://gist.githubusercontent.com/mukiwu/50bccbe60f1e65660cfa12bec1d4a5f1/raw/84158f6228f3be81c46d028e6689bc3f53d59aa9/TwCities.json',
        cityList: [],
        townList: {},
        form: {
            name:'',
            citySelected: '',
            townSelected: '',
            sameAreaRadio:'',
            organizationType: '0',
            organizationName: '',
            address: '',
            taxId: ''
        },
        notext: '未填寫',
        projectName:{
            state: true,
            msg:'計畫名稱超過10個字',
            feedback:''
        },
        cityOption:{
            state: true,
            feedback:'未填寫'
        },
        townOption:{
            state: true,
            feedback:'未填寫'
        },
        sameArea:{
            state: true,
            feedback:'未填寫'
        },
        type:{
            state: true,
            feedback:'未填寫'
        },
        organizationName:{
            state: true,
            feedback:'未填寫'
        },
        address:{
            state: true,
            feedback:'未填寫'
        },
        taxId:{
            state: true,
            msg: '請填寫8碼數字',
            feedback:'未填寫'
        },

    },
    created(){
        this.getCity(),
        this.getData()
    },
    mounted(){
        this.updateMainMarginTop(); // 初始化
        window.addEventListener('resize', this.updateMainMarginTop) // 监听窗口大小变化
    },
    computed: {
        isVerify(){
            return this.projectName.state && this.cityOption.state && this.townOption.state && this.sameArea.state &&this.type.state && this.organizationName.state && this.address.state && this.taxId.state
        }

    },
    methods:{
        // 計算header高度
        updateMainMarginTop() {
            const headerHeight = this.$refs.header.offsetHeight
            this.mainMarginTop = headerHeight
        },
        getCity(){
            axios.get(this.cityDataUrl)
                .then(res => {
                    this.cityList = res.data.map(x => x.name)
                    res.data.forEach(x => {
                        this.townList[x.name] = x.districts.map(y => y.name)
                    })
                })
        },
        getData(){
            if(sessionStorage.getItem('organizationInfo')){
                this.form = JSON.parse(sessionStorage.getItem('organizationInfo'))
            }
        },
        verify(){
            sessionStorage.setItem('organizationInfo', JSON.stringify(this.form))
            // 驗證 計畫名稱
            if(this.form.name.length === 0){
                this.projectName.state = false
                this.projectName.feedback = this.notext
            }else if(this.form.name.length > 10){
                this.projectName.state = false
                this.projectName.feedback = this.projectName.msg
            }else{
                this.projectName.state = true
            }
            //  驗證 縣市
            this.form.citySelected.length === 0 ? this.cityOption.state = false : this.cityOption.state = true
            //  驗證 鄉鎮
            this.form.townSelected.length === 0 ? this.townOption.state = false : this.townOption.state = true
            //  驗證 是否同區
            this.form.sameAreaRadio.length === 0 ? this.sameArea.state = false : this.sameArea.state = true
            //  驗證 組織類別
            this.form.organizationType === '0' ? this.type.state = false : this.type.state = true
            //  驗證 組織名稱
            this.form.organizationName.length === 0 ? this.organizationName.state = false : this.organizationName.state = true
            //  驗證 地址
            this.form.address.length === 0 ? this.address.state = false : this.address.state = true
            //  驗證 統編
            let passwordReg = /^[0-9]{8}$/
            if(this.form.taxId.length === 0){
                this.taxId.state = false
                this.taxId.feedback = this.notext
            }else if(!passwordReg.test(this.form.taxId)){
                this.taxId.state = false
                this.taxId.feedback = this.taxId.msg
                console.log(this.taxId.feedback )
            }else{
                this.taxId.state = true
            }
            if(this.isVerify) location.href = './plan_info.html'
        }
    }
})