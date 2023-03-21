import sideBar from './component_layerGroup.js'
import editModal from './component_editModal.js'
const app = new Vue({
    el: '#app',
    data:{
        items:[],
        datas: [],
        fields:[
            {key:'id', label:''}, 
            {key:'name', label:'名稱'}, 
            {key:'category', label:'類別'}, 
            {key:'createTime', label:'建立時間'},
            {key:'action', label:'編輯'}
        ],
        checked:[],
        activeChild:{},
        hasNoData: false,
        createOrUpdate: '新增圖層',
        options: ['基礎', '警戒', '監測'],
        layer:{id: 0, name:'', groupId: 0, category:'', createTime:''},
        modalShow: false,
        layerList: null,
        currentGroup: 0
    },
    components: {
        'side-bar': sideBar,
        'edit-modal': editModal
    },
    created(){
        this.getData()
    },
    watch:{
        items:{
            handler: function(){
                if(this.items.length < 1) this.hasNoData = true
                else this.hasNoData = false
                this.checked = []
            }
        },
    },
    computed: {
        state() {
            return this.layer.name.length > 0
        },
        invalidFeedback() {
            return '請輸入圖層名稱'
        },
        selectState() {
            return this.layer.category.length > 0
        },
        selectInvalidFeedback() {
            return '請選擇圖層群組'
        },
        isValid(){
            return !this.state && !this.selectState
        },
        isChooseAll: {
            get(){
                if(this.items.length === 0) return false
                return this.checked.length === this.items.length
            },
            set(newVal){
                this.checked = []
                if(newVal){
                    this.items.forEach(x => {
                    this.checked.push(x.id)
                })}
            }
        },
        disabled(){
            return this.checked.length === 0
        },
        createDisabled(){
            return this.currentGroup === 0
        }
    },
    methods:{
        // 一次取得所有資料，並整理成一個陣列
        getData(){
            axios.all([this.getParentLayer(), this.getChildLayer(), this.getLayerList()])
                .then(axios.spread((parent, child, list) => {
                    this.datas = parent.data.map(x => ({
                        ...x, 
                        childList: child.data.filter(y => y.parentId === x.id)
                                            .map(item => ({
                                                ...item, 
                                                layerList: list.data.filter(layer => layer.groupId === item.id)
                                                                    .map(layer => ({...layer, createTime: dayjs(layer.createTime).format('YYYY/MM/DD HH:mm')}))}))
                    }))
                    this.layerList = list.data.map(layer => ({...layer, createTime: dayjs(layer.createTime).format('YYYY/MM/DD HH:mm')}))
                }))
                .catch(err => console.log(err))
        },
        getParentLayer(){
            return axios.get('./ParentLayerGroups.json')
        },
        getChildLayer(){
            return axios.get('./LayerGroups.json')
        },
        getLayerList(){
            return axios.get('./Layers.json')
        },
        showAccordion(event){
            let child = event.target.nextElementSibling
            if(child.classList.contains('show-child')){
                child.classList.remove('show-child')
                event.target.classList.remove('close-accordion-btn')
            }else{
                child.classList.add('show-child')
                event.target.classList.add('close-accordion-btn')
            }
        },
        showLayerList(list, event){
            this.items = list
            if(Object.keys(this.activeChild).length > 0){
                this.activeChild.target.classList.remove('active')
            }
            this.activeChild = event
            this.currentGroup = event.target.getAttribute('group-id')
            event.target.classList.add('active')
        },
        createLayer(){
            this.modalShow = true
            this.createOrUpdate = '新增圖層'
        },
        editLayer(row){
            this.modalShow = true
            // 深拷貝
            this.layer = JSON.parse(JSON.stringify(row.item))
            this.createOrUpdate = '編輯圖層'
        },
        cancelEdit(){
            this.modalShow = false
            this.layer = {id: 0, name:'', groupId:0, category:'', createTime:''}
        },
        confirmEdit(){
            this.modalShow = false
        },
        saveLayer(){
            this.modalShow = false
            if(this.layer.id === 0){
                //create
                this.create()
            }else{
                //edit
               this.edit()
            }
            this.layer = {id: 0, name:'', groupId:0, category:'', createTime:''}
            this.items = this.layerList.filter(x => x.groupId == this.currentGroup)
        },
        create(){
            this.layer.id = Math.max(...this.layerList.map(x => x.id)) + 1
            this.layer.groupId = this.currentGroup
            this.layer.createTime = dayjs().format('YYYY/MM/DD HH:mm')
            this.layerList.push(this.layer)
            // axios.post('./Layers.json', JSON.stringify(this.layerList))
            //     .then(res => {
            //         console.log(res)
            //     })
            //     .catch(err => {
            //         console.log(err)
            //     })
        },
        edit(){
            let index = this.layerList.findIndex(x => x.id === this.layer.id)
            this.layerList.splice(index, 1 , this.layer)
            // axios.patch(`./Layers.json/${this.layer.id}`, this.layer)
            //     .then(res => {
            //         console.log(res)
            //     })
            //     .catch(err => {
            //         console.log(err)
            //     })
        },
        deleteLayer(){
            this.layerList = this.layerList.filter(x => this.checked.indexOf(x.id) === -1 )
            this.checked = []
            this.items = this.layerList.filter(x => x.groupId == this.currentGroup)
        },
        updateModalShow(isShow){
            if(!isShow) {
                this.modalShow = isShow
            }
        }
    }
})