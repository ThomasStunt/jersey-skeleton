$(document).ready( function () {

	//VARIABLE LOCAL
	var braderies = [];
	var current_user;
	var uri = "/v1/brocante";
	var hidden = true;
	var mapHidden = true;

	getActualUser();

	function getActualUser () {
		$.ajax({
			url: "/v1/login",
			type: "GET",
			dataType: "json",
			success: function(json) {
				if(json != null){
					current_user = json;
					checkUser();
				}
			},
			error: function(xhr, status, errorThrown) {
				alert("Something went wrong");
				console.log("xhr: ", xhr);
				console.log("status: ", status);
				console.log("errorThrown: ", errorThrown);
			}
		});
	};

	function checkUser () {
		if(current_user != null){
			$('#login_button').hide();	
			$('#delBraderie').hide();
			$('#listValid').hide();
			$('#gestionBrad').hide();
			$('#addBraderie').show();

			if(current_user.rank > 0) {
				$('#addBraderie').hide();
				$("#gestionBrad").show();
			}
			
		}else{
			$('#addBraderie').show();
			$('#delBraderie').hide();
			$("#gestionBrad").hide();
		}
	};
	

	//	BOUTON LOGIN
	$('#login_button').click(function () {
		$.ajax({
			url: "/v1/userdb/login",
			type: "GET",
			dataType: "json",
			success: function(json) {
				current_user = json;
				checkUser();
			},
			error: function(xhr, status, errorThrown) {
				alert("Something went wrong");
				console.log("xhr: ", xhr);
				console.log("status: ", status);
				console.log("errorThrown: ", errorThrown);
			}
		});			
	});

	// LISTER LES BRADERIES
	$('#listBraderie').click( function () {
		$("#outputAdd").hide();
		$("#outputDel").hide();
		$("#map").hide();
		$("#outputList").show();
		$("#outputValid").hide();
		var res = "";
		$.ajax({
			url: uri,
			type: "GET",
			dataType: "JSON",
			success: function(json) {
				if(json[0] == null) {
					$("#outputList").html("Aucune brocante disponible.");
				} else {
					var res = "<div><table class=\"table table-striped table-bordered\" style=\"text-align:center\"><tr><td><b>Libelle</b></td><td><b>Ville</b></td><td><b>Date</b></td></tr><tr>";
					for(i in json) {
							res+="<td>"+json[i].libelle+"</td>";
							res+="<td>"+json[i].ville+"</td>";
							res+="<td>"+json[i].date+"</td>";
							res+="</tr><tr>"
    					}
					res+="</tr></table></div>";
					$("#outputList").html(res);
				}
			},
			error: function(xhr, status, errorThrown) {
				alert("Something went wrong");
				console.log("xhr: ", xhr);
				console.log("status: ", status);
				console.log("errorThrown: ", errorThrown);
			}
		});
	});

	// BOUTON AFFICHER LA CARTE
	$('#showMap').click( function () {
		if(mapHidden) {
			$("#map").show();
			initializeMap();

			$("#outputAdd").hide();
			$("#outputDel").hide();
			$("#outputList").hide();
			$("#outputValid").hide();

			getInformationBraderie();

			mapHidden = false;
		} else {
			$("#map").hide();
			mapHidden = true;
		}
	});

	// AFFICHER FORMULAIRE AJOUT
	$("#addBraderie").click(function() {
		$("#outputAdd").show();
		$('#outputValid').hide();
		$("#map").hide();
		$("#outputDel").hide();
		$("#outputList").hide();
	});

	$("#gestionBrad").click(function() {
		if(!hidden) {
			$("#hrBis").hide();
			$("#addBraderie").hide();
			$("#delBraderie").hide();
			$("#listValid").hide();
			$("#output").hide();
			$("#outputAdd").hide();
			$("#outputList").hide();
			$("#outputDel").hide();
			$("#outputValid").hide();
			hidden = true;
		} else {
			$("#hrBis").show();
			$("#addBraderie").show();
			$("#delBraderie").show();
			$("#listValid").show();
			hidden = false;
		}
	});

	// AJOUTER UNE BRADERIE
	$("#add #submit").click(function() {
		var handic = function() {
			if($("#handicY").attr('checked', true)) {
				return true;
			} else {
				return false;
			}
		}
		var dat = {
			libelle : $("#inputLibelle").val(),

			nomOrganisateur: $("#inputNomBroc").val(),
			emailOrganisateur: $("#inputMailBroc").val(),
			telOrganisateur: $("#inputTelBroc").val(),

			pays: $("#inputPays").val(),
			departement: $("#inputDepart").val(),
			codePostal: $("#inputCPostal").val(),
			ville: $("#inputVille").val(),
			rue : $("#inputAddr1").val()+" "+$("#inputAddr2").val()+" "+$("#inputAddr3").val()+" "+$("#inputAddr4").val(),

			date: $("#inputDate").val(),
			heure_debut : $("#inputHDeb").val(),
			heure_fin : $("#inputHFin").val(),

			salle: $("#inputSalle").val(),
			handicape : handic,
			prixEmplacement : $("#inputPrix").val(),
			valide: false
		};
		console.log(dat);

		$.ajax({
			url: uri,
			type: "POST",
			dataType: "json",
			processData: false,
			contentType: "application/json; charset=UTF-8",
			data: JSON.stringify(dat),
			success: function(json) {
				$("#output").html("Brocante ajoutée !");
			},
			error: function(xhr, status, errorThrown) {
				alert("Something went wrong");
				console.log("xhr: ", xhr);
				console.log("status: ", status);
				console.log("errorThrown: ", errorThrown);
			},
		});
		$('#outputAdd #inputLibelle').val("");
		$('#outputAdd #inputNomBroc').val("");
		$('#outputAdd #inputMailBroc').val("");
		$('#outputAdd #inputTelBroc').val("");
		$('#outputAdd #inputPays').val("");
		$('#outputAdd #inputDepart').val("");
		$('#outputAdd #inputCPostal').val("");
		$('#outputAdd #inputVille').val("");
		$('#outputAdd #inputRue').val("");
		$('#outputAdd #inputDate').val("");
		$('#outputAdd #inputHDeb').val("");
		$('#outputAdd #inputHFin').val("");
		$('#outputAdd #inputSalle').val("");
		$('#outputAdd #handicY').attr('checked', false);
		$('#outputAdd #handicN').attr('checked', false);
		$('#outputAdd #inputPrix').val("");
	});

	// BOUTTON SUPPRIMER UNE BRADERIE
	$("#delBraderie").click(function() {
		$("#outputAdd").hide();
		$("#outputDel").show();
		$("#outputList").hide();
		$("#map").hide();
		$("#outputValid").hide();
		showDelete();
	});

	// DELETE BRADERIE AVEC ID
	function deleteId(idx) {
		$.ajax({
			url: "v1/brocante/"+idx,
			type: "DELETE",
			success: function(json) {
				showDelete();	
			},
			error: function(xhr, status, errorThrown) {
				alert("Something went wrong");
				console.log("xhr: ", xhr);
				console.log("status: ", status);
				console.log("errorThrown: ", errorThrown);
			}
				
		});							
	};

	// AFFICHER LA LISTE DES BRADERIE A SUPPRIMER
	function showDelete () {
		var res = "<div><table class=\"table table-striped table-bordered\" style=\"text-align:center\"><tr><td><b>Id brocante</b></td><td><b>Libelle brocante</b></td><td></td></tr><tr>";
		$.ajax({
			url: "/v1/brocante",
			type: "GET",
			dataType: "json",
			success: function(json) {
				if(json[0] == null) {
					$("#outputDel").html("Aucune brocante à supprimer.");
				} else {
					for(i in json) {
						var id = json[i].id;
						var lib = json[i].libelle;
						res+="<td>"+id+"</td><td>"+lib+"</td><td>"+"<button class=\"glyphicon glyphicon-remove\" id='delete-" + id + "' type='button'\"></button></tr><tr>";
						$("#delete-" + id).text("sjfdbsd");
						$("#delete-" + id).click(function () {
							deleteId(id);
						});
					}
					res+="</tr></table></div>";
					$("#outputDel").html(res);
					for(i in json) {
						var id = json[i].id;
						$("#delete-" + id).click(function () {
							deleteId(id);
						});
					}
				}
			}
		});
	};

	// RECUPERER LES INFORMATIONS DES BRADERIES
	function getInformationBraderie (){
		$.ajax({
			url: "/v1/brocante",
			type: "GET",
			dataType: "json",
			success: function(json) {
				if(json[0] == null) {
					//a afficher il n'y a pas de braderie aux alentours
				} else {
					for(i in json) {
						var info = [json[i].codePostal, json[i].ville, json[i].rue, json[i].date, json[i].heure_debut, json[i].heure_fin];
						braderies.push(info);
    				}
    				getGeolocalisations();
				}
			},
			error: function(xhr, status, errorThrown) {
				alert("Something went wrong");
				console.log("xhr: ", xhr);
				console.log("status: ", status);
				console.log("errorThrown: ", errorThrown);
			}
		});
	}

	// RECUPERER LA LATITUDE ET LA LONGITUDE D'UNE BRADERIE
	function getGeolocalisations(){	
		//console.log(braderies);
		//for(var i; i < braderies.length; i++){
			//console.log(braderies[0]);
			console.log(braderies[0]);
			$.ajax({
				url: "https://maps.googleapis.com/maps/api/geocode/json?address="+braderies[0].rue +",+" + braderies[0].ville + ",+"+braderies[0].codePostal,
				type: "GET",
				dataType: "json",
				success: function(json) {
					console.log(json);
				},
				error: function(xhr, status, errorThrown) {
					alert("Something went wrong");
					console.log("xhr: ", xhr);
					console.log("status: ", status);
					console.log("errorThrown: ", errorThrown);
				}
			});
		//}
	};

	// INITIALISE LA MAP
	function initializeMap() {
		var mapDiv = document.getElementById('map');
		var map = new google.maps.Map(mapDiv, {
		  center: {lat: 44.540, lng: -78.546},
		  zoom: 15
		});

        var infoWindow = new google.maps.InfoWindow({map: map});
		  // Try HTML5 geolocation.
		if (navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(function(position) {
		     	var pos = {
		        lat: position.coords.latitude,
		        lng: position.coords.longitude
		     };
		    infoWindow.setPosition(pos);
		    infoWindow.setContent('Vous êtes ici.');
		    map.setCenter(pos);
		    }, function() {
		      handleLocationError(true, infoWindow, map.getCenter());
		    });
		} else {
		    // Browser doesn't support Geolocation
		    handleLocationError(false, infoWindow, map.getCenter());
		}
	};

	// EXCEPTION DE L'INITALISATION DE LA MAP
	function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	 	infoWindow.setPosition(pos);
	 	infoWindow.setContent(browserHasGeolocation ?'Error: The Geolocation service failed.' :'Error: Your browser doesn\'t support geolocation.');
	}

	// BOUTON LISTE BROCANTES NON VALIDEES
	$('#listValid').click(function() {
		$("#outputAdd").hide();
		$("#outputDel").hide();
		$("#outputList").hide();
		$("#map").hide();
		$("#outputValid").show();
		showValid();
	});

	function showValid() {		
		$.ajax({
			url: "/v1/brocante",
			type: "GET",
			dataType: "json",
			success: function(json) {
				if(json[0] == null) {
					$('#outputValid').html("Aucune brocante à valider");
				} else {
					for(i in json) {
						var id = json[i].id;
						var lib = json[i].libelle;
						var valid = json[i].valide;
						var res;
						if(valid == "false") {
							res = "<div><table class=\"table table-striped table-bordered\" style=\"text-align:center\"><tr><td><b>Id brocante</b></td><td><b>Libelle brocante</b></td><td></td></tr><tr>";
							res+="<td>"+id+"</td><td>"+lib+"</td><td>"+"<button class=\"glyphicon glyphicon-ok\" id='valid-" + id + "' type='button'\"></button></tr><tr>";
							res+="</tr></table></div>";
						} else {

						}
					}
					$("#outputValid").html(res);
					for(i in json) {
						var id = json[i].id;
						$("#valid-" + id).click(function () {
							validId(id);
						});
					}
				}
			},
			error: function(xhr, status, errorThrown) {
				alert("Something went wrong");
				console.log("xhr: ", xhr);
				console.log("status: ", status);
				console.log("errorThrown: ", errorThrown);
			}
		});

		function validId(idx) {
			uri="/v1/brocante/valider/"+idx
			$.ajax({
				url: uri,
				type: "GET",
				dataType: "json",
				success: function(json) {
					showValid();
				},
				error: function(xhr, status, errorThrown) {
					alert("Something went wrong");
					console.log("xhr: ", xhr);
					console.log("status: ", status);
					console.log("errorThrown: ", errorThrown);
				}				
			});
			uri="/v1/brocante";
		};
	}
});