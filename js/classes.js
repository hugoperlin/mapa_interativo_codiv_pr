class Municipio {

    constructor(){
        this.id = 0;
        this.nome = "";
        this.populacao = 0;
        this.latitude = 0.0;
        this.longitude = 0.0;
        this.regional = null;
        this.totalCasos = 0;
        this.totalMortes = 0;
        this.totalRespiradores=0;
        this.totalUTI=0;
        this.sedeRegional=0;
    }

    static build(tokens){
        var municipio = new Municipio();
        municipio.id = 0;
        municipio.nome = tokens[2];
        municipio.regional = parseInt(tokens[4]);
        municipio.totalUTI = parseInt(tokens[5]);
        municipio.totalRespiradores = parseInt(tokens[7]) + parseInt(tokens[8]);
        municipio.populacao = parseInt(tokens[9])
        municipio.latitude = parseFloat(tokens[11])
        municipio.longitude = parseFloat(tokens[12])
        
        //ajuste na latitude e longitude
        if(Math.abs(municipio.latitude)>100){
            municipio.latitude=municipio.latitude/10;
        }
        if(Math.abs(municipio.longitude)>100){
            municipio.longitude=municipio.longitude/10;
        }

        
        if (tokens[10] != '') {
            municipio.sedeRegional = parseInt(tokens[10]);
        }

        return municipio;
    }

}

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
        this.municipios = [];
        this.totalCasos=0;
        this.totalMortes=0;
    }

    adicionaMunicipio(municipio){

        this.populacaoTotal+=municipio.populacao;
        this.totalRespiradores+=municipio.totalRespiradores;
        this.totalUTI+=municipio.totalUTI;
        this.totalCasos+=municipio.totalCasos;
        this.totalMortes+=municipio.totalMortes;

        this.municipios.push(municipio);

    }



    geraTexto() {
        var texto = '<div class="nomeRegional">' + this.nomeRegional + '</div>';
        texto += '<div class="populacao">População total: ' + this.populacaoTotal.toLocaleString() + ' habitantes</div>';
        texto += '<div class="cincoporcento">5%: ' + (Math.round(this.populacaoTotal * 0.1 * 0.05)).toLocaleString() + ' pacientes</div>';
        texto += '<div class="leitosUTI">Leitos de UTI: ' + this.totalUTI.toLocaleString() + '</div>';
        texto += '<div class="respiradores">Total de Respiradores: ' + this.totalRespiradores.toLocaleString() + '</div>';

        var self = this;
        var lista = "";
        
        this.municipios
           .filter((municipio)=>(municipio.totalCasos>0 || municipio.totalMortes>0))
           .forEach((a) => {
              lista += '<li>' + a.nome + ': ' + a.totalCasos + ' (' + a.totalMortes + ')</li>';
        });

        texto += '<div class="detalhesCasos">';
        texto += '<div>Total Casos:' + this.totalCasos + '</div>';
        texto += '<div>Total Mortes:' + this.totalMortes + '</div>';

        texto += '<div class="casos">';
        texto += '<ul class="lista-detalhes-casos">';
        texto += lista;
        texto += '</ul>';
        texto += '</div>';

        texto += '</div>';



        return texto;
    }

}