let url = 'https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json'
let data = []
let originalData = []
let body = document.querySelector('tbody')
let areaFilter = document.querySelector('#area-filter')
let subIndex = 'YouBike2.0_'.length
let sareaArr = []
let area = '不拘'
let keyword = ''
let isHasBike = false

$('#app').click(function(){
    
})
window.onload = function(){
    getData()
    $('#area-filter').change(function(){
        area = $('#area-filter option:selected').text()
        filterData()
    })
    $('#station-filter').keyup(function(){
        keyword = this.value
        filterData()
    })
    $('.check-input').click(function(){
        isHasBike = $('.check-input').prop('checked')
        filterData()
    })
    $('.reload-text').click(function(){
        getData()
    })
    //一次只能有一個欄位在排序，所以點了某個排序，另外兩個排序的icon要變回無排序的狀態。
    $('.sort-icon').click(
        function(event){
            data = JSON.parse(JSON.stringify(originalData))
            Array.from($('.sort-icon')).forEach(x => {
                if(x !== event.target) resetIcon(x)
            })
            if($(this).attr('alt') === '排序圖標') {
                descIcon(event.target)
                data.sort(function(a, b) {
                    switch(event.target.id){
                        case 'sarea-sort': return b.sarea.localeCompare(a.sarea)
                        case 'sna-sort': return b.sna.localeCompare(a.sna)
                        case 'ar-sort': return b.ar.localeCompare(a.ar)
                    }
                })
            }
            else if($(this).attr('alt') === '遞減排序'){
                ascIcon(event.target)
                data.sort(function(a, b) {
                    switch(event.target.id){
                        case 'sarea-sort': return a.sarea.localeCompare(b.sarea)
                        case 'sna-sort': return a.sna.localeCompare(b.sna)
                        case 'ar-sort': return a.ar.localeCompare(b.ar)
                    }
                })
            }
            else if($(this).attr('alt') === '遞增排序'){
                resetIcon(event.target)
            }
            filterData()
        }        
    )
}


function getData(){
    axios.get(url)
    .then(res => {
        originalData = res.data.map(x => ({sarea: x.sarea,
            sna: x.sna.substring(subIndex),
            ar: x.ar,
            lat: x.lat.toString().split('.')[0] + '.' + x.lat.toString().split('.')[1].padEnd(6, '0'),
            lng: x.lng.toString().split('.')[0] + '.' + x.lng.toString().split('.')[1].padEnd(6, '0'),
            sbi: x.sbi,
            bemp: x.bemp,
            mday: x.mday})).sort((a, b) => b.sbi - a.sbi)
        data = JSON.parse(JSON.stringify(originalData))
        filterData()
        sareaArr = data.distinct()
        renderHeader(sareaArr)
    })
}
function renderTBody(data){
    body.innerHTML = ''
    data.forEach((row, index) => {
        let tr = document.createElement('tr')
        tr.setAttribute('title', `資料時間 : ${row.mday}`)
        tr.innerHTML = `<td class="numeric-data">${index + 1}</td>
        <td>${row.sarea}</td>
        <td>${row.sna}</td>
        <td>${row.ar}</td>
        <td>
            <div class="d-flex align-items-center pr-4">
                <a href="https://www.google.com.tw/maps/place/${row.lat},${row.lng}" target="_blank" class="mr-1 marker-link">
                    <img class="marker-pic" src="../location.jpg" alt="坐標">
                </a>
                <span class="coordinate-content">${row.lat}, ${row.lng}</span>
    
            </div>
        </td>
        <td class="numeric-data">${row.sbi}</td>
        <td class="numeric-data">${row.bemp}</td>`
        body.appendChild(tr)
    })   
}
function renderHeader(sareaArr){
    sareaArr.forEach(x => {
        let option = document.createElement('option')
        option.innerText = x
        areaFilter.appendChild(option)
    })
}
function renderFooter(data){
    let date = new Date()
    $('.data-count').text(`${data.length}`)
    $('.load-time').text(dayjs().format('YYYY-MM-DD HH:mm:ss'))
}
function filterData(){
    let result = data
    if(area !== '不拘') result = result.filter(x => x.sarea === area)
    if(keyword !== '') result = result.filter(x => (x.sna.includes(keyword) || x.ar.includes(keyword)))
    if(isHasBike) result = result.filter(x => x.sbi > 0)
    renderTBody(result)
    renderFooter(result)
}
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