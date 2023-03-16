const dbName = 'TestDB'
const dbVersion = 1
let db
const app = new Vue({
    el:'#app',
    data() {return {
        mainMarginTop: 0,
        idbDataArr: [],
        uploadData:[
            {
                id: 'propoaslPlan',
                title: '提案計畫書',
                exampleUrl:'',
                showExample: true,
                file: null,
                name: '',
                url: '',
                date: '',
                isNeed: true
            },
            {
                id: 'spacePlan',
                title: '工作站空間規劃說明',
                exampleUrl:'../Content/Images/AA.jpeg',
                showExample: true,
                file: null,
                name: '',
                url: '',
                date: '',
                isNeed: true
            },
            {
                id: 'organizationDocument',
                title: '組織證明文件',
                exampleUrl:'../Content/Images/AA.jpeg',
                showExample: true,
                file: null,
                name: '',
                url: '',
                date: '',
                isNeed: true
            },
            {
                id: 'creditDocument',
                title: '信用證明文件',
                exampleUrl:'../Content/Images/AA.jpeg',
                showExample: true,
                file: null,
                name: '',
                url: '',
                date: '',
                isNeed: true
            },
            {
                id: 'taxless',
                title: '無欠稅證明文件',
                exampleUrl:'../Content/Images/AA.jpeg',
                showExample: true,
                file: null,
                name: '',
                url: '',
                date: '',
                isNeed: true
            },
            {
                id: 'hostDocument',
                title: '計畫主持人個人資料證明',
                exampleUrl:'../Content/Images/AA.jpeg',
                showExample: true,
                file: null,
                name: '',
                url: '',
                date: '',
                isNeed: true
            },
            {
                id: 'doPromise',
                title: '執行承諾書',
                exampleUrl:'../Content/Images/AA.jpeg',
                showExample: true,
                file: null,
                name: '',
                url: '',
                date: '',
                isNeed: true
            },
            {
                id: 'personalDataAgree',
                title: '個資同意書(所有參與人員均需簽署)',
                exampleUrl:'../Content/Images/AA.jpeg',
                showExample: true,
                file: null,
                name: '',
                url: '',
                date: '',
                isNeed: true
            },
            {
                id: 'identityExpose',
                title: '身分揭露表',
                exampleUrl:'../Content/Images/AA.jpeg',
                showExample: true,
                file: null,
                name: '',
                url: '',
                date: '',
                isNeed: true
            },
        ],
        unUploadMsg:[],
        dataCheckModal: false,
        dataConfirmModal: false,
        checked:[],
        checkItem:[
            { html: '我確認報名單位為<b>社團法人</b>，且上傳的<b>組織證明文件</b>中包含<b>立案證書</b>以及<b>法人登記證書</b>', value: '0', isNeed: true, type:'aggregateCorporation' },
            { html: '我確認除了<b>計畫主持人</b>外，另至少包含 <b>５ 位成員</b>', value: '1', isNeed: true },
            { html: '我確認 <b>５ 位成員</b>中，至少包含 <b>1 名專任人員</b>且<b>編滿 12 人月</b>', value: '2', isNeed: true },
            { html: '我確認 <b>５ 位成員</b>中，至少 <b>３ 位為 20 至 45 歲(含)青年</b>且其中 <b>1 位須具地方創生相關工作經驗兩年以上</b>，並於計畫書中陳述相關說明', value: '3', isNeed: true },
            { html: '我確認<b>計畫主持人</b>與<b>計畫成員</b>均為<b>本國籍</b>', value: '4', isNeed: true },
            { html: '我確認<b>計畫主持人</b>為<b> 45 歲(含)以下</b>之青年', value: '5', isNeed: true },
            { html: '我確認<b>計畫主持人</b>於<b>於規劃營運青年培力工作站的鄉鎮</b>蹲點 <b>５ 年以上</b>，並於計畫書中陳述相關說', value: '6', isNeed: true },
            { html: '我確認<b>經費編列合乎標準</b>且<b>各科目皆未超過上限</b>', value: '7', isNeed: true },
            { html: '我了解若有<b>缺件</b>或<b>格式不符</b>之情形，將<b>可能失去提案資格</b>', value: '8', isNeed: true },
            { html: '我確認<b>提交內容</b>正確無誤，<b>送出</b>後將<b>無法修改</b>', value: '9', isNeed: true },
        ]
    }},
    created(){
        this.setIsNeed()
        this.openDB()
        // window.addEventListener('unload', window.indexedDB.deleteDatabase(dbName))
    },
    mounted(){
        this.updateMainMarginTop(); // 初始化
        window.addEventListener('resize', this.updateMainMarginTop) // 监听窗口大小变化
    },
    computed:{
        NotAllAgree(){
            return this.checked.length !== this.checkItem.filter(x => x.isNeed === true).length
        }
    },
    watch:{
    },
    methods: {
        // 計算header高度
        updateMainMarginTop() {
            const headerHeight = this.$refs.header.offsetHeight
            this.mainMarginTop = headerHeight
        },
        setIsNeed(){
            // 判斷身分揭露表需不需要出現
            if(sessionStorage['planInfo']){
                let planInfo = JSON.parse(sessionStorage['planInfo'])
                if(planInfo.memberIdentity !== 'true') this.uploadData.find(x => x.id === 'identityExpose').isNeed = false
            }
            if(sessionStorage['organizationInfo']){
                let organizationInfo = JSON.parse(sessionStorage['organizationInfo'])
                // 判斷信用證明文件、無欠稅證明文件需不需要出現
                if(organizationInfo.organizationType === "1") {
                    this.uploadData.find(x => x.id === 'creditDocument').isNeed = false
                    this.uploadData.find(x => x.id === 'taxless').isNeed = false
                    this.checkItem.find(x => x.type === 'aggregateCorporation').isNeed = false
                }
            }
        },
        setData(index, event){
            let data = this.uploadData[index]
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                data.file = reader.result
                data.showExample = false
                data.url = window.URL.createObjectURL(file)
                data.name = file.name
                data.date = ` (${dayjs().format('YYYY/MM/DD HH:mm:ss')})`
                if(this.getDataFromIdb(data.id) !== null){
                    this.putDataToIdb(data)
                }else{
                    this.addDataToIdb(data)
                }
            })
            if(event.target.files[0] != null){
                reader.readAsDataURL(file)
            }
        },
        deletefile(index, id){
            let data = this.uploadData[index]
            data.file = null
            data.showExample = true
            data.url = ''
            data.name = ''
            data.date = ''
            this.deleteDataToIdb(id)
        },
        goBack(){
            location.href = '../Views/plan_info.html'
        },
        verify(){
            this.uploadData.forEach(f => {
                if(f.file === null && f.isNeed === true){
                    this.unUploadMsg.push(`【${f.title}】未上傳`)
                }
            })
            if(this.unUploadMsg.length > 0){
                this.dataCheckModal = true
            }else{
                this.dataConfirmModal = true
            }
        },
        closeCheckModal(){
            this.dataCheckModal = false
            this.dataConfirmModal = false
            this.unUploadMsg = []
            this.checked = []
        },
        addDataToIdb(file){
            let addRequest = db.transaction(["uploadFiles"], "readwrite")
                                .objectStore("uploadFiles")
                                .add(file)
            addRequest.onsuccess = e => {
                console.log('新增成功')
            }
            addRequest.onerror = e => {
                console.log('新增失敗', e)
            }
        },
        putDataToIdb(file){
            let putRequest = db.transaction(["uploadFiles"], "readwrite")
                                .objectStore("uploadFiles")
                                .put(file)
            putRequest.onsuccess = e => {
                console.log('修改成功')
            }
            putRequest.onerror = e => {
                console.log('修改失敗')
            }
        },
        deleteDataToIdb(id){
            let deleteRequest = db.transaction(["uploadFiles"], "readwrite")
                                .objectStore("uploadFiles")
                                .delete(id)
            deleteRequest.onsuccess = function(event) {
                console.log('刪除成功')
            }
            deleteRequest.onerror = function(event){
                console.log('刪除失敗')
            }
        },
        getDataFromIdb(id){
            let getRequest = db.transaction(["uploadFiles"], "readwrite")
                                .objectStore("uploadFiles")
                                .get(id)
            getRequest.onsuccess = function(event) {
                return event.target.result
            }
            getRequest.onerror = function(event){
                console.log('something wrong')
            }
        },
        openDB(){
            let request = window.indexedDB.open(dbName, dbVersion)
            request.onerror = e => {
                console.log('打開資料庫出現錯誤', e)
            }
            request.onsuccess = e => {
                db = e.target.result
                 
                let getRequest = db.transaction(["uploadFiles"], "readwrite")
                                .objectStore("uploadFiles")
                                .getAll()
                getRequest.onsuccess = this.handleSuccess.bind(this)
            }
            request.onupgradeneeded = e => {
                db = e.target.result
                db.createObjectStore("uploadFiles", { keyPath:'id'})
                console.log('建立資料表成功')
            }
        },
        handleSuccess(event){
            this.idbDataArr = event.target.result
            this.idbDataArr.forEach(item => {
                const dataUrl = item.file
                // 將 Blob URL (dataURL) 轉回到 Blob
                let url = this.getBlob(item.file)
                let index = this.uploadData.findIndex(x => x.id === item.id)
                this.$set(this.uploadData, index, item)
                this.$set(this.uploadData[index], 'url', url)
            })
        },
        getBlob(dataUrl){
            // 將 Data URL 轉換為 ArrayBuffer 格式
            const byteString = atob(dataUrl.split(',')[1])
            const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]
            const byteArray = new Uint8Array(byteString.length)
            for (let i = 0; i < byteString.length; i++) {
                byteArray[i] = byteString.charCodeAt(i)
            }
            const arrayBuffer = byteArray.buffer
        
            // 將 ArrayBuffer 轉換為 Blob 物件
            const blob = new Blob([arrayBuffer], { type: mimeString })
        
            // 建立 URL
            return URL.createObjectURL(blob)
        },
        complete(){
            location.href = '../Views/complete.html'
            window.indexedDB.deleteDatabase(dbName)
            sessionStorage.removeItem('planInfo')
            sessionStorage.removeItem('organizationInfo')
        }
    }
})