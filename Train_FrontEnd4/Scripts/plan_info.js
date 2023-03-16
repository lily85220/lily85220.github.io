const stepOne = new Vue({
    el: '#app',
    data:{
        mainMarginTop: 0,
        cityDataUrl: 'https://gist.githubusercontent.com/mukiwu/50bccbe60f1e65660cfa12bec1d4a5f1/raw/84158f6228f3be81c46d028e6689bc3f53d59aa9/TwCities.json',
        cityList: [],
        townList: {},
        form: {
            hostName:'',
            hostTitle: '',
            hostEmail: '',
            hostPhone: '',
            hostSex:'',
            hostIdentity:'',
            contactName:'',
            contactEmail: '',
            contactPhone: '',
            maleAmount: '',
            femaleAmount: '',
            memberIdentity: '',
            planSummary: '',
            subsidy: '',
            selfpreparation: '',
        },
        notext: '未填寫',
        state:{
            hostName: true,
            hostTitle: true,
            hostEmail: true,
            hostPhone: true,
            hostSex: true,
            hostIdentity: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
            maleAmount: true,
            femaleAmount: true,
            memberIdentity: true,
            planSummary: true,
            subsidy: true,
            selfpreparation: true,
        },
        msg:{
            emailErr:'請輸入正確之Email格式',
            phoneErr:'請輸入10碼數字',
            amountErr:'本案計畫主持人以外參與人數至少5位',
            numErr: '請填寫人數，若無請填0',
            planErr: '計畫摘要需超過10個字',
            subsidyErr: '請填寫3,000,000以下金額',
            selfpreparationErr: '請填寫金額，若無請填0',
        },
        feedback:{
            hostName:'未填寫',
            hostTitle:'未填寫',
            hostEmail:'未填寫',
            hostPhone:'未填寫',
            hostSex:'未填寫',
            hostIdentity:'未填寫',
            contactName:'未填寫',            
            contactEmail:'未填寫',
            contactPhone:'',
            maleAmount:'未填寫',
            femaleAmount:'未填寫',
            memberIdentity:'未填寫',
            planSummary:'未填寫',
            subsidy:'未填寫',
            selfpreparation:'未填寫',
        },
        
    },
    created(){
        this.getData()
    },
    mounted(){
        this.updateMainMarginTop(); // 初始化
        window.addEventListener('resize', this.updateMainMarginTop) // 监听窗口大小变化
    },
    watch:{
        'form.organizationType'(){
            sessionStorage.setItem('organizationType', this.form.organizationType)
        },
        'form.subsidy'(){
            // this.form.subsidy = parseInt(this.form.subsidy, 10).toLocaleString('en-US')
        }
    },
    computed: {
        isVerify(){
            for(let key in this.state){
                if(!this.state[key]) return false
            }
            return true
        },
        memberCalc(){
            return parseInt(this.form.maleAmount, 10) + parseInt(this.form.femaleAmount, 10) - 1 // 扣掉主持人
        },
        formattedSubsidy:{
            get(){
                let formatNum = parseInt(this.form.subsidy, 10).toLocaleString('en-US')
                if(!isNaN(Number(formatNum.replace(/,/g, '')))){
                    return formatNum
                }
                else{
                    return this.form.subsidy
                }
            },
            set(newVal){
                let originalValue = Number(newVal.replace(/,/g, ''))
                if(!isNaN(originalValue)){
                    this.form.subsidy = originalValue
                }else{
                    console.log('set')
                    this.form.subsidy = newVal.replace(/,/g, '')
                }
            }
        },
        formattedSelfpreparation:{
            get(){
                let formatNum = parseInt(this.form.selfpreparation, 10).toLocaleString('en-US')
                if(!isNaN(Number(formatNum.replace(/,/g, '')))){
                    return formatNum
                }
                else{
                    return this.form.selfpreparation
                }
            },
            set(newVal){
                let originalValue = Number(newVal.replace(/,/g, ''))
                if(!isNaN(originalValue)){
                    this.form.selfpreparation = originalValue
                }else{
                    console.log('set')
                    this.form.selfpreparation = newVal.replace(/,/g, '')
                }
            }
        },
    },
    methods:{
        // 計算header高度
        updateMainMarginTop() {
            const headerHeight = this.$refs.header.offsetHeight
            this.mainMarginTop = headerHeight
        },
        getData(){
            if(sessionStorage.getItem('planInfo')){
                this.form = JSON.parse(sessionStorage.getItem('planInfo'))
            }
        },
        verify(){
            sessionStorage.setItem('planInfo', JSON.stringify(this.form))
            //  驗證 主持人名字
            this.state.hostName = !this.verifyIsEmpty(this.form.hostName)
            //  驗證 職稱
            this.state.hostTitle = !this.verifyIsEmpty(this.form.hostTitle)
            //  驗證 主持人信箱
            let emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/
            let hostEmailResult = this.verifyReg(emailReg, this.form.hostEmail, this.msg.emailErr)
            this.state.hostEmail = hostEmailResult.state
            this.feedback.hostEmail = hostEmailResult.feedback
            //  驗證 主持人手機
            let phoneReg = /^[0-9]{10}$/
            let hostPhoneResult = this.verifyReg(phoneReg, this.form.hostPhone, this.msg.phoneErr)
            this.state.hostPhone = hostPhoneResult.state
            this.feedback.hostPhone = hostPhoneResult.feedback
            //  驗證 主持人性別
            this.state.hostSex = !this.verifyIsEmpty(this.form.hostSex)
            //  驗證 主持人身分
            this.state.hostIdentity = !this.verifyIsEmpty(this.form.hostIdentity)
            //  驗證 聯絡人名字
            this.state.contactName = !this.verifyIsEmpty(this.form.contactName)
            //  驗證 聯絡人信箱
            let contactEmailResult = this.verifyReg(emailReg, this.form.contactEmail, this.msg.emailErr)
            this.state.contactEmail = contactEmailResult.state
            this.feedback.contactEmail = contactEmailResult.feedback
            //  驗證 聯絡人手機
            let contactPhoneResult = this.verifyReg(phoneReg, this.form.contactPhone, this.msg.phoneErr)
            this.state.contactPhone = contactPhoneResult.state
            this.feedback.contactPhone = contactPhoneResult.feedback
            //  驗證 團隊成員
            this.state.maleAmount = false
            if(isNaN(parseInt(this.form.maleAmount, 10))){
                this.feedback.maleAmount = this.msg.numErr
            }else if(this.memberCalc < 5 || isNaN(this.memberCalc)){
                this.feedback.maleAmount = this.msg.amountErr
            }else{
                this.state.maleAmount = true
            }
            //  驗證 團隊成員
            this.state.femaleAmount = false
            if(isNaN(parseInt(this.form.femaleAmount, 10))){
                this.feedback.femaleAmount = this.msg.numErr
            }else if(this.memberCalc < 5 || isNaN(this.memberCalc)){
                this.feedback.femaleAmount = this.msg.amountErr
            }else{
                this.state.femaleAmount = true
            }
            //  驗證 成員身分
            this.state.memberIdentity = !this.verifyIsEmpty(this.form.memberIdentity)
            //  驗證計畫摘要
            if(this.form.planSummary.length === 0){
                this.state.planSummary = false
                this.feedback.planSummary = this.notext
            }else if(this.form.planSummary.length < 10){
                this.state.planSummary = false
                this.feedback.planSummary = this.msg.planErr
            }else{
                this.state.planSummary = true
            }
            //  驗證 補助
            if(this.form.subsidy.length === 0){
                this.state.subsidy = false
                this.feedback.subsidy = this.notext
            }else if(isNaN(this.form.subsidy) || parseInt(this.form.subsidy, 10) > 3000000){
                this.state.subsidy = false
                this.feedback.subsidy = this.msg.subsidyErr
            }else{
                this.state.subsidy = true
            }
            //  驗證 自備款
            if(this.form.selfpreparation.length === 0){
                this.state.selfpreparation = false
                this.feedback.selfpreparation = this.notext
            }else if(isNaN(this.form.selfpreparation)){
                this.state.selfpreparation = false
                this.feedback.selfpreparation = this.msg.selfpreparationErr
            }else{
                this.state.selfpreparation = true
            }
            if(this.isVerify){
                location.href = '../Views/upload.html'
            }
        },
        verifyReg(reg, input, msg){
            let result = {}
            result.state = false
            if(input.length === 0){
                result.feedback = this.notext
            }else if(!reg.test(input)){
                result.feedback = msg
            }else{
                result.state = true
            }
            return result
        },
        verifyIsEmpty(input){
            return input.length === 0
        },
        goBack(){
            sessionStorage.setItem('planInfo', JSON.stringify(this.form))
            location.href = './organization.html'
        }
    }
})