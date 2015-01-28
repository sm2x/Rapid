
/* This file is auto-generated on application load and save - it is minified when the application status is live */


/* Control and Action resource JavaScript */


/* Page control resource JavaScript */

function Event_error(eventName, controlId, ex) {
	if (controlId) {
		alert("Error in " + eventName + " event for control " + controlId + "  " + ex);
	} else {
		alert("Error in " + eventName + " event for page " + ex);
	}
}

/* Data store control resource JavaScript */

function getDataStoreData(id, details, field) {
	var data;
	switch (details.storageType) {
		case "L":
			// use localStorage
			if (!localStorage[_appId + "_" + id]) localStorage[_appId + "_" + id] = "{}";
			// get the data string
			var dataString = localStorage[_appId + "_" + id];
			// get data
			data = JSON.parse(dataString);				
		break;
		case "S": 
			// use sessionStorage
			if (!sessionStorage[_appId + "_" + id]) sessionStorage[_appId + "_" + id] = "{}";
			// get the data string
			var dataString = sessionStorage[_appId + "_" + id];
			// get data
			data = JSON.parse(dataString);
		break;
		case "P": 
			// instansiate an object in the page if there isn't one
			if (!window[id + "datastore"]) window[id + "datastore"] = {};
			// use the in page object
			data = window[id + "datastore"];
		break;
	}  
	// return it	
	return data;
}	                

function saveDataStoreData(id, details, data) {
	switch (details.storageType) {
		case "L":
			// use localStorage
			localStorage[_appId + "_" + id] = JSON.stringify(data);			
		break;
		case "S": 
			// use sessionStorage
			sessionStorage[_appId + "_" + id] = JSON.stringify(data);
		break;
		case "P": 
			// instansiate an object in the page if there isn't one
			window[id + "datastore"] = data;
		break;
	}
	var f = window["Event_change_" + id];
	if (f) f($.Event("change"));
}

/* Gallery control resource JavaScript */

function Gallery_removeImage(ev, id) {
	// confirm
	if (confirm("Remove image?")) {
		// get the image
		var img = $(ev.target);
		// tell Rapid Mobile an image has been removed
		if (typeof _rapidmobile != "undefined") _rapidmobile.removeImage(id, img.attr("src")); 
		// remove it
		img.remove();
		// look for our custom imageRemoved handler for this control
		var imageRemoved = window["Event_imageRemoved_" + id];
		// fire it if we found it
		if (imageRemoved) window["Event_imageRemoved_" + id]();
	}
}

/* Grid control resource JavaScript */

function getGridDataStoreData(id, details) {
	data = null;
	switch (details.dataStorageType) {
		case "L" :
			var dataString = localStorage[_appId + id];
			if (dataString) data = JSON.parse(dataString);
		break;
		case "S" :
			var dataString = sessionStorage[_appId + id];
			if (dataString) data = JSON.parse(dataString);
		break;
	}
	return data;
}

function saveGridDataStoreData(id, details, data) {
	switch (details.dataStorageType) {
		case "L" :
			localStorage[_appId + id] = JSON.stringify(data);
		break;
		case "S" :
			sessionStorage[_appId + id] = JSON.stringify(data);
		break;
	}
}

/* Link control resource JavaScript */

function linkClick(url, sessionVariablesString) {
	
	var sessionVariables = JSON.parse(sessionVariablesString);
	
	for (var i in sessionVariables) {
	
		var item = sessionVariables[i];
		
		if (item.type) {
		
			var value = window["getData_" + item.type](null, item.itemId, item.field, item.details);
			
		} else {
		
			var value = $.getUrlVar(item.itemId);
		
		}
	
		if (value !== undefined) url += "&" + item.name + "=" + value;
	}
	
	window.location = url;
	
}

/* Map control resource JavaScript */

// an array to manage the in-page maps	                
_maps = [];	    

// adds markers to a map, used by add markers and replace markers
function addMapMarkers(map, data, details) {
	map.markerSelectedIndex = -1;
	var latIndex = -1;
	var lngIndex = -1;
	var titleIndex = -1;
	var infoIndex = -1;
	for (var i in data.fields) {
		if (data.fields[i].toLowerCase().indexOf("lat") == 0) {
			latIndex = i; 
		} else if (data.fields[i].toLowerCase().indexOf("lng") == 0 || data.fields[i].toLowerCase().indexOf("lon") == 0 ) {
			 lngIndex = i;
		} else if (data.fields[i].toLowerCase().indexOf("title") == 0) {
			 titleIndex = i;
		} else if (data.fields[i].toLowerCase().indexOf("info") == 0) {
			 infoIndex = i;
		}
	}
	if (latIndex > -1 && lngIndex > -1) {
		for (var i in data.rows) {
			var row = data.rows[i];
			var lat = row[latIndex];
			var lng = row[lngIndex];
			var markerOptions = {
				map: map,
				position: new google.maps.LatLng(lat, lng)				
			};
			if (titleIndex > -1) markerOptions.title = row[titleIndex];
			if (details.markerImage) markerOptions.icon = "applications/" + _appId + "/" + _appVersion + "/" + details.markerImage;
			var marker = new google.maps.Marker(markerOptions);	
			marker.index = map.markers.length + i*1;
			marker.data = {fields:data.fields,rows:[data.rows[i]]};
			map.markers.push(marker);					
			if (infoIndex > -1) {
				var markerInfoWindow = new google.maps.InfoWindow({
					content: row[infoIndex]
				});
				google.maps.event.addListener(marker, 'click', function() {
				    markerInfoWindow.open(map,marker);
				});
			}
			if (details.markerClickFunction) {
				google.maps.event.addListener(marker, 'click', function() {
					map.markerSelectedIndex = marker.index;
				    window[details.markerClickFunction]($.Event('markerclick'));
				});
			}
		}
	}
}

/* Slide panel control resource JavaScript */

//JQuery is ready! 
$(document).ready( function() {
	
	$(window).resize(function(ex) {
	
		if (typeof(window.parent._pageIframe) === "undefined") {
	
			var doc = $(document);
			var panel = $(".slidePanelPane");
			
			panel.css("height",doc.height() - panel.offset().top);
			
			var win = $(window);
						
			// resize the page cover
			$(".slidePanelCover").css({
	       		width : win.width(),
	       		height : win.height()
	       	});
	       	
	    } else {
	    
	    	// get the page iframe
	    	var _pageIframe = window.parent._pageIframe;
	    	// get the scale
	    	var _scale = window.parent._scale;
	    		    		    
	    	// resize the page cover
			$(".slidePanelCover").css({
	       		width : _pageIframe.width() / _scale,
	       		height : _pageIframe.height() / _scale
	       	});
	    
	    }
       	      		
	});
	
});

/* Database action resource JavaScript */

// this global associative array tracks the databaseAction call sequences for each action	    			
var _databaseActionSequence = [];	    

// this global associative array holds the greates sequence received back     			
var _databaseActionMaxSequence = [];	

// this function returns an incrementing sequence for each database action call so long-running slow queries don't overrwrite fast later queries
function getDatabaseActionSequence(actionId) {
	// retrieve the current sequence for the action
	var sequence = _databaseActionSequence[actionId];
	// if null set to 0
	if (!sequence) sequence = 0
	// increment
	sequence++;
	// store
	_databaseActionSequence[actionId] = sequence;
	// pass back
	return sequence;
}		

// this function sets the max to 0 if null
function getDatabaseActionMaxSequence(actionId) {
	// retrieve the current sequence for the action
	var sequence = _databaseActionMaxSequence[actionId];
	// if undefined
	if (sequence === undefined) {
		// set to 0
		sequence = 0;
		// retain for next time
		_databaseActionMaxSequence[actionId] = sequence;
	}
	// pass back
	return sequence;
}	

// this function creates input data for the database action
function getDatabaseActionInputData(multiRow, inputs, sourceId, sourceData) {
	// start data object
	var data = {};
	// check multirow
	if (multiRow) {
		// check there are sourceData rows
		if (sourceData && sourceData.fields && sourceData.rows && sourceData.fields.length > 0 && sourceData.rows.length > 0) {
			// add a fields collection
			data.fields = [];
			// loop the inputs
			for (var i in inputs) {
				// the field we want to send is the source id plus the field, this matches how we do non multi row queries
				data.fields.push(sourceId + "." + inputs[i]);
			}
			// add a rows collection
			data.rows = [];
			// loop the sourceData rows
			for (var i in sourceData.rows) {
				// get the source row
				var sourceRow = sourceData.rows[i];
				// make a row for our return
				var row = [];
				// now loop the inputs
				for (var j in inputs) {
					// get the input field
					var field = inputs[j];
					// assume we can't find the field we want
					var fieldIndex = -1;
					// loop the source fields looking for the position of the field we want
					for (var k in sourceData.fields) {
						if (field.toLowerCase() == sourceData.fields[k].toLowerCase()) {
							// set the fieldIndex
							fieldIndex = k;
							// we're done
							break;
						}
					}
					// if we found the field
					if (fieldIndex > -1) {
						row.push(sourceRow[fieldIndex]);
					} else {
						row.push(null);
					}
				}
				// add the row
				data.rows.push(row);
			}
		} else {
			// add a dummy row 
			data.rows = [];
			data.rows.push([]);
		}
	} else {
		// not multirow so add fields 
		data.fields = [];
		// add a single row for the values
		data.rows = [];
		data.rows.push([]);
		// loop the inputs and add id as field, value as row
		for (var i in inputs) {
			var input = inputs[i];
			data.fields.push(input.id);
			data.rows[0].push(input.value);
		}
	}
	// return data
	return data
}

/* Webservice action resource JavaScript */

// this global associative array tracks the webserviceAction call sequences for each action	    			
var _webserviceActionSequence = [];	    

// this global associative array holds the greates sequence received back     			
var _webserviceActionMaxSequence = [];	

// this function returns an incrementing sequence for each database action call so long-running slow queries don't overrwrite fast later queries
function getWebserviceActionSequence(actionId) {
	// retrieve the current sequence for the action
	var sequence = _webserviceActionSequence[actionId];
	// if null set to 0
	if (!sequence) sequence = 0
	// increment
	sequence++;
	// store
	_webserviceActionSequence[actionId] = sequence;
	// pass back
	return sequence;
}	

// this function sets the max to 0 if null
function getWebserviceActionMaxSequence(actionId) {
	// retrieve the current sequence for the action
	var sequence = _webserviceActionMaxSequence[actionId];
	// if undefined
	if (sequence === undefined) {
		// set to 0
		sequence = 0;
		// retain for next time
		_webserviceActionMaxSequence[actionId] = sequence;
	}
	// pass back
	return sequence;
}


/* Control initialisation methods */


function Init_date(id, details) {
  A_TCALCONF.format = details.dateFormat;	     
  f_tcalAdd (id);
}

function Init_gallery(id, details) {
  $("#" + id).children("img").click( function(ev) {
  	Gallery_removeImage(ev, id);
  });
}

function Init_grid(id, details) {
  if (details && details.dataStorageType) {
  	var data = getGridDataStoreData(id, details);
  	if (data) setData_grid($.Event('gridinit'), id, null, details, data);
  	$("#" + id).click(function(ev) {
  		var data = getGridDataStoreData(id, details);
  		data.selectedRowNumber = $(ev.target).closest("tr").index();
  		saveGridDataStoreData(id, details, data);
  	});
  }
}

function Init_hints(id, details) {
  var body = $("body");
  	    	
  for (var i in details.controlHints) {
  
  	var controlHint = details.controlHints[i];
  	
  	if (!$("#" + controlHint.controlId + "hint")[0]) {
  	
  		var style = controlHint.style;
  		if (style) {
  			style = " style='" + style + "'";
  		} else {
  			style = "";
  		}
  		
  		body.append("<span class='hint' id='" + controlHint.controlId + "hint'" + style + ">" + controlHint.text + "</span>");
  		
  		$("#" + controlHint.controlId + "hint").hide();
  		
  	}
  		
  	$("#" + controlHint.controlId).mouseout({controlId: controlHint.controlId}, function(ev) {
  		$("#" + ev.data.controlId + "hint").hide();
  	});
  		
  	switch (controlHint.type) {		
  		case "click" :
  			$("#" + controlHint.controlId).click({controlId: controlHint.controlId}, function(ev) { 
  				$("#" + ev.data.controlId + "hint").css({
  					left: ev.pageX + 5,
  					top: ev.pageY + 5
  				}).show(); 
  			});
  			break;
  		case "hover" :
  			$("#" + controlHint.controlId).mouseover({controlId: controlHint.controlId}, function(ev) { 
  				$("#" + ev.data.controlId + "hint").css({
  					left: ev.pageX + 5,
  					top: ev.pageY + 5
  				}).show();  
  			});
  		break;
  	}
  	
  }
}

function Init_map(id, details) {
  // if google has loaded - might not if offline
  if (window["google"]) {
  
  	// make the zoom a number
  	var zoom = parseInt(details.zoom);	 
  	
  	// assume we want a roadmap
  	var mapTypeId =  google.maps.MapTypeId.ROADMAP;
  	
  	// update if one provided
  	switch (details.mapType) {
  		case ("R") :
  			mapTypeId =  google.maps.MapTypeId.ROADMAP;
  		break;
  		case ("S") :
  			mapTypeId =  google.maps.MapTypeId.SATELLITE;
  		break;
  	} 
  	
  	// create a map in our control object
  	var map = new google.maps.Map($("#" + id)[0], {
  	   	zoom: zoom,
  		center: new google.maps.LatLng(details.lat, details.lng),
  		mapTypeControlOptions: {mapTypeIds:[google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE]},
  		mapTypeId: mapTypeId,
  		mapTypeControl: details.showMapType,
  		zoomControl: details.showZoom,	   	
  	   	panControl: details.showPan,
  	   	streetViewControl: details.showStreetView,
  	   	scaleControl: details.showScale
  	});
  	
  	// add it to the collections
  	_maps[id] = map;
  	
  	// turn off the labels for all points of interest
  	map.setOptions({'styles':[{featureType:"poi",elementType: "labels",stylers:[{visibility:"off"}]}]});
  	
  	// get any map click event listener
  	var f_click = window["Event_mapClick_" + id];
  	// if there is a map click event listner
  	if (f_click) {
  		// attach a listener to the mapClick event
  		google.maps.event.addListener(map, 'click', function() {
  			// fire mapClick event
      		f_click($.Event("mapClick"));
  		});
  	}
  	
  	// get any map drag start event listener
  	var f_dragStart = window["Event_dragStart_" + id];
  	// if there is a map drag event listener
  	if (f_dragStart) {
  		// attach a listener to the dragstart event
  		google.maps.event.addListener(map, 'dragstart', function() {
  			// fire touch event
      		f_dragStart($.Event("drag"));
  		});
  	}
  	
  	// get any map drag end event listener
  	var f_dragEnd = window["Event_dragEnd_" + id];
  	// if there is a map drag event listener
  	if (f_dragEnd) {
  		// attach a listener to the dragstart event
  		google.maps.event.addListener(map, 'dragend', function() {
  			// fire touch event
      		f_dragEnd($.Event("drag"));
  		});
  	}
  	
  } else {
  
  	$("#" + id).html("Map not available");
  
  }
}

function Init_pagePanel(id, details) {
  var bodyHtml = "<center><h1>Page</h1></center>";
  
  // request the page		
  $.ajax({
     	url: "~?a=" + details.appId + "&v=" + details.version + "&p=" + details.pageId + "&action=dialogue",  // reuse the design link hiding from dialogues
     	type: "GET",          
         data: null,        
         error: function(server, status, error) { 
         	var bodyHtml = "Error loading page : " + error; 
         },
         success: function(page) {
         	
         // if the page can't be found a blank response is sent, so only show if we got something
         if (page) {
         	
         		// empty the body html
         		bodyHtml = "";
         		script = "";
         		
             	// loop the items
             	var items = $(page);
             	for (var i in items) {
             		// check for a script node
             		switch (items[i].nodeName) {
             		case "#text" : case "TITLE" : case "META" : // ignore these types
             		break;
             		case "SCRIPT" :
             			if (items[i].innerHTML) {
             				script += items[i].outerHTML; // ignore SCRIPT links
             			}
             		break;
             		case "LINK" :
             			var href = $(items[i].outerHTML).attr("href");
             			if (!$("head").children("[href='" + href + "']")[0]) { // ignore if link already present in document head
             				bodyHtml += items[i].outerHTML;
             			}           			
             		break;
             		default :
             			if (items[i].outerHTML) {
             				// retain the script in our body html
             				bodyHtml += items[i].outerHTML;        				
             			}
             		break;
             		}
             	}   
             	// apply the injected html
             	$("#" + id).html(bodyHtml);
             	// add script into the page (if applicable)
             	if (script) $("#" + id).append(script);
             	// fire the window resize event
             	$(window).resize();
             	           	        	            	            	            
      	}        	       	        	        	        	        		
      }       	        	        
  });
}

function Init_slidePanel(id, details) {
  // get a reference to the body
  var body = $("body");
  // get the pageCover
  var pageCover = body.find(".slidePanelCover");
  // if we don't have one
  if (!pageCover[0]) {
  	// add one
  	body.append("<div class='slidePanelCover'></div>");
  	// set the reference
  	pageCover = body.find(".slidePanelCover");
  	// get a reference to the window
  	var win = $(window);	
  	// size the cover
  	pageCover.css({
      	width : win.width(),
         	height : win.height()
      });
  }
  
  // get a reference to the slidePanel
  var slidePanel = $("#" + id);
  // get the slidePanelPaneId
  var slidePanelPaneId = slidePanel.attr("data-pane");
  // get the pane
  var slidePanelPane = $("#" + slidePanelPaneId);
  
  // show or hide the page cover if panel is visible
  if (slidePanelPane.is(":visible")) {
  	pageCover.show();
  } else {
  	pageCover.hide();
  }
  
  // add the opener listener	       
  slidePanel.click({width: slidePanelPane.css("width"),left: slidePanelPane.css("margin-left")}, function(ev) {
  	// get the stored width
  	var width = ev.data.width
  	// get any existing left margin
  	var left = ev.data.left;
  	// check visibility
  	if (slidePanelPane.is(":visible")) {
  		// animate off-screen
  		slidePanelPane.animate({"margin-left": "-" + width}, 500, function() {
  			// hide when complete
  			slidePanelPane.hide();
  			// toggle open closed
  			slidePanel.removeClass("slidePanelOpen");
  			slidePanel.addClass("slidePanelClosed");	
  			// hide the page cover
  			pageCover.hide();		
  		});		
  	} else {
  		// set off screen
  		slidePanelPane.css({"margin-left": "-" + width}).show();
  		// animate to full width
  		slidePanelPane.animate({"margin-left": 0}, 500);		
  		// toggle open closed
  		slidePanel.removeClass("slidePanelClosed");
  		slidePanel.addClass("slidePanelOpen");
  		// show the page cover	
  		pageCover.show();
  	}
  });	        
  
  // add the cover listener
  pageCover.click({width: slidePanelPane.css("width"),left: slidePanelPane.css("margin-left")}, function(ev){
  	// get the stored width
  	var width = ev.data.width
  	// get any existing left margin
  	var left = ev.data.left;
  	// animate off-screen
  	slidePanelPane.animate({"margin-left": "-" + width}, 500, function() {
  		// hide when complete
  		slidePanelPane.hide();
  		// toggle open closed
  		slidePanel.removeClass("slidePanelOpen");
  		slidePanel.addClass("slidePanelClosed");	
  		// hide the page cover
  		pageCover.hide();		
  	});
  });
}

function Init_tabGroup(id, details) {
  $("#" + id).children("ul").children("li").each( function() {
  
  	// get a reference to the tabs group
  	var tabs = $("#" + id);
  	// assume horizontal
  	horizontal = true;
  	// check for vertical
  	if (window[id + "details"] && window[id + "details"].tabType == "V") horizontal = false;
  	// apply extra class if horizontal
  	if (horizontal) {
  		tabs.children("ul").addClass("tabsHeaderH");
  	} else {
  		tabs.children("ul").addClass("tabsHeaderV");
  	}
  
  	$(this).click( function(ev, index) {		
  		// remove selected from all tab header items
  		tabs.children("ul").children("li").removeClass("selected");
  		// remove selected from all tab body items and hide
  		tabs.children("div").removeClass("selected").css("display","none");
  		// add selected to the li we just clicked on, also get it's index, plus 2, 1 to go from zero to 1 based, the other 1 because of the headers
  		var index = $(this).addClass("selected").index() + 2;
  		// apply selected to the correct body
  		tabs.children("div:nth-child(" + index + ")").addClass("selected");
  		// check the type
  		if (horizontal) {
  			// selected tab is display block
  			tabs.children("div.selected").css("display","block");			
  		} else {
  			// selected tab is table cell
  			tabs.children("div.selected").css("display","table-cell");
  		}		
  	});
  });
}


/* Control getData and setData methods */


function getData_checkbox(ev, id, field, details) {
  return $("#" + id).prop("checked") ? "true" : "false";
}

function setData_checkbox(ev, id, field, details, data, changeEvents) {
  var control = $("#" + id);	      
  var value = false;  
  if (data != null && data !== undefined) {	
  	data = makeDataObject(data, field);
  	if (data.rows && data.rows[0]) {	        		
  		if (field && data.fields) {
  			for (var i in data.fields) {
  				if (data.fields[i].toLowerCase() == field.toLowerCase()) {
  					value = data.rows[0][i];
  					break;
  				}
  			}
  		} else {
  			value = data.rows[0][0];
  		}
  	} 
  }
  control.prop('checked', value);
  if (changeEvents) control.trigger("change");
}

function getData_dataStore(ev, id, field, details) {
  var data = getDataStoreData(id, details, field);
  if (data) {		
  	if (data.rows && data.fields) {
  		if (data.rows[0] && field) {
  			for (var i in data.fields) {
  				if (data.fields[i].toLowerCase() == field.toLowerCase()) {
  					return data.rows[0][i];
  				}
  			}
  			return null;
  		} else {
  			return data;
  		}
  	} else if (field && data[field]) {
  		return data[field];
  	} else {
  		return null;
  	}
  }	 
  return data;
}

function setData_dataStore(ev, id, field, details, data, changeEvents) {
  if (details.id) id = details.id;
  if (data != null && data !== undefined) {
  	data = makeDataObject(data, field);
  	saveDataStoreData(id, details, data);
  } else {
  	saveDataStoreData(id, details, null);
  }
}

function getProperty_dataStore_selectedRowData(ev, id, field, details) {
  var data = getDataStoreData(id, details);
  if (data && data.selectedRowNumber && data.rows && data.rows[data.selectedRowNumber - 1]) {
  	return {fields:data.fields,rows:[data.rows[data.selectedRowNumber - 1]]};
  }
}

function setProperty_dataStore_selectedRowData(ev, id, field, details, data, changeEvents) {
  var dataStoreData = getDataStoreData(id, details);	                
  if (dataStoreData && dataStoreData.selectedRowNumber) {	
  	data = makeDataObject(data, field);
  	if (data && data.rows) {
  		dataStoreData.rows[dataStoreData.selectedRowNumber] = data.rows[0][0];
  		saveDataStoreData(id, details, dataStoreData);
  	}
  }
}

function getProperty_dataStore_selectedRowNumber(ev, id, field, details) {
  var data = getDataStoreData(id, details);
  if (data) return data.selectedRowNumber;
}

function setProperty_dataStore_selectedRowNumber(ev, id, field, details, data, changeEvents) {
  var dataStoreData = getDataStoreData(id, details);	                
  if (dataStoreData) {	
  	data = makeDataObject(data, field);
  	if (data && data.rows) {
  		dataStoreData.selectedRowNumber = data.rows[0][0];
  		saveDataStoreData(id, details, dataStoreData);
  	}
  }
}

function getProperty_dataStore_rowCount(ev, id, field, details) {
  var dataStoreData = getDataStoreData(id, details);
  if (dataStoreData && dataStoreData.rows) return dataStoreData.rows.length;
}

function setProperty_dataStore_append(ev, id, field, details, data, changeEvents) {
  var dataStoreData = getDataStoreData(id, details);
  if (dataStoreData) {
  	data = makeDataObject(data, field);
  	if (data && data.rows) {
  		if (!dataStoreData.fields) dataStoreData.fields = data.fields;
  		if (!dataStoreData.rows) dataStoreData.rows = []; 
  		for (var i in data.rows) dataStoreData.rows.push(data.rows[i]);
  		saveDataStoreData(id, details, dataStoreData);
  	}	
  }
}

function getData_date(ev, id, field, details) {
  return $("#" + id).val();
}

function setData_date(ev, id, field, details, data, changeEvents) {
  var control = $("#" + id);
  var value = "";
  if (data != null && data !== undefined) {	
  	data = makeDataObject(data, field);
  	if (data.rows && data.rows[0]) {	        		
  		if (field && data.fields) {
  			for (var i in data.fields) {
  				if (data.fields[i].toLowerCase() == field.toLowerCase()) {
  					value = data.rows[0][i];
  					break;
  				}
  			}
  		} else {
  			value = data.rows[0][0];
  		}
  	} 
  }      
  if (value) {
  	var date = f_tcalParseDate(value,'Y-m-d');
  	if (date) value = f_tcalGenerateDate(date, details.dateFormat);
  }
  control.val(value);
  if (changeEvents) control.trigger("change");
}

function getData_dropdown(ev, id, field, details) {
  return $("#" + id).val();
}

function setData_dropdown(ev, id, field, details, data, changeEvents) {
  if (data != null && data !== undefined) {
  	var control = $("#" + id);
  	data = makeDataObject(data, field);
  	if (data.rows && data.fields) {
  		if (field && data.rows[0]) {	      
  			var foundField = false;  	
  			for (var i in data.fields) {
  				if (field.toLowerCase() == data.fields[i].toLowerCase()) {
  					control.val(data.rows[0][i]);
  					if (changeEvents) control.trigger("change");
  					foundField = true;
  					break;
  				}
  			}				
  			if (!foundField) control.val(data.rows[0][0]);
  		} else {
  			for (var i in data.rows) {
  				var row = data.rows[i];		
  				var text = "";
  				var value = "";
  				if (data.fields) {
  					for (var j in data.fields) {
  						if (data.fields[j].toLowerCase() == "text") text = data.rows[i][j];
  						if (data.fields[j].toLowerCase() == "value") value = data.rows[i][j];
  					}
  				}
  				if (!text) text = row[0];
  				if (!value && row[1]) value = row[1];
  				if (value || value == "0") value = 	" value='" + value + "'";
  				control.append("<option " + value + ">" + text + "</option>");
  			}	
  		}
  	} 
  }
}

function getData_gallery(ev, id, field, details) {
  var data = {fields:["url"],rows:[]};
  var control = $("#" + id);
  var images = control.children("img");
  images.each( function(i) {
  	var url = $(this).attr("src");
  	data.rows.push([url]);
  });
  return data;
}

function setData_gallery(ev, id, field, details, data, changeEvents) {
  if (data != null && data !== undefined) {
  	var control = $("#" + id);
  	data = makeDataObject(data, field);
  	if (data.rows) {	
  		// remove the no pictures message
  		control.find("span").remove();
  		// look for url or urls in the fields or use the first column if not found	
  		var urlIndex = 0;
  		if (data.fields) {
  			for (var i in data.fields) {
  				if (data.fields[i] == "url" || data.fields[i] == "urls") {
  					urlIndex = i;
  					break;
  				}
  			}
  		}			
  		// loop the rows
  		for (var i in data.rows) {
  			// allow comma seperated list of urls in single field too
  			var urls = data.rows[i][urlIndex].split(",");
  			// loop the urls
  			for (var j in urls) {
  				var url = urls[j];
  				control.append("<img src='" + url  + "'></img>");
  				control.find("img").last().click( function(ev) {
  					Gallery_removeImage(ev, id);				
  				});
  				// look for our custom imageAddedEvent handler for this control
  				var imageAdded = window["Event_imageAdded_" + id];
  				// fire it if we found it
  				if (imageAdded) window["Event_imageAdded_" + id]();
  			}			
  		}
  	} 
  }
}

function getProperty_gallery_imageCount(ev, id, field, details) {
  return ($("#" + id).children("img").size());
}

function getProperty_gallery_urls(ev, id, field, details) {
  var urls = "";
  var control = $("#" + id);
  var images = control.children("img");
  images.each( function(i) {
  	var url = $(this).attr("src");
  	if (url) {
  		urls += url.replace("http://cache/","");
  		if (i < images.length - 1) urls += ",";
  	}
  });
  if (urls) {
  	return urls;
  } else {
  	return null;
  }
}

function getData_grid(ev, id, field, details) {
  var data = null;
  if (details) {
  	if (details.dataStorageType) {
  		data = getGridDataStoreData(id, details);
  	} else if (details.columns) {
  		if (field) {		
  			var row = $(ev.target).closest("tr");
  			var rowIndex = row.index() - 1;
  			if (rowIndex >= 0) {
  				for (var i in details.columns) {
  					if (details.columns[i].field.toLowerCase() == field.toLowerCase()) {
  						data = row.children(":nth(" + i + ")").html();
  						break;
  					}
  				}
  			}	    
  		} else {
  			var data = {};
  			data.fields = [];		
  			for (var i in details.columns) {	
  				data.fields.push(details.columns[i].field);		
  			}
  			data.rows = [];
  			$("#" + id).find("tr:not(:first)").each(function(i) {
  				var row = [];
  				$(this).children().each(function(i) {
  					row.push($(this).html());
  				});
  				data.rows.push(row);
  			});
  		}	
  	}
  }
  return data;
}

function setData_grid(ev, id, field, details, data, changeEvents) {
  var control = $("#" + id);
  control.find("tr:not(:first)").remove();	        
  if (data != null && data !== undefined) {	
  	data = makeDataObject(data, field);
  	if (data.rows) {	        		
  		if (details && details.columns && data.fields) {
  			var columnMap = [];
  			for (var i in details.columns) {				
  				for (var j in data.fields) {
  					var found = false;
  					if (details.columns[i].field) {
  						if (details.columns[i].field.toLowerCase() == data.fields[j].toLowerCase()) found = true;
  					} else {
  						if (!data.fields[j]) found = true;
  					}
  					if (found) {
  						columnMap.push(j);
  						break;
  					}
  				}
  				// added the column to the map
  				if (columnMap.length == i) columnMap.push("");
  				// if we have cellFunction JavaScript, and it hasn't been turned into a function object yet
  				if (details.columns[i].cellFunction && !details.columns[i].f) details.columns[i].f = new Function(details.columns[i].cellFunction);
  			}
  			for (var i in data.rows) {
  				var row = data.rows[i];
  				var rowObject = control.append("<tr class='rowStyle" + (i % 2 + 1) + "'></tr>").find("tr:last");
  				for (var j in details.columns) {
  					var style = "";
  					if (!details.columns[j].visible) style += "display:none;";
  					if (details.columns[j].style) style += details.columns[j].style;
  					if (style) style = " style='" + style + "'";
  					// assume the cell has no value
  					var value = "";				
  					// get the position of this column in the data object
  					var mappedCol = columnMap[j];
  					// if we can find the column and it has data use it as the value
  					if (mappedCol && row[mappedCol]) value = row[columnMap[j]];
  					// add the cell with the value and return a reference
  					var cellObject = rowObject.append("<td" + style + ">" + value + "</td>").find("td:last");
  					// apply any cell function
  					if (details.columns[j].f) details.columns[j].f.apply(cellObject,[id, data, field, details]);
  				}		
  				// if there is a rowValidation collection
  				if (data.rowValidation && i < data.rowValidation.length) {
  					if (!data.rowValidation[i]) rowObject.addClass("validation");
  				}		
  			}
  			// if there is a selected row
  			if (data.selectedRowNumber) control.find("tr:nth(" + data.selectedRowNumber + ")").addClass("rowSelect");
  		} else {
  			for (var i in data.rows) {
  				var row = data.rows[i];
  				var rowHtml = "<tr>";
  				for (var j in row) {
  					rowHtml += "<td>" + row[j] + "</td>";
  				}
  				rowHtml += "</tr>";
  				control.append(rowHtml);
  			}
  		}	
  		if (details.dataStorageType) saveGridDataStoreData(id, details, data);					
  	} 
  	
  	control.children().last().children("tr:not(:first)").click( function() { 
  		var row = $(this);
  		row.parent().find("tr.rowSelect").each( function() {
  			var row = $(this);
  			row.removeClass("rowSelect");
  		});
  		row.addClass("rowSelect"); 
  	});
  	
  }
}

function getProperty_grid_selectedRowData(ev, id, field, details) {
  var data = null;
  if (details.dataStorageType) {
  	data = getGridDataStoreData(id, details);
  	data.rows = [data.rows[data.selectedRowNumber - 1]];
  } else {
  	var row = $(ev.target).closest("tr");
  	var rowNumber = row.index();
  	if (rowNumber > 0) {
  		data = {fields:[],rows:[[]]};
  		for (var i in details.columns) {
  			data.fields.push(details.columns[i].field);
  			data.rows[0].push(row.children(":nth(" + i + ")").html());
  		}
  	}
  }
  return data;
}

function setProperty_grid_selectedRowData(ev, id, field, details, data, changeEvents) {
  gridData = getGridDataStoreData(id, details);
  if (!gridData) gridData = {};
  data = makeDataObject(data, field);
  if (gridData.selectedRowNumber) {
  	// replace or remove selected row	
  	if (data) {
  		// get the gridData fields
  		var gridDataFields = gridData.fields;
  		// check there are some
  		if (gridDataFields) {
  			
  			// set up a field map which will hold the location of the incoming fields in the grid fields
  			var fieldMap = {};
  			// loop the incoming fields
  			for (var i in data.fields) {
  				// get it's name
  				var field = data.fields[i];
  				// assume it wasn't found in the grid's list of fields	
  				var foundField = false;							
  				// loop the grid's fields
  				for (var j in gridData.fields) {
  					// if there's a match					
  					if (field.toLowerCase() == gridData.fields[j].toLowerCase()) {
  						// store it's position
  						fieldMap[field] = j;
  						foundField = true;
  						break;
  					}
  				}
  				// if the field wasn't found in the grid
  				if (!foundField) {
  					// add it to the grid's fields
  					gridData.fields.push(field);
  					// retain the position
  					fieldMap[field] = gridData.fields.length - 1;
  				}				
  			}
  			
  			// loop the incoming fields one more time
  			for (var i in data.fields) {
  				// add an entry at this position if we need one
  				if (gridData.rows[gridData.selectedRowNumber - 1].length < data.fields.length) gridData.rows[gridData.selectedRowNumber - 1].push(null);
  				// update the selected row field from the map
  				gridData.rows[gridData.selectedRowNumber - 1][fieldMap[data.fields[i]]] = data.rows[0][i];
  			}
  			
  			
  		} else {
  			// take them from the incoming data object
  			gridData.fields = data.fields;
  			// put top row of what we were passed into selected row
  			gridData.rows[gridData.selectedRowNumber - 1] = data.rows[0];
  		}		
  	} else {
  		// remove the selected row 
  		gridData.rows.splice(gridData.selectedRowNumber - 1, 1);
  		// remove the validation entry if present
  		if (gridData.rowValidation) gridData.rowValidation.splice(gridData.selectedRowNumber - 1, 1); 
  		// remove the selection
  		gridData.selectedRowNumber = null;
  	}
  	// save the grid
  	saveGridDataStoreData(id, details, gridData);
  } else {
  	// append if no selected row
  	if (data) {
  		// create a rows array if not present
  		if (!gridData.rows) gridData.rows = [];
  		// look for existing fields
  		if (gridData.fields) {
  		
  			// set up a field map which will hold the location of the incoming fields in the grid fields
  			var fieldMap = {};
  			// loop the incoming fields
  			for (var i in data.fields) {
  				// get it's name
  				var field = data.fields[i];
  				// assume it wasn't found in the grid's list of fields	
  				var foundField = false;							
  				// loop the grid's fields
  				for (var j in gridData.fields) {
  					// if there's a match					
  					if (field.toLowerCase() == gridData.fields[j].toLowerCase()) {
  						// store it's position
  						fieldMap[field] = j;
  						foundField = true;
  						break;
  					}
  				}
  				// if the field wasn't found in the grid
  				if (!foundField) {
  					// add it to the grid's fields
  					gridData.fields.push(field);
  					// retain the position
  					fieldMap[field] = gridData.fields.length - 1;
  				}				
  			}
  			
  			// make a row
  			var row = [];
  			// add the cells
  			while (row.length < gridData.fields.length) row.push(null);
  			// loop the data fields and use the map to get the correct position
  			for (var i in data.fields) {
  				// get the field
  				var field = data.fields[i];
  				// get the position
  				var pos = fieldMap[field];
  				// add it to the correct place in the row
  				row[pos] = data.rows[0][i];
  			}
  			// add the row to the gridData
  			gridData.rows.push(row);
  		
  		} else {
  			
  			// assume the incomming fields		
  			gridData.fields = data.fields;
  			// add the top row of what we were given
  			gridData.rows.push(data.rows[0]);
  		
  		}
  		
  		// set the selected row number
  		gridData.selectedRowNumber = gridData.rows.length;
  		// save the grid
  		saveGridDataStoreData(id, details, gridData);	
  	}	
  }
}

function getProperty_grid_selectedRowValidation(ev, id, field, details) {
  if (details && details.dataStorageType) {
  	var gridData = getGridDataStoreData(id, details);
  	if (gridData.rowValidation && gridData.selectedRowNumber) {
  		return gridData.rowValidation[gridData.selectedRowNumber - 1];
  	} 
  } else {
  	return $(ev.target).closest("tr").index();
  }
}

function setProperty_grid_selectedRowValidation(ev, id, field, details, data, changeEvents) {
  var data = makeDataObject(data, field);
  var selectedRowNumber = null;
  
  // look for the grid on this page
  var grid = $("#" + id);
  // if it's present
  if (grid[0]) {
  	// get the selected row number
  	selectedRowNumber = grid.find("tr.rowSelect").index();
  	// check the incoming data for a positive
  	if (data[0][0]) {
  		// remove validation class from row if true
  		grid.find("tr.rowSelect").removeClass("validation");
  	} else {
  		// add validation class to row if false
  		grid.find("tr.rowSelect").addClass("validation");
  	}
  }
  	            	   	            
  if (details && details.dataStorageType) {
  	// get the grid data
  	gridData = getGridDataStoreData(id, details);
  	// make an object if there isn't one
  	if (!gridData) gridData = {};
  	// if we got a row number from the grid put it into the grid now
  	if (selectedRowNumber) gridData.selectedRowNumber = selectedRowNumber;
  	// if there are rows and one is selected
  	if (gridData.rows && gridData.selectedRowNumber) {
  		// add a rowValidation collection if there isn't one
  		if (!gridData.rowValidation) gridData.rowValidation = [];
  		// ensure the rowValidation collection is the same size as the row collection
  		while (gridData.rows.length > gridData.rowValidation) gridData.rowValidation.push(true);
  		// set the validation
  		gridData.rowValidation[gridData.selectedRowNumber - 1] = data.rows[0][0];
  		// save the grid
  		saveGridDataStoreData(id, details, gridData);
  	}
  }
}

function getProperty_grid_selectedRowNumber(ev, id, field, details) {
  if (details && details.dataStorageType) {
  	var gridData = getGridDataStoreData(id, details);
  	if (gridData && gridData.selectedRowNumber) {
  		return gridData.selectedRowNumber;
  	} else {
  		return null;
  	}
  } else {
  	return $(ev.target).closest("tr").index();
  }
}

function setProperty_grid_selectedRowNumber(ev, id, field, details, data, changeEvents) {
  gridData = getGridDataStoreData(id, details);
  if (!gridData) gridData = {fields:[],rows:[]};
  data = makeDataObject(data, field);
  var selectedRowNumber = null;
  if (data) selectedRowNumber = data.rows[0][0];
  gridData.selectedRowNumber = selectedRowNumber;	
  saveGridDataStoreData(id, details, gridData);
}

function getProperty_grid_rowCount(ev, id, field, details) {
  if (details && details.dataStorageType) {
  	var gridData = getGridDataStoreData(id, details);
  	if (gridData && gridData.rows) {
  		return gridData.rows.length;
  	} else {
  		return 0;
  	}
  } else {
  	return $("#" + id).find("tr").size() - 1;
  }
}

function getData_input(ev, id, field, details) {
  return $("#" + id).val();
}

function setData_input(ev, id, field, details, data, changeEvents) {
  var control = $("#" + id);
  var value = "";
  if (data != null && data !== undefined) {	
  	data = makeDataObject(data, field);
  	if (data.rows && data.rows[0]) {	        		
  		if (field && data.fields && data.fields.length > 0) {
  			for (var i in data.fields) {
  				if (data.fields[i] && data.fields[i].toLowerCase() == field.toLowerCase()) {
  					value = data.rows[0][i];
  					break;
  				}
  			}
  		} else {
  			if (data.rows[0][0] != null && data.rows[0][0] !== undefined) {
  				value = data.rows[0][0];
  			} 			
  		}
  	} 
  } 
  control.val(value);
  if (changeEvents) control.trigger("change");
}

function getProperty_map_mapCentre(ev, id, field, details) {
  // make the data object
  var data = {fields:["lat","lng"],rows:[[]]};
  // get the map
  var map = _maps[id];
  // if there was a map
  if (map) {
  	// get the centre
  	var centre = map.getCenter();
  	// add lat to the data object
  	data.rows[0].push(centre.lat());
  	// add lng to the data object
  	data.rows[0].push(centre.lng());	
  }
  // return what we got
  return data;
}

function setProperty_map_mapCentre(ev, id, field, details, data, changeEvents) {
  // get the map
  var map = _maps[id];
  // get the latlng
  var data = makeDataObject(data);
  // if we got a map and data
  if (map && data && data.fields && data.rows && data.fields.length > 1 && data.rows.length > 0) {
  	var lat = 0;
  	var lng = 0;
  	for (var i in data.fields) {
  		if (data.fields[i].toLowerCase().indexOf("lat") == 0) lat = data.rows[0][i];
  		if (data.fields[i].toLowerCase().indexOf("lng") == 0 || data.fields[i].toLowerCase().indexOf("lon") == 0) lng = data.rows[0][i];
  	}
  	var latlng = new google.maps.LatLng(lat, lng);
  	map.panTo( latlng );
  }
}

function setProperty_map_addMarkers(ev, id, field, details, data, changeEvents) {
  // get the map
  var map = _maps[id];
  // get the latlng
  var data = makeDataObject(data);
  // if we got a map and data
  if (map && data && data.fields && data.rows && data.fields.length > 1 && data.rows.length > 0) {
  	// create a markers array if there isn't one
  	if (!map.markers) map.markers = [];
  	// add the markers
  	addMapMarkers(map, data, details);
  }
}

function setProperty_map_replaceMarkers(ev, id, field, details, data, changeEvents) {
  // get the map
  var map = _maps[id];
  // get the latlng
  var data = makeDataObject(data);
  // if there are any current markers
  if (map.markers) {
  	// loop them
  	for (var i in map.markers) {
  		map.markers[i].setMap(null);
  	}
  	// empty array
  	map.markers = [];
  } 
  // empty markers array
  map.markers = [];
  // if we got a map and data
  if (map && data && data.fields && data.rows && data.fields.length > 1 && data.rows.length > 0) {		
  	// add the markers
  	addMapMarkers(map, data, details);
  }
}

function getProperty_map_selectedMarker(ev, id, field, details) {
  // get the map
  var map = _maps[id];
  // get the selectedIndex
  var selectedIndex = map.markerSelectedIndex;
  // if we got a map and data
  if (map && selectedIndex > -1 && map.markers.length > selectedIndex) {
  	var marker = map.markers[selectedIndex];
  	var data = marker.data;
  	if (field) {
  		var fieldIndex = -1;
  		for (var i in data.fields) {
  			if (field == data.fields[i]) {
  				return data.row[0][i];
  			}
  		}	
  		return null;
  	} else {
  		return data;
  	}	
  } else {
  	return null;
  }
}

function getData_radiobuttons(ev, id, field, details) {
  return $("#" + id).children("input[type=radio]:checked").val();
}

function setData_radiobuttons(ev, id, field, details, data, changeEvents) {
  if (data != null && data !== undefined) {
  	var radiobuttons = $("#" + id);
  	radiobuttons.children("input[type=radio]").prop('checked',false);
  	data = makeDataObject(data, field);
  	var value = null;
  	if (data.rows && data.rows[0]) {	        		
  		if (field && data.fields) {
  			for (var i in data.fields) {
  				if (data.fields[i].toLowerCase() == field.toLowerCase()) {
  					value = data.rows[0][i];					
  					break;
  				}
  			}
  		} else {
  			value = data.rows[0][0];
  		}
  	} 
  	if (value) {
  		var button = radiobuttons.children("input[type=radio][value=" + value + "]");
  		if (button[0]) {
  			button.prop('checked',true);	
  			if (changeEvents) button.trigger("change");		
  		}		
  	}
  }
}

function getData_text(ev, id, field, details) {
  return $("#" + id).html();
}

function setData_text(ev, id, field, details, data, changeEvents) {
  var control = $("#" + id);	        
  if (data != null && data !== undefined) {	
  	data = makeDataObject(data, field);
  	if (data.rows && data.rows[0]) {	        		
  		if (field && data.fields) {
  			for (var i in data.fields) {
  				if (data.fields[i] && data.fields[i].toLowerCase() == field.toLowerCase()) {
  					control.html(data.rows[0][i]);
  					break;
  				}
  			}
  		} else {
  			control.html(data.rows[0][0]);
  		}
  	} else {
  		control.html("");
  	}
  } else {
  	control.html("");
  }
}


/* Action methods */


function Action_control(actions) {
	for (var i in actions) {
		var action = actions[i];
		$("#" + action.id)[action["function"]](action.value);
	}	
}

function Action_datacopy(ev, data, outputs, changeEvents, copyType, copyData, field) {
	if (data != null && data !== undefined && outputs) {
		for (var i in outputs) {
			var output = outputs[i];	
			var outputData = null;	
			switch (copyType) {
				case "append" :					
					if (!output.details) output.details = {};						
					output.details.append = true;
					outputData = data;					
				break;
				case "row" : 
					var mergeData = window["getData_" + output.type](ev, output.id, null, output.details);
					data = makeDataObject(data, output.field);
					outputData = mergeDataObjects(mergeData, data, copyType, field); 
				break;
				case "child" :
					var mergeData = window["getData_" + output.type](ev, output.id, null, output.details);		
					if (data && data.rows && data.rows.length > 0) {								
						outputData = mergeDataObjects(mergeData, data, copyType, field);
					} else {
						outputData = mergeData;
					}
				break;
				case "search" :
					outputData = mergeDataObjects(copyData, data, copyType, field);
				break;
				default:
					outputData = data;
			}	
			window["setData_" + output.type](ev, output.id, output.field, output.details, outputData, changeEvents);
		}
	}
}

function Action_database(ev, actionId, data, outputs) {
	// check we got data and somewhere to put it
	if (data && outputs) {
		// check the returned sequence is higher than any others received so far
		if (data.sequence > getDatabaseActionMaxSequence(actionId)) {
			// retain this sequence as the new highest
			_databaseActionMaxSequence[actionId] = data.sequence;
			for (var i in outputs) {
				var output = outputs[i];			
				window["setData_" + output.type](ev, output.id, output.field, output.details, data);
			}
		}
	}
}

function Action_mobile(actionId, type) {
	// action callback
	alert("Callback for " + actionId + "." + type);
}

//JQuery is ready! 
$(document).ready( function() {
	
	$(window).resize(function(ex) {
	
		var doc = $(document);
		var win = $(window);
				
		// resize the cover
		$(".dialogueCover").css({
       		width : doc.width(),
       		height : doc.height()
       	});
       	      	
       	// resize the dialogues
       	$(".dialogue").each(function() {
       		var dialogue = $(this);
	       	dialogue.css({
	       		left : ((window.innerWidth ? window.innerWidth : win.width()) - dialogue.outerWidth(true)) / 2,
	       		top : ((window.innerHeight ? window.innerHeight : win.height()) - dialogue.outerHeight(true)) / 2
	       	}); 
	    });
	
	});
	
});		        
	        
function Action_navigate(url, dialogue, id) {

	if (dialogue) {
	
		var bodyHtml = "<div><h1 style='margin-left:auto;margin-right:auto;'>Page</h1></div>";
		
		// request the page		
		$.ajax({
		   	url: url,
		   	type: "GET",          
		       data: null,        
		       async: false,
		       error: function(error, status, message) { 
		       		alert("Error loading dialogue : " + error.responseText||message); 
		       },
		       success: function(page) {
		       	
		       // if the page can't be found a blank response is sent, so only show if we got something
		       if (page) {
		       	
		       		// empty the body html
		       		bodyHtml = "";
		       		script = "";
		       		links = "";
		       		
		           	// loop the items
		           	var items = $(page);
		           	for (var i in items) {
		           		// check for a script node
		           		switch (items[i].nodeName) {
		           		case "#text" : case "TITLE" : // ignore these types
		           		break;
		           		case "SCRIPT" :
		           			// exclude any links as we should have them all already
		           			if (items[i].innerHTML) {
		           				script += items[i].outerHTML;
		           			}		           			
		           		break;
		           		case "LINK" :
		           			// assume we can include this
		           			var include = true;
		           			// fetch the text
		           			var text = items[i].outerHTML;	           			
		           			// look for an href="
		           			if (!items[i].innerHTML && text.indexOf("href=\"") > 0) {
		           				var startPos = text.indexOf("href=\"")+6;
		           				var href = text.substr(startPos,text.indexOf("\"", startPos) - startPos);
		           				// exclude if we already have an element in the head with this href
		           				if ($("head").find("link[href='" + href + "']")[0]) include = false;
		           			}		           			
		           			// if still safe to include
		           			if (include) links += text;		           			
		           		break;
		           		case "META" :
		           			// meta tags can be ignored
		           		break;
		           		default :
		           			if (items[i].outerHTML) {
		           				// retain the script in our body html
		           				bodyHtml += items[i].outerHTML;        				
		           			}
		           		break;
		           		}
		           	}   
		           	
		           	// if this is the login page go to the real thing, requesting to come back to this location
            		if (bodyHtml.indexOf("<form name=\"login\" id=\"RapidLogin\">") > 0) window.location = "login.jsp?requestPath=" + window.location; 
            	
            		// get a reference to the document for the entire height and width     	
		           	var doc = $(document);
		           	// get a reference to the body		           	
		           	var body = $("body");
		           	
		           	// remove any existing dialogue cover for this action
		           	$("#" + id + "cover").remove();
		           	// add the cover and return reference
		           	dialogueCover = body.append("<div id='" + id + "cover' class='dialogueCover' style='position:absolute;left:0px;top:0px;z-index:1000;'></div>").children().last();
		           			      		           			           		            	
	            	// remove any existing dialogue container for this action
		           	$("#" + id + "dialogue").remove();
		           	// add the dialogue container and remove the reference
		           	dialogue = body.append("<div id='" + id + "dialogue' class='dialogue' style='position:fixed;z-index:1001;'></div>").children().last(); 
		           	
		           	// make sure it's hidden
		           	dialogue.css("visibility","hidden");
		           			           						
					// add any links into the page (if applicable)
		           	if (links) dialogue.append(links);		           			           	
		           	
		           	// append the injected html
		           	dialogue.append(bodyHtml);
		           	
		           	// add custom hide listener to children and event
		           	dialogue.children().on("hide", function() {
		           		var dialogue = $(this).closest("div.dialogue");	  
						dialogue.prev("div.dialogueCover").remove();
						dialogue.remove(); 
		           	});
		           	
		           	// thanks to http://viralpatel.net/blogs/jquery-trigger-custom-event-show-hide-element/						
					$.each(['show', 'hide'], function (i, ev) {
						var el = $.fn[ev];
						$.fn[ev] = function () {
							this.trigger(ev);
							return el.apply(this, arguments);
						};
					});
							           	
		           	// add any scripts into the page (if applicable)
		           	if (script) dialogue.append(script);
		           			           	
		           	// get a reference to the window for the visible area
		           	var win = $(window);
		           	
		           	// apply the resizing	
	            	$(window).resize(); 
	            	
	            	// this seems to be the best way to avoid the resizing/flicker when showing
	            	window.setTimeout( function() {
	            		// make the dialogue visible
	            		dialogue.css("visibility","visible");
	            		// apply the resizing again (for mobile)	
	            		if (window["_rapidmobile"]) $(window).resize(); 
	            	}, 200);
		           	           	        	            	            	            
		    	}        	       	        	        	        	        		
		    }       	        	        
		});	      
	
	} else {
		window.location = url;
	}
}

function Action_validation(ev, validations, showMessages) {
	var valid = true;
	for (var i in validations) {
		var validation = validations[i];
		var validationControl = $("#" + validation.controlId);
		if (validationControl[0]) {
			if (!validationControl.is(":hidden") || !validation.passHidden) {
				var getValueFunction = null;
				if (validation.validationProperty) {
					getValueFunction = window["getProperty_" + validation.controlType + "_" + validation.validationProperty];
				} else {
					getValueFunction = window["getData_" + validation.controlType];
				}
				if (getValueFunction) {
					var value = getValueFunction(ev, validation.controlId, validation.field, validation.details);
					if (validation.validationType == "javascript") {						
						var validationFunction = new Function(["ev","id","value"], validation.javaScript);
						var failMessage = validationFunction.apply(this, [ev,validation.controlId,value]);
						if (failMessage != null && failMessage !== false && failMessage !== undefined) {
							if (showMessages) showControlValidation(validation.controlId, failMessage);
							valid = false;
						} else {
							if (showMessages) hideControlValidation(validation.controlId);
						}
					} else {
						if ((value && value.match(new RegExp(validation.regEx)))||(!value && validation.allowNulls)) {
							// passed
							if (showMessages) hideControlValidation(validation.controlId);				
						} else {
							// failed, and there is a message to show
							if (showMessages) showControlValidation(validation.controlId, validation.message);
							valid = false;					
						}	
					}	
				} else {
					if (showMessages) showControlValidation(validation.controlId, validation.message);
					valid = false;
				}
			}
		}
	}	
	return valid;
}

function Action_webservice(ev, actionId, data, outputs) {
	// only if there are data and outputs
	if (data && outputs) {
		// only if this is the latest sequence
		if (data.sequence > getWebserviceActionMaxSequence(actionId)) {
			// retain this as the lastest sequence
			_webserviceActionMaxSequence[actionId] = data.sequence;
			// loop the outputs
			for (var i in outputs) {
				var output = outputs[i];			
				window["setData_" + output.type](ev, output.id, output.field, output.details, data);
			}
		}
	}
}
