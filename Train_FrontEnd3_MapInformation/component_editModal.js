export default{
    props:['modalShow', 'createOrUpdate', 'invalidFeedback', 'state', 'selectInvalidFeedback', 'selectState', 'layer', 'options', 'isValid'],
    data(){
        return{
            sonModalShow: false
        }
    },
    watch:{
        modalShow(){
            this.sonModalShow = this.modalShow
        }
    },
    methods:{
        saveLayer(){
            this.$emit('save-layer')
        },
        cancelEdit(){
            this.$emit('cancel-edit')
        }
    },
    template:`
    <b-modal v-model="sonModalShow" id="my-modal" :title="createOrUpdate">
        <b-form-group
            label="圖層名稱"
            label-for="layer-name"
            :invalid-feedback="invalidFeedback"
            :state="state"
            >
            <b-form-input id="layer-name" v-model="layer.name" trim></b-form-input>
        </b-form-group>
        <b-form-group
            label="圖層群組"
            label-for="layer-name"
            :invalid-feedback="selectInvalidFeedback"
            :state="selectState"
            >
            <b-form-select v-model="layer.category" :options="options"></b-form-select>
        </b-form-group>
        <template #modal-footer>
            <b-button
                variant="warning"
                size="sm"
                class="float-right"
                @click="saveLayer"
                :disabled="isValid"
            >確認
            </b-button>
            <b-button
                variant="danger"
                size="sm"
                class="float-right"
                @click="cancelEdit"
            >取消
            </b-button>
        </template>
    </b-modal>`
}