var track_id = '';      // Name/ID of the exercise
var watch_id = null;    // ID of the geolocation
var tracking_data = new Array(); // Array containing GPS position objects

//funcao para calcular a distancia entre 2 pontos
function gps_distance(lat1, lon1, lat2, lon2)
{
	// http://www.movable-type.co.uk/scripts/latlong.html
    var R = 6371; // km
    var dLat = (lat2-lat1) * (Math.PI / 180);
    var dLon = (lon2-lon1) * (Math.PI / 180);
    var lat1 = lat1 * (Math.PI / 180);
    var lat2 = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    
    return d;
}

$("#gravarIniciar").on('click', function(){
	navigator.vibrate([500]);
    
	console.log("-----------------Iniciar Gravacao da rota-----------------");
    watch_id = navigator.geolocation.watchPosition(
    	// Success
        function(position){
			var dados = new Object();
			var coordenadas = new Object();
			
			coordenadas.longitude = position.coords.longitude;
			coordenadas.latitude = position.coords.latitude;
			
			dados.coords = coordenadas;
			dados.timestamp = position.timestamp;
			if (tracking_data.length>0){
				if((coordenadas.longitude!=tracking_data[tracking_data.length-1].coords.longitude) || (coordenadas.latitude!=tracking_data[	tracking_data.length-1].coords.latitude)){
				tracking_data.push(dados);
					$("#listaLocalizacao").append("<div class='col s12 m6'>"+
													"<div class='card-panel'>"+
														"<h6 class='container brown-text'>Latitude:<i>"+coordenadas.latitude+"</i></h6>"+
														"<h6 class='container brown-text'>Longitude:<i>"+coordenadas.longitude+"</i></h6>"+
													"</div>"+
												  "</div>");
				}
			}else{
				tracking_data.push(dados);
					$("#listaLocalizacao").append("<div class='col s12 m6'>"+
													"<div class='card-panel'>"+
														"<h6 class='container brown-text'>Latitude:<i>"+coordenadas.latitude+"</i></h6>"+
														"<h6 class='container brown-text'>Longitude:<i>"+coordenadas.longitude+"</i></h6>"+
													"</div>"+
												  "</div>");
			}

						
				//console.log('+----Var dados----+');
			
            console.log(dados);
			
        },        
        // Error
        function(error){
            console.log(error);
			alert('code: '    + error.code    + '\n' +
				  'message: ' + error.message + '\n');
        },        
        // Settings
        { frequency: 3000, enableHighAccuracy: $("#cbInternet").is(':checked') });
    console.log($("#cbInternet").is(':checked'));
    // Tidy up the UI
    //track_id = $("#track_id").val();
    
    //$("#track_id").hide();
    
    //$("#startTracking_status").html("Tracking workout: <strong>" + track_id + "</strong>");
});

$("#gravarParar").on('click', function(){
	
	console.log("-----------------Gravando dados da rota-----------------");
    console.log(tracking_data);

	navigator.vibrate([500,200,500]);
	
	// Para a verifica? de posi?
	navigator.geolocation.clearWatch(watch_id);
    
	$("#listaLocalizacao").empty();
	// Salva no banco de dados local o que fui gravado
	window.localStorage.setItem($("#nome_rota").val(), JSON.stringify(tracking_data));
	
	// Limpa as variaveis utilizadas 
	//watch_id = null;
	tracking_data = [];

});

$("#limparDados").on('click', function(){
	console.log("-----------------Limpando dados da rota-----------------");
	window.localStorage.clear();
});


$("#testarDados").on('click', function(){
	window.localStorage.setItem('Sample block', '[{"timestamp":1335700802000,"coords":{"heading":null,"altitude":null,"longitude":170.33488333333335,"accuracy":0,"latitude":-45.87475166666666,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700803000,"coords":{"heading":null,"altitude":null,"longitude":170.33481666666665,"accuracy":0,"latitude":-45.87465,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700804000,"coords":{"heading":null,"altitude":null,"longitude":170.33426999999998,"accuracy":0,"latitude":-45.873708333333326,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700805000,"coords":{"heading":null,"altitude":null,"longitude":170.33318333333335,"accuracy":0,"latitude":-45.87178333333333,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700806000,"coords":{"heading":null,"altitude":null,"longitude":170.33416166666666,"accuracy":0,"latitude":-45.871478333333336,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700807000,"coords":{"heading":null,"altitude":null,"longitude":170.33526833333332,"accuracy":0,"latitude":-45.873394999999995,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700808000,"coords":{"heading":null,"altitude":null,"longitude":170.33427333333336,"accuracy":0,"latitude":-45.873711666666665,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700809000,"coords":{"heading":null,"altitude":null,"longitude":170.33488333333335,"accuracy":0,"latitude":-45.87475166666666,"speed":null,"altitudeAccuracy":null}}]');

});

$('#tabMap').on('click', function () {
	$('#panelMapa').hide();
	
	// calcula o numero de rotas gravadas
	tracks_recorded = window.localStorage.length;
	
	$("#lista_rotas").empty();
	
	for(i=0; i<tracks_recorded; i++){
		$("#lista_rotas").append("<a class='collection-item waves-effect black-text' data-id='"+window.localStorage.key(i)+"' >" + window.localStorage.key(i) + "</a>");
	}
	
});

$("#lista_rotas").on('click','a',function(){
	console.log($(this).attr('data-id'));
	
	var key = $(this).attr("data-id");
	var data = window.localStorage.getItem(key);
	
	data = JSON.parse(data);
	
	var total_km = 0;
	
	for(i = 0; i < data.length; i++){
	    
	    if(i == (data.length - 1)){
	        break;
	    }
	    
	    total_km += gps_distance(data[i].coords.latitude, data[i].coords.longitude, data[i+1].coords.latitude, data[i+1].coords.longitude);
	}

	var total_km_rounded = total_km.toFixed(2);
	
	// Calculate the total time taken for the track
	var start_time = new Date(data[0].timestamp).getTime();
	var end_time = new Date(data[data.length-1].timestamp).getTime();

	var total_time_ms = end_time - start_time;
	var total_time_s = total_time_ms / 1000;
	
	var final_time_m = Math.floor(total_time_s / 60);
	var final_time_s = total_time_s - (final_time_m * 60);

	$("#labelDistancia").text("Distância trafegada: "+ total_km_rounded+" KM");
	$("#labelTempo").text("Tempo da rota: "+final_time_m+"m "+final_time_s+"s ");
	
	var myLatLng = new google.maps.LatLng(data[0].coords.latitude, data[0].coords.longitude);
	
	var myOptions = {
      zoom: 15,
      center: myLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // Cria o mapa e seta as opções
    var map = new google.maps.Map(document.getElementById("map"), myOptions);

    var trackCoords = [];
    
	//adiciona uma marca no inicio da rota
	var pontoInicial = new google.maps.LatLng(data[0].coords.latitude, data[0].coords.longitude);
	var pontoFinal = new google.maps.LatLng(data[data.length-1].coords.latitude, data[data.length-1].coords.longitude);
	
	var marcadoInicial = new google.maps.Marker({
				position: pontoInicial,
				map: map,
				title:'Inicio da Rota'
			});
			
	var marcadoFinal = new google.maps.Marker({
				position: pontoFinal,
				map: map,
				title:'Fim da Rota'
			});
	
    // Percorre o array com as coordenadas, transformando em um objeto to tipo LatLng
    for(i=0; i<data.length; i++){
    	trackCoords.push(new google.maps.LatLng(data[i].coords.latitude, data[i].coords.longitude));
    }
    
    // Cria o caminho da rota, e passa as opções
    var trackPath = new google.maps.Polyline({
      path: trackCoords,
      strokeColor: "#999999",
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    // aplica esse caminho no mapa
    trackPath.setMap(map);
	$('#panelMapa').show(1000);
});
