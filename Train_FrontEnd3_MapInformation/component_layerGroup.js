export default{
    props:['datas'],
    methods:{
        showAccordion(event){
            this.$emit('show-accordion', event)
        },
        showLayerList(list, event){
            this.$emit('show-layer-list', list, event)
        }
    },
    template: 
    `<ul class="layer-parent">
        <li v-for="group in datas">
            <div class="layer-btn" @click="showAccordion">
                {{group.name}}
            </div>
            <ul class="layer-child">
                <li v-for="child in group.childList" :group-id="child.id" @click="showLayerList(child.layerList, $event)">{{child.name}}</li>
            </ul>
        </li>
    </ul>`
}