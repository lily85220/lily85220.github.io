import proj4 from 'proj4'
import Map from "@arcgis/core/Map.js"
import MapView from "@arcgis/core/views/MapView.js"
import SceneView from "@arcgis/core/views/SceneView.js"
import Home from "@arcgis/core/widgets/Home.js"
import ScaleBar from "@arcgis/core/widgets/ScaleBar.js"
import MapImageLayer from "@arcgis/core/layers/MapImageLayer.js"
import WebTileLayer from "@arcgis/core/layers/WebTileLayer.js"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js"
import WMSLayer from "@arcgis/core/layers/WMSLayer.js"
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js"
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js"
import Graphic from "@arcgis/core/Graphic.js"
import Popup from "@arcgis/core/widgets/Popup.js"
import Query from "@arcgis/core/rest/support/Query.js"
import * as identify from "@arcgis/core/rest/identify.js"
import * as query from "@arcgis/core/rest/query.js"
import IdentifyParameters from "@arcgis/core/rest/support/IdentifyParameters.js"
import dayjs from 'dayjs'
import axios from 'axios'
import {convertXML} from 'simple-xml-to-json'
import 'dayjs/locale/zh-cn'
import './style.css'
dayjs.locale('zh-cn')
const layerToggle = document.querySelector('#layerToggle')
const countySelect = document.querySelector('#countySelect')
const sketchBtnArr = Array.from(document.querySelectorAll('.geometry-button'))
const countyUrl = 'https://richimap1.richitech.com.tw/arcgis/rest/services/CBB_Practice/CBB_Practice_Town_84/MapServer'
const gasStationUrl = 'https://richimap1.richitech.com.tw/arcgis/rest/services/CBB_Practice/CBB_Practice_POI/MapServer/1'
const hotelUrl = 'https://richimap1.richitech.com.tw/arcgis/rest/services/CBB_Practice/CBB_Practice_POI/MapServer/0'
const industryUrl = 'https://richimap1.richitech.com.tw/arcgis/services/CBB_Practice/CBB_Practice_Industry_84/MapServer/WMSServer?request=GetCapabilities&service=WMS'
const roadUrl = 'https://wmts.nlsc.gov.tw/wmts/EMAP2/default/GoogleMapsCompatible/{level}/{row}/{col}'
const earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
const countyListUrl = 'https://api.nlsc.gov.tw/other/ListCounty'
const queryUrl = 'https://richimap1.richitech.com.tw/arcgis/rest/services/CBB_Practice/CBB_Practice_County_84/MapServer/0'
const identifyUrl = 'https://richimap1.richitech.com.tw/arcgis/rest/services/CBB_Practice/CBB_Practice_Town_84/MapServer'
let countyList
// 建立地圖
const map = new Map({
    basemap: 'satellite'
})
const view = new MapView({
    container: 'viewDiv',
    map: map,
    zoom: 7,
    center: [121, 23.5],
})
// 首頁按鈕
const homeBtn = new Home({
    view: view
})
// 比例尺
const scaleBar = new ScaleBar({
    view: view,
    container: document.querySelector('#scaliDiv'),
    unit: "dual" // The scale bar displays both metric and non-metric units.
})
// WebTileLayer
const roadLayer = new WebTileLayer({
    urlTemplate : roadUrl
})
// MapImageLayer
const countyLayer = new MapImageLayer({
    url: countyUrl,
    sublayers: [
        {id: 0}
    ],
    title: '鄉鎮市區界',
    opacity: 0.7,
    visible: false,
    id: 1
})
// FeatureLayer
const gasStationLayer = new FeatureLayer({
    url: gasStationUrl,
    title: '加油站',
    visible: false,
    id: 2
})
const hotelLayer = new FeatureLayer({
    url: hotelUrl,
    title: '飯店旅館',
    visible: false,
    id: 3
})
// WMSLayer
const industryLayer = new WMSLayer({
    url: industryUrl,
    title: '工業區範圍',
    visible: false,
    id: 4
})
// GeoJSONLayer - renderer
const renderer = {
    type: 'simple',
    field: '*',
    symbol: {
        type: 'simple-marker',
        outline: {
            color: 'white'
        }
    },
    visualVariables: [
        {
            type: 'size',
            field: 'mag',
            stops: [
                {value: 3, size: '4px'},
                {value: 7, size: '40px'}
            ]
        },
        {
            type: 'color',
            field: 'mag',
            stops: [
                {value: 3, color: '#FFF143'},
                {value: 7, color: '#E10800'}
            ]
        }
    ]
}
// GeoJSONLayer - popupTemplate
const earthquakeTemplate = {
    title: '地震資訊',
    content: '地震規模：{mag}</br>地震時間：{expression/formatDate}',
    expressionInfos: [
        {
            name: 'formatDate',
            title: 'Format Date',
            expression: `var date = Date($feature.time)
             return Text(date, "YYYY/MM/DD a hh:mm")`
        }
    ]
}
// GeoJSONLayer
const earthquakeLayer = new GeoJSONLayer({
    url: earthquakeUrl,
    popupTemplate: earthquakeTemplate,
    definitionExpression: 'mag >= 3',
    copyright: 'lilys map',
    renderer: renderer,
    title: '近一個月地震',
    visible: false,
    id: 6
})
// sketch 畫出來的圖形要存放在這個圖層
const sketchLayer = new GraphicsLayer()
// sketchVM
const sketchViewModel = new SketchViewModel({
    layer: sketchLayer,
    view: view,
    updateOnGraphicClick: false,
    pointSymbol: {
        type: 'simple-marker',
        style: 'circle',
        size: 10,
        color: [211, 132, 80, 0.7],
        outline: {
            color: [255, 255, 255, 0.8],
            size: 10
        }
    },
    polylineSymbol: {
        type: 'simple-line',
        color: [211, 132, 80, 0.7],
        width: 6
    },
    polygonSymbol: {
        type: 'simple-fill',
        color: [211, 132, 80, 0.7],
        outline: {
            color: [255, 255, 255, 0.8],
            size: '10px'
        }
    }
})
// GraphicsLayer 用來顯示 query 跟 identity 的結果
const queryLayer = new GraphicsLayer()
const identifyLayer = new GraphicsLayer()
// query 要用到的參數
let queryParams = new Query({
    returnGeometry: true,
    outFields: ['*']
})
// identify 要用到的參數
let identifyParams
let identifyPoint
// 圖層的dictionary，用於開關圖層
const layerMap = new Map()
layerMap.set('countyLayer', countyLayer)
layerMap.set('gasStationLayer', gasStationLayer)
layerMap.set('hotelLayer', hotelLayer)
layerMap.set('industryLayer', industryLayer)
layerMap.set('earthquakeLayer', earthquakeLayer)
map.addMany([countyLayer, queryLayer, roadLayer, industryLayer, gasStationLayer, hotelLayer, earthquakeLayer, identifyLayer, sketchLayer])
// mapView 的方法
view.on('pointer-move', renderXY)
view.watch('extent', renderExtent)
view.when(() => {
    getCountyList()
    initEventListener()
    initScreen()
    initIdentifyParams()
})
// mapView 的 ui 屬性的方法
view.ui.add('sketchDiv', 'top-right')
view.ui.add(homeBtn, 'top-right')
view.ui.add('layerToggle', 'top-left')
view.ui.add('mapInfoDiv', 'bottom-right')
view.ui.add('transform', 'bottom-right')
view.ui.add('optionsDiv', 'bottom-left')
view.ui.add('toggleIdentifyDiv', 'bottom-left')
view.ui.move('zoom' , 'top-right')
// 取得坐標並放到 DOM 裡面
function renderXY(event){
    let point = view.toMap({x: event.x, y: event.y})
    document.querySelector('#xyDiv').innerText = formatCoords(point.longitude, point.latitude)
}
// 取得地圖範圍並放到 DOM 裡面
function renderExtent(){
    let extent = view.extent
    document.querySelector('#extentDiv').innerHTML = `xmin : ${extent.xmin.toFixed(2)}</br>ymin : ${extent.ymin.toFixed(2)}</br>xmax : ${extent.xmax.toFixed(2)}</br>ymax : ${extent.ymax.toFixed(2)}`
}
// 開關圖層
function toggleLayer(event){
    if(event.target.tagName === 'INPUT'){
        let key = event.target.id
        layerMap.get(key).visible = event.target.checked
    }
}
// 取得縣市資料
function getCountyList(){
    axios.get(countyListUrl)
        .then(res => {
            const myJson = convertXML(res.data)
            countyList = myJson.countyItems.children.map(item => ({
                countyname: item.countyItem.children[1].countyname.content,
                countycode01: item.countyItem.children[2].countycode01.content
            }))
            renderSelect()
        })
}
// 渲染 select 的 optoin
function renderSelect(){
    countyList.forEach(item => {
        countySelect.innerHTML += `<option value="${item.countycode01}">${item.countyname}</option>`
    })
}
// query
function doQuery(){
    queryLayer.removeAll()
    queryParams.where = `COUNTYCODE =  '${countySelect.value}'`
    query.executeQueryJSON(queryUrl, queryParams)
        .then(getResult)
        .catch(promiseRejected)
}
// query 後要做的事 1.整理 response.features 2.加到graphic圖層 3.view移到結果
function getResult(response){
    console.log(response) //TODO 看看 field 改了會發生甚麼事
    const results = response.features.map((feature) => {
        feature.symbol = {
            type: 'simple-fill',
            color: [227, 188, 0, 0.7]
        }
        return feature
    })
    queryLayer.addMany(results)
    view.goTo(results)
}
// 執行identify
function executeIdentify(event){
    identifyLayer.removeAll()
    identifyPoint = event.mapPoint
    identifyParams.geometry = event.mapPoint
    identifyParams.mapExtent = view.extent
    document.querySelector('#viewDiv').style.cursor = 'wait'
    identify
        .identify(identifyUrl, identifyParams)
        .then(identifyResult)
        .then(showPopup)
}
// 執行identify 後要做的事 1.整理response 2.view要goto點到的地方
function identifyResult(response){
    const results = response.results.map(
        result => {
            let feature = result.feature
            feature.popupTemplate = {
                title: feature.attributes.COUNTYNAME,
                content: feature.attributes.TOWNNAME
            }
            feature.symbol = {
                type: 'simple-fill',
                color: [0, 188, 255, 0.7]
            }
            identifyLayer.add(feature)
            return feature
        }
    )
    view.goTo(results)
    return results
}
// identify 整理完 response，要showPopup
function showPopup(response){
    console.log('identify', response)
    if(response.length > 0){
        console.log(response)
        view.popup.open({
            features: response,
            location: identifyPoint
        })
    }
    document.getElementById("viewDiv").style.cursor = "auto"
}
// 查詢失敗
function promiseRejected(error) {
    console.error("Promise rejected: ", error.message);
}
// 初始化 identify參數
function initIdentifyParams(){
    identifyParams = new IdentifyParameters()
    identifyParams.tolerance = 3
    identifyParams.layerIds = [0]
    identifyParams.layerOption = 'all'
    identifyParams.width = view.width
    identifyParams.height = view.height
    identifyParams.returnGeometry = true
}
let handler // 存放是否執行identify的監聽器
function toggleIdentify(event){
    if(event.target.checked){
        handler = view.on('click', executeIdentify)
    }else{
        identifyLayer.removeAll()
        handler.remove() // 刪除監聽器，這樣就不會執行identify了
        view.popup.close()
    }
}
// 初始化各種按鈕的監聽器
function initEventListener(){
    layerToggle.addEventListener('click', toggleLayer, false)
    document.querySelector('#doBtn').addEventListener('click', doQuery)
    document.querySelector('#toggleIdentify').addEventListener('click', toggleIdentify)
    sketchBtnArr.forEach(btn => {
        btn.addEventListener('click', sketchHandler)
    })
    document.querySelector('#transformBtn').addEventListener('click', transformCoordinate)
}
// 初始化畫面
function initScreen(){
    document.querySelector('#xyDiv').innerText = formatCoords(view.center.longitude, view.center.latitude)
}

// sketch功能
let geometryType // 紀錄現在在畫哪一種圖形
let editOrDelete // 紀錄是編輯還是刪除
function sketchHandler(event){
    let classList = event.target.classList
    sketchBtnArr.forEach(btn => btn.classList.remove('active'))
    // 不管現在sketchViewModel在做甚麼，一律取消動作
    sketchViewModel.cancel()
    if(classList.contains('draw-btn')){
        editOrDelete = ''
        drawGraphic(event)
    }else if(classList.contains('update-btn')){
        geometryType = ''
        updateGraphic(event)
    }
}
// 畫畫
function drawGraphic(event) {
    let target = event.target
    if(geometryType === target.value){
        geometryType = ''
    }else{
        // 如果按鈕不是按到現在在畫的圖形，開始畫畫
        sketchViewModel.create(target.value)
        target.classList.add('active')
        geometryType = target.value
    }
}
// 編輯或修改
function updateGraphic(event){
    let target = event.target
    if(editOrDelete === target.value){
        editOrDelete = ''
        sketchViewModel.updateOnGraphicClick = false
    }else{
        target.classList.add('active')
        sketchViewModel.updateOnGraphicClick = 'update'
        editOrDelete = event.target.value
    }
}
let graphicId = 0
sketchViewModel.on('create', (event) => {
    // if(event.state === 'complete'){
    //     // 獲取畫出來的圖形
    //     const geometry = event.geometry;

    //     // 創建一個新的 Graphic 對象，並將其儲存在一個變量中
    //     const graphic = new Graphic({
    //         geometry: geometry,
    //         symbol: event.graphic.symbol,
    //         popupTemplate: {
    //             title: "圖形信息",
    //             content: "這是一個圖形"
    //         }
    //     })
    //     // 將圖形添加到 GraphicsLayer 中
    //     sketchLayer.add(graphic);
    //     // 畫完之後繼續畫
    //     sketchViewModel.create(event.tool)
    // }
    if(event.state === 'complete'){
        graphicId ++
        event.graphic.popupTemplate = {
            title: graphicId,
            content: `Name：怎麼取名?型態：${event.graphic.geometry.type}`
        }
        console.log(event.graphic)
        // 畫完之後繼續畫
        sketchViewModel.create(event.tool)
    }
})
sketchViewModel.on('update', (event) => {
    // 如果現在是刪除狀態，點到的圖形要刪除，否則就是普通的update
    if(editOrDelete === 'delete'){
        sketchLayer.remove(event.graphics[0])
    }
})
view.on("click", function(event) {
    // 进行 hitTest，获取与点击位置相交的 graphic
    view.hitTest(event).then(function(response) {
        var graphic = response.results[0].graphic
        // console.log('in',graphic)
        if (graphic) {
            console.log('popup', graphic)
            view.popup.open({
                features: graphic,
                location: event.mapPoint
            })
            // view.popup.content = `Name：${graphic.popupTemplate.title}<br>型態：${graphic.geometry.type}`
            // view.popup.open({
            //     location: event.mapPoint
            // })
        }
    })
})
//createGraphic 畫出來的圖的各種資訊 在畫的圖中才讀得到
//activeTool 在畫甚麼圖形 在畫的圖中才讀得到
//state sketchVM 的狀態，畫之前和結束是 ready，正在畫的時候是 active
const projMap = new Map()
projMap.set('3828', '+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
projMap.set('3829', '+proj=lcc +lat_1=25 +lat_2=25 +lat_0=25 +lon_0=121 +k_0=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
projMap.set('3826', '+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
projMap.set('3825', '+proj=tmerc +lat_0=0 +lon_0=121 +k_0=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
projMap.set('3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs')
// 轉換坐標
function transformCoordinate(){
    let from = projMap.get(document.querySelector('#fromEPSG').value)
    let to = new proj4.Proj('EPSG:4326')
    let coordinates = []
    coordinates.push(parseFloat(document.querySelector('#coordinateX').value))
    coordinates.push(parseFloat(document.querySelector('#coordinateY').value))
    let outputCoords = proj4(from, to, coordinates)
    document.querySelector('#resultCoordinate').value = formatCoords(outputCoords[0], outputCoords[1])
}
function formatCoords(x, y){
    return `${x.toFixed(6)}, ${y.toFixed(6)}`
}