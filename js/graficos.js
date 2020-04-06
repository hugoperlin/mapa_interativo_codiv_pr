
function plotar(regionais) {
    plotaPorRegionais(regionais);
}

function plotaPorRegionais(regionais) {

    var canvas = document.getElementById("porRegionais");

    var casosPorRegionais = [];
    var nomesRegionais = [];

    regionais.forEach(regional => {
        casosPorRegionais.push(regional.totalCasos);
        nomesRegionais.push(regional.nomeRegional);

    });

    console.log(casosPorRegionais);

    var config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: casosPorRegionais,
                backgroundColor: cores,
                label: 'Regionais de Saúde do Paraná'
            }],
            labels: nomesRegionais
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Casos por Regionais'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };
    
    window.porRegionais = new Chart(canvas, config);


}

