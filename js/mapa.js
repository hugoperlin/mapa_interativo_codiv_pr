
let mymap = L.map('mapid').setView([-24.791494, -51.185088], 7);
let regionais=null;
let municipios=[];

async function setup() {
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(mymap);

    regionais = await geraDados();

    regionais.forEach((regional)=>{
        let marker = L.marker(new L.LatLng(regional.municipioSede.latitude, regional.municipioSede.longitude), { title: regional.nomeRegional });
        marker.bindPopup(regional.geraTexto());
        regional.markers = L.markerClusterGroup();

        regional.marker = marker;
        regional.markers.addLayer(marker);
        mymap.addLayer(regional.markers);

        municipios.push(...regional.municipios);
    });

    L.geoJSON.ajax('data/regionais.geojson', { style: styleRegionais, onEachFeature: processFeturesRegionais }).addTo(mymap);

}

function getRandomColor(index) {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[index];
    }
    return color;
}

function styleRegionais(json) {

    var att = json.properties;

    return { color: cores[parseInt(att.nome)] };
}

function processFeturesRegionais(json, lyr) {
    var att = json.properties;


    lyr.on({
        mouseover: function (e) {
            this.setStyle({ color: "#FF0000" });
        },
        mouseout: function (e) {
            this.setStyle(styleRegionais(json));
        },
        click: function (e) {
            regionais[att.nome-1].marker.fire("click");
        }
    });

    let regional = regionais[att.nome-1];
    regional.layer = lyr;
}

function selecionaMunicipio() {
    var input = document.getElementById("municipio_id");
    
    var sede = municipios.find((a) => { return a.nome == input.value });
    var regional = sede.regional.municipioSede;

    mymap.setView([regional.latitude, regional.longitude], 7);

    sede.regional.marker.fire("click");
}


