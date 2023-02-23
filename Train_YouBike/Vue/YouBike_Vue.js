let map
const app = new Vue({
    el: '#app',
    data:{
        url: 'https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json',
        data: [],
        originalData: [],
        subIndex: 'YouBike2.0_'.length,
        filter:{
            area:'不拘',
            keyword:'',
            isHasBike: false
        },
        sareaArr: [],
        updateTime:''
    },
    created(){
        this.getData()
    },
    mounted(){
       

    },
    watch:{
        filter:{
            deep: true,
            handler: 'filterData'
        }
    },
    methods:{
        getData(){
            axios.get(this.url)
            .then(res => {
                this.originalData = res.data.map(x => ({sarea: x.sarea,
                    sna: x.sna.substring(this.subIndex),
                    ar: x.ar,
                    lat: parseFloat(x.lat.toString().split('.')[0] + '.' + x.lat.toString().split('.')[1].padEnd(6, '0')),
                    lng: parseFloat(x.lng.toString().split('.')[0] + '.' + x.lng.toString().split('.')[1].padEnd(6, '0')),
                    sbi: x.sbi,
                    bemp: x.bemp,
                    mday: x.mday})).sort((a, b) => b.sbi - a.sbi)
                this.data = JSON.parse(JSON.stringify(this.originalData))
                this.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
                this.sareaArr = this.data.distinct()
                this.initMap()
                this.filterData()
                //設定popup
                this.renderMarker()
            })
        },
        filterData(){
            this.data = JSON.parse(JSON.stringify(this.originalData))
            if(this.filter.area !== '不拘') this.data = this.data.filter(x => x.sarea === this.filter.area)
            if(this.filter.keyword !== '') this.data = this.data.filter(x => (x.sna.includes(this.filter.keyword) || x.ar.includes(this.filter.keyword)))
            if(this.filter.isHasBike) this.data = this.data.filter(x => x.sbi > 0)
            this.setCenter()
        },
        setCenter(){
            map.setCenter({lat: this.data[0].lat, lng: this.data[0].lng})
            map.setZoom(18)
        },
        getLatlng(row){
            let latlng = {lat: row.lat, lng: row.lng}
            this.panTo(latlng)
        },
        panTo(latlng){
            map.panTo(latlng)
            map.setZoom(18)
        },
        initMap() {
            map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: this.data[0].lat, lng: this.data[0].lng },
                zoom: 18,
            })
        },
        renderMarker(){
            this.originalData.forEach(x => {
                const marker = new google.maps.Marker({
                    position: {lat: x.lat, lng: x.lng},
                    map: map,
                })
                let contentStr = `<div>
                                        <h3>${x.sna}</h3>
                                        <p>目前車輛數：${x.sbi}</p>
                                        <p>目前空位數：${x.bemp}</p>
                                    </div>`
                const infowindow = new google.maps.InfoWindow({
                    content: contentStr
                })
                marker.addListener('click', () => {
                    infowindow.open({
                        anchor: marker,
                        map
                    })
                })
            })
        },
    }
})

function descIcon(dom){
    dom.setAttribute('src', '../sort-desc.svg')
    dom.setAttribute('alt', '遞減排序')
}
function ascIcon(dom){
    dom.setAttribute('src', '../sort-asc.svg')
    dom.setAttribute('alt', '遞增排序')
}
function resetIcon(dom){
    dom.setAttribute('src', '../sort.svg')
    dom.setAttribute('alt', '排序圖標')
}
Array.prototype.distinct = function(){
    return this.reduce((a,b) => {
        if(!a.includes(b.sarea)) a.push(b.sarea)
        return a
    }, [])
}
function initMap() {} 
        


// window.initMap = initMap;