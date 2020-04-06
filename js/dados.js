async function buscaCasos() {
    let scr = "https://brasil.io/api/dataset/covid19/caso/data?is_last=True&state=PR";

    let response = await fetch(scr);

    let resultados="";
    
    if (response.ok) {
        resultados = await response.json();
        resultados = resultados.results;
    }

    return resultados;
}

async function buscaMunicipios() {
    var planilha = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4ueukaTayg-kG5kMugqp8Wg7GJc6m6fmTRRQnoFh2X7E4KHKV8zrjVqPF0mvYzRbOfDfDiFxIOkaF/pub?output=csv";

    let response = await fetch('https://cors-anywhere.herokuapp.com/' + planilha);
    let texto = await response.text();
    var linhas = texto.split("\n");
    var municipios = [];
    
    linhas
        .filter((linha) => !linha.includes("MUNICIPIO"))
        .forEach((linha) => {
            let tokens = linha.split(',');
            let municipio = Municipio.build(tokens);
            municipios.push(municipio);
        });
    return municipios;
}



async function geraDados() {

    let casos = await buscaCasos();
    let municipios = await buscaMunicipios();

    let regionais = [];

    for (var i = 1; i <= 22; i++) {
        regional = new Regional();
        regional.nomeRegional = i + "ª Regional de Saúde";
        regional.id = i;

        regionais.push(regional);
    }

    casos.forEach((caso)=>{
        let municipio = municipios.filter((municipio)=>municipio.nome==caso.city)[0];
        if(municipio){
            municipio.totalCasos = caso.confirmed;
            municipio.totalMortes = caso.deaths;    
        }
    });
    
    municipios
        .forEach((municipio)=>{
            let regional = regionais[municipio.regional-1];
            municipio.regional = regional;
            if(municipio.sedeRegional==1){
                regional.municipioSede=municipio;
            }
            regional.adicionaMunicipio(municipio);

        });
    

    
 
    return regionais;
}



