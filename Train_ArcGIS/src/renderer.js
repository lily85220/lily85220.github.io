import './renderer.css'
import proj4 from 'proj4'
import Map from "@arcgis/core/Map.js"
import MapView from "@arcgis/core/views/MapView.js"
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js"
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
const earthQuakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
const map = new Map({
    basemap: "satellite"
})
const view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 7,
    center: [121, 23.5] // longitude, latitude
})
const renderer = {
    type: 'simple',
    field: 'msg',
    symbol: {
        type: 'simple-marker',
        outline:{
            color: 'white'
        }
    },
    visualVariables: [
        {
            type: 'size',
            field: 'mag',
            stops: [
                { value: 3, size: "4px" },
                { value: 7, size: "40px" }
            ]
        },
        {
            type: 'color',
            field: 'mag',
            stops: [
                { value: 3, color: '#FFF143' },
                { value: 7, color: '#E10800' }
            ]
        }
    ]
}

dayjs.locale('zh-cn') //把 am 變中文
const earthQuakeTemplate = {
    title: '地震資訊',
    content: '地震規模：{mag}</br>地震時間：{expression/DateTime}',
    expressionInfos: [
        // {
        //     name: "dayjs",
        //     title: "dayjs",
        //     expression: "var dayjs = require('dayjs'); return dayjs;"
        //   },
        {
            name: 'DateTime',
            title: 'MyDateTime',
            expression: `var time = $feature.time;
                return dayjs(time).format('YYYY/MM/DD a hh:mm')`,
            returnType: 'string'
            // expression: "$feature.time + '你好'"
        }
    ]
}
const earthQuakeLayer = new GeoJSONLayer({
    url: earthQuakeUrl,
    popupTemplate: earthQuakeTemplate,
    definitionExpression: "mag >= 3", // mag >= 3 才要渲染在畫面上
    copyright: 'lilys map',
    renderer: renderer
})
map.add(earthQuakeLayer)
let EPSG4326 = new proj4.Proj('EPSG:4326') // WGS84
let EPSG3857 = new proj4.Proj('EPSG:3857') // Mercator
// let coordinates = [13482162.90438691, 2676243.5535288886]
let coordinates = [121.11233, 23.3652];
let transformedCoordinates = proj4(EPSG4326, EPSG3857, coordinates);
console.log(transformedCoordinates)
console.log(dayjs(1679903836617).format('YYYY/MM/DD a hh:mm')) //a 是am 或 pm