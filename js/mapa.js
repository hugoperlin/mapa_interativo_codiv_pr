class Regional {

    constructor() {
        this.municipioSede = null;
        this.nomeRegional = "";
        this.id = 0;
        this.populacaoTotal = 0;
        this.totalRespiradores = 0;
        this.totalUTI = 0;
        this.markers = [];
        this.marker = null;
        this.layer = null;
        this.municipiosComCasos = [];
    }

    geraTexto() {
        var texto = '<div class="nomeRegional">' + this.nomeRegional + '</div>';
        texto += '<div class="populacao">População total: ' + this.populacaoTotal.toLocaleString() + ' habitantes</div>';
        texto += '<div class="cincoporcento">5%: ' + (Math.round(this.populacaoTotal * 0.1 * 0.05)).toLocaleString() + ' pacientes</div>';
        texto += '<div class="leitosUTI">Leitos de UTI: ' + this.totalUTI.toLocaleString() + '</div>';
        texto += '<div class="respiradores">Total de Respiradores: ' + this.totalRespiradores.toLocaleString() + '</div>';


        var totalCasos = 0;
        var totalMortes = 0;
        var lista = "";
        this.municipiosComCasos.forEach((a) => {
            totalCasos += a.totalCasos;
            totalMortes += a.totalMortes;
            lista += '<li>' + a.nome + ': ' + a.totalCasos + ' (' + a.totalMortes + ')</li>';
        });
        texto += '<div class="detalhesCasos">';
        texto += '<div>Total Casos:' + totalCasos + '</div>';
        texto += '<div>Total Mortes:' + totalMortes + '</div>';

        texto += '<div class="casos">';
        texto += '<ul class="lista-detalhes-casos">';
        texto += lista;
        texto += '</ul>';
        texto += '</div>';

        texto += '</div>';



        return texto;
    }

}

class Municipio {

    constructor(id, nome, populacao, latitude, longitude, regional) {
        this.id = id;
        this.nome = nome;
        this.populacao = populacao;
        this.latitude = latitude;
        this.longitude = longitude;
        this.regional = regional;
        this.totalCasos = 0;
        this.totalMortes = 0;
    }

}

var mymap = L.map('mapid').setView([-24.791494, -51.185088], 8);
var regionais = {};
var municipios = [];
var casos = {};

var configCSV = {
    delimiter: ",",
    header: true,
    dynamicTyping: false,
    skipEmptyLines: false,
    preview: 0,
    step: undefined,
    encoding: "",
    worker: false,
    comments: "",
    complete: null,
    error: function (err, file) {
        console.log(err);
    },
    download: true
}

function setup() {
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(mymap);

    var configCasos = Object.assign({}, configCSV);
    configCasos.complete = processaCasos;
    var csvCasos = "https://raw.githubusercontent.com/wcota/covid19br/master/cases-brazil-cities.csv";
    Papa.parse('https://cors-anywhere.herokuapp.com/' + csvCasos, configCasos);

    var configDados = Object.assign({}, configCSV);
    configDados.complete = processaDados;

    var planilha = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4ueukaTayg-kG5kMugqp8Wg7GJc6m6fmTRRQnoFh2X7E4KHKV8zrjVqPF0mvYzRbOfDfDiFxIOkaF/pub?output=csv";
    Papa.parse('https://cors-anywhere.herokuapp.com/' + planilha, configDados);

}



function processaCasos(results) {

    console.log(results.data);

    var casosPR = results.data.filter(function (a) { return a.state == "PR"; });
    casos = casosPR;

}


function processaDados(results) {


    for (var i = 1; i <= 22; i++) {
        regional = new Regional();
        regional.nomeRegional = i + "ª Regional de Saúde";
        regional.markers = L.markerClusterGroup();
        regional.id = i;

        regionais[i] = regional;
    }


    for (var i = 0; i < results.data.length; i++) {
        var a = results.data[i];
        var regional = regionais[a.RS];
        regional.populacaoTotal += parseInt(a.POPULACAO);
        regional.totalRespiradores += parseInt(a.RESPIRADOR_MECANICO_SUS) + parseInt(a.RESPIRADOR_MECANICO_GERAL);
        regional.totalUTI += parseInt(a.LEITOS_UTI_GERAL);

        if (Math.abs(a.LATITUDE) > 100) {
            a.LATITUDE = a.LATITUDE / 10;
        }
        if (Math.abs(a.LONGITUDE) > 100) {
            a.LONGITUDE = a.LONGITUDE / 10;
        }


        municipios.push(new Municipio(i + 1, a.MUNICIPIO, a.POPULACAO, a.LATITUDE, a.LONGITUDE, regional));






        if (a.SEDE_REGIONAL == 1) {
            regional.municipioSede = a;

            var title = a.MUNICIPIO;
        }

    }

    casos.forEach((a) => {
        var nome = a.city.split("/")[0];

        var municipio = municipios.find((x) => { return x.nome == nome });
        if (municipio != null) {
            municipio.totalCasos = parseInt(a.totalCases);
            municipio.totalMortes = parseInt(a.deaths);

            municipio.regional.municipiosComCasos.push(municipio);
        }

    });


    for (var i = 1; i <= 22; i++) {
        var regional = regionais[i];

        var marker = L.marker(new L.LatLng(regional.municipioSede.LATITUDE, regional.municipioSede.LONGITUDE), { title: regional.nomeRegional });

        marker.bindPopup(regionais[i].geraTexto());
        regional.marker = marker;
        regional.markers.addLayer(marker);

        mymap.addLayer(regionais[i].markers);
    }

    //carregando o shapefile com as regionais
    var lyrRegionais = L.geoJSON.ajax('data/regionais.geojson', { style: styleRegionais, onEachFeature: processFeturesRegionais }).addTo(mymap);


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
    var cores = [
        "#c00cb0",
        "#7af808",
        "#f8dc5c",
        "#4b0736",
        "#6492a7",
        "#ede662",
        "#512578",
        "#1c5860",
        "#5d556e",
        "#14ab54",
        "#1d5cd1",
        "#08b0e2",
        "#de85ad",
        "#b8ce66",
        "#248fc4",
        "#f1c009",
        "#b9f96c",
        "#1cd62c",
        "#7e86e2",
        "#c3c731",
        "#817f50",
        "#d0a3ad",
    ];
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
            regionais[att.nome].marker.fire("click");
        }
    });

    regionais[att.nome].layer = lyr;


}

function selecionaMunicipio() {
    var input = document.getElementById("municipio_id");
    console.log(input.value);

    var sede = municipios.find((a) => { return a.nome == input.value });
    var regional = sede.regional.municipioSede;

    mymap.setView([regional.LATITUDE, regional.LONGITUDE], 8);

    sede.regional.marker.fire("click");
}


