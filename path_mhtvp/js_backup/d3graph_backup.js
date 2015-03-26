var D3graph = (function() {
	
	// var clinician;
	
	var parent,
		focus,
		context,
		r1svg,
		r2svg,
		range1,
		range2;
	
	var settings = [],
		data = [],
		comments = [],
		commentsCreated = false,
		clinicianNotes = {
			patient: '',
			nextId: 0,
			notes: []
		},
		integralsFocus = [],
		integralsRange1 = [],
		integralsRange2 = [];
	
	var range1dates = [],
		range2dates = [];
	
	// var initialData = [];
	
	var colours = [
		'rgba(255,0,0,1.0)',		// Red
		'rgba(0,0,255,1.0)',		// Blue
		'rgba(0,255,0,1.0)',		// Green
		'rgba(255,165,0,1.0)',	// Orange
		'rgba(80,48,137,1.0)',	// Purple
		'rgba(222,36,229,1.0)',	// Violet
		'rgba(128,104,74,1.0)',	// Brown
		'rgba(212,201,137,1.0)',	// Tan
		'rgba(235,152,152,1.0)',	// Pink
		'rgba(116,212,216,1.0)'	// Teal
	];
	
	var months = [
		'Jan.',
		'Feb.',
		'Mar.',
		'Apr.',
		'May',
		'Jun.',
		'Jul.',
		'Aug.',
		'Sep..',
		'Oct.',
		'Nov.',
		'Dec.'
	];
	
	var mgFocus = {
		width: null,
		height: null,
		margin: {
			top: 27,
			right: 19,
			bottom: 103,
			left: 33
		},
		x: null,
		y: null,
		xAxis: null,
		yAxis: null,
		line: null,
		brush1: null,
		brush2: null
	};
	
	var mgContext = {
		width: null,
		height: null,
		margin: {
			top: 321,
			right: 19,
			bottom: 0,
			left: 33
		},
		x: null,
		y: null,
		xAxis: null,
		yAxis: null,
		line: null,
		brush: null
	};
	
	var rgRange = {
		width: null,
		height: null,
		margin: {
			top: 27,
			right: 0,
			bottom: 25,
			left: 33
		},
		x: null,
		y: null,
		xAxis: null,
		yAxis: null,
		line: null
	};
	
	var pgWidth = 1094,	// Originally 960
		pgHeight = 346;	// Originally 500
	
	var rgWidth = 1098,
		rgHeight = 281;
	
	/*
		This function turns a string into a Date() object (that's what the 
		.parse function does at the end of the format() function):
		
		%Y = Year
		%m = Month
		%d = Date
		%H = Hour
		%M = Minutes
		%S = Seconds
		
		parseDate('2013-01-01 12:00:00') returns Date {Tue Jan 01 2013 12:00:00 GMT-0500 (EST)}
	*/
	function parseDate(date) {
		var dateObj = d3.time.format('%Y-%m-%d %H:%M:%S').parse(date);
		return dateObj;
	}
	
	function dateSortAsc(date1, date2) {
		/*
			Sort the items by date; oldest to newest
		*/
		if (date1.DayTime < date2.DayTime) 
			return -1;
		if (date1.DayTime > date2.DayTime) 
			return 1;
		return 0;
	}
	
	function getX(width) {
		var x = d3.time.scale().range([
			0,
			width
		]);
		return x;
	}
	
	function getY(height) {
		var y = d3.scale.linear().range([
			height,
			0
		]);
		return y;
	}
	
	function createXdomain(x, data) {
		x.domain(d3.extent(data.map(function(d) {
			return d.DayTime;
		})));
	}
	
	function createYdomain(y) {
		y.domain([
			0,
			/*d3.max(data.map(function(d) {
				return d.Data;
			}))*/
			100
		]);
	}
	
	function getXaxis(x) {
		var xAxis = d3.svg.axis().scale(x).orient('bottom');
		return xAxis;
	}
	
	function getYaxis(y) {
		var yAxis = d3.svg.axis().scale(y).orient('left');
		return yAxis;
	}
	
	/*function brushFunc() {
		mgFocus.x.domain(mgContext.brush.empty() ? mgContext.x.domain() : mgContext.brush.extent());
		focus.select('path').attr('d', mgFocus.line);
		focus.select('.x.axis').call(mgFocus.xAxis);
	}*/
	
	function getDateX(x, data) {
		var dateX = x(data.Date);
		// console.log(dateX);
		return dateX;
	}
	
	var mark,
		xDiff;
	
	function addDateZero(digit) {
		digit = (digit < 10) ? '0' + digit : digit;
		return digit;
	}
	
	function getDateString(comDate) {
		var month = addDateZero(months[comDate.getMonth()]);
		var day = addDateZero(comDate.getDate());
		var year = comDate.getYear() - 100;
		var time = addDateZero(comDate.getHours()) + ':' + addDateZero(comDate.getMinutes()) + ':' + addDateZero(comDate.getSeconds());
		var dateString = month + ' ' + day + ', 20' + year + ' ' + time;
		return dateString;
	}
	
	function submitNotes() {
		// ALERT: This is where the Ajax call is going to go that passes the clinicianNotes object to Cindy
	}
	
	var deleteNote = function(id) {
		var delConf = window.confirm('Are you sure you want to delete this note?');
		if (delConf == true) {
			for (var i = 0; i < clinicianNotes.notes.length; i++) {
				if (clinicianNotes.notes[i].id == id) {
					clinicianNotes.notes.splice(i, 1);
					submitNotes();
				}
			}
			$('#cn-' + id).remove();
			$('#ni-' + id).remove();
		}
	};
	
	var closeNotes = function() {
		$('#svgParent div.noteInline').each(function() {
			var id = parseInt($(this).attr('id').split('-')[1]);
			jQuery.each(clinicianNotes.notes, function(i, nData) {
				if (nData.id == id) {
					nData.Data = $('#note-' + id).val();
					submitNotes();
				}
			});
		}).hide();
	};
	
	function getCurrNote(id) {
		for (var i = 0; i < clinicianNotes.notes.length; i++) {
			if (clinicianNotes.notes[i].id == id) 
				return i;
		}
	}
	
	var dragCnote = d3.behavior.drag()
		.on('dragstart', function() {
			closeNotes();
			closeComments();
			/*
				Get the offset value of the mouse position vs. the marker's x value 
				relative to #focus
			*/
			mark = d3.select(this);
			var cursorX = d3.mouse(this)[0];
			var markX = mark.attr('x');
			xDiff = cursorX - markX;
		})
		.on('drag', function() {
			var focusX = d3.mouse($('#focus')[0])[0];
			var newX = focusX - xDiff;
			if (newX < 0) 
				newX = 0;
			else if (newX > mgFocus.width) 
				newX = mgFocus.width;
			d3.select(this).attr('x', newX);
		})
		.on('dragend', function() {
			// Update the markers object value in here
			var id = mark.attr('id').split('-')[1];
			var currNote = getCurrNote(id);
			clinicianNotes.notes[currNote].Date = mgFocus.x.invert(mark.attr('x'));
			var dateString = getDateString(clinicianNotes.notes[currNote].Date);
			$('#ni-' + id + ' h6').html(dateString);
			// console.log(clinicianNotes.notes[currNote].Date);
			$('#ni-' + id).css('left', (Math.round(mark.attr('x')) + 3) + 'px')/*.show()*/;
		});
	
	function createClinicianNotes() {
		$('#svgParent').append('<div title="Clinician note" class="clinicianNote cnStart" id="cn-' + clinicianNotes.nextId + '">&nbsp;</div>');
		$('#cn-' + clinicianNotes.nextId).draggable({
			axis: 'x',
			containment: '#svgParent',
			start: function() {
				closeNotes();
				closeComments();
				if ($(this).hasClass('cnStart')) {
					$(this).removeClass('cnStart').addClass('cnMark');
				}
			},
			stop: function() {
				var left = parseInt($(this).css('left').split('px')[0]) - mgFocus.margin.left;
				// console.log(left);
				var id = $(this).attr('id').split('-')[1];
				// if (left >= 0 || left <= mgFocus.width) {
				if (left >= 0 && left <= mgFocus.width) {
					clinicianNotes.notes.push({
						"id": id,
						"dr": clinician,
						"Date": mgFocus.x.invert(left),
						"Data": ''
					});
					var currNote = getCurrNote(id);
					// console.log(clinicianNotes.notes[currNote].Date);
					// console.log(getDateX(mgFocus.x, clinicianNotes.notes[currNote]) - 2);
					$('#cn-' + clinicianNotes.nextId).remove();	/* ALERT: This is causing a problem */
					focus.append('image')
						.attr({
							'xlink:href': 'images/visualizer_clinician_note.png',
							'width': '18',
							'height': '28',
							'x': getDateX(mgFocus.x, clinicianNotes.notes[currNote])/* - 2*/,
							'y': '216',
							'class': 'clinicianNote',
							'id': 'cn-' + id
						})
						.call(dragCnote);
					
					var dateString = getDateString(clinicianNotes.notes[currNote].Date);
					
					$('#svgParent').append('<div class="noteInline" id="ni-' + clinicianNotes.notes[currNote].id + '" style="left: ' + (getDateX(mgFocus.x, clinicianNotes.notes[currNote]) + 3) + 'px;">\
						<img src="images/note_box_arrow.png" width="13" height="18" class="arrow">\
						<h5>Dr. ' + clinicianNotes.notes[currNote].dr + '</h5>\
						<h6>' + dateString + '</h6>\
						<form>\
							<fieldset>\
								<textarea id="note-' + clinicianNotes.notes[currNote].id + '">' + clinicianNotes.notes[currNote].Data + '</textarea>\
							</fieldset>\
						</form>\
						<a href="#" title="Close" class="img btnCloseCI" onclick="D3graph.closeNotes(); return false;"><span>X</span></a>\
						<a href="#" title="Delete" class="img btnCloseDelete" onclick="D3graph.deleteNote(' + clinicianNotes.notes[currNote].id + '); return false;"><span>X</span></a>\
					</div>');
		
					$('#cn-' + id).click(function() {
						var id = $(this).attr('id').split('-')[1];
						$('#ni-' + id).show();
						closeComments();
					});
					
					clinicianNotes.nextId++;
					createClinicianNotes();
				} else {
					// window.alert('Out of bounds, left: ' + left + 'px');
					$('#cn-' + clinicianNotes.nextId).remove();	/* ALERT: This is causing a problem */
					createClinicianNotes();
				}
			}
		});
	}
	
	function plotNotes(graph) {
		closeNotes();
		graph.selectAll('image.clinicianNote').remove();
		$('#svgParent div.noteInline').remove();
		// For each clinicianNotes note set...
		for (var i = 0; i < clinicianNotes.notes.length; i++) {
			// ...add an image mapped to the date x position
			// console.log(comments[i]);
			graph.insert('image', '#fml')
				.attr({
					'xlink:href': 'images/visualizer_clinician_note.png',
					'width': '18',
					'height': '28',
					'x': getDateX(mgFocus.x, clinicianNotes.notes[i])/* - 2*/,
					'y': '216',
					'class': 'clinicianNote',
					'id': 'cn-' + clinicianNotes.notes[i].id
				})
				.call(dragCnote);
			
				var dateString = getDateString(clinicianNotes.notes[i].Date);
				
				$('#svgParent').append('<div class="noteInline" id="ni-' + clinicianNotes.notes[i].id + '" style="display: none; left: ' + (getDateX(mgFocus.x, clinicianNotes.notes[i]) + 1) + 'px;">\
					<img src="images/note_box_arrow.png" width="13" height="18" class="arrow">\
					<h5>Dr. ' + clinicianNotes.notes[i].dr + '</h5>\
					<h6>' + dateString + '</h6>\
					<form>\
						<fieldset>\
							<textarea id="note-' + clinicianNotes.notes[i].id + '">' + clinicianNotes.notes[i].Data + '</textarea>\
						</fieldset>\
					</form>\
					<a href="#" title="Close" class="img btnCloseCI" onclick="D3graph.closeNotes(); return false;"><span>X</span></a>\
					<a href="#" title="Delete" class="img btnCloseDelete" onclick="D3graph.deleteNote(' + clinicianNotes.notes[i].id + '); return false;"><span>X</span></a>\
				</div>');
		
				$('#cn-' + clinicianNotes.notes[i].id).click(function() {
					closeNotes();
					
					var id = $(this).attr('id').split('-')[1];
					$('#ni-' + id).show();
				});
			
		}
	}
	
	var closeComments = function() {
		$('#svgParent div.commentInline').hide();
	};
	
	function plotComments(graph) {	// <---------------------------------------------------------------- Comment stuff
		graph.selectAll('rect.comment').remove();
		$('#svgParent div.commentInline').remove();
		// For each comment data set...
		for (var i = 0; i < comments.length; i++) {
			// ...add a rect mapped to the date x position
			// console.log(comments[i]);
			graph.insert('rect', '#fml')
				.attr({
					'width': 4,
					'height': 15,
					'x': getDateX(mgFocus.x, comments[i]) - 2,	// NOTE: Very, very important!!!
					'y': 250,
					'class': 'comment',
					'id': 'cmnt-' + i
				});
			
			var dateString = getDateString(comments[i].Date);
			
			$('#svgParent').append('<div class="commentInline" id="ci-' + i + '" style="display: none; left: ' + (getDateX(mgFocus.x, comments[i]) + 35) + 'px;">\
				<img src="images/comments_box_arrow.png" width="13" height="18" class="arrow">\
				<h6>' + dateString + '</h6>\
				<div class="scroll">\
					<div class="content">\
						<p>' + comments[i].Data + '</p>\
					</div>\
				</div>\
				<a href="#" title="Close" class="img btnCloseCI" onclick="D3graph.closeComments(); return false;"><span>X</span></a>\
			</div>');
		
			$('#cmnt-' + i).click(function() {
				closeComments();
				closeNotes();
				var id = $(this).attr('id').split('-')[1];
				$('#ci-' + id).show();
			});
			
		}
		
	}
	
	function getYPos(x, path) {
		var beginning = x,
			end = path.getTotalLength(),
			target;
		// console.log(end);
		while (true) {
			target = Math.floor((beginning + end) / 2);
			// console.log(target);
			pos = path.getPointAtLength(target);
			if ((target === end || target === beginning) && pos.x !== x) {
				break;
			}
			if (pos.x > x) 
				end = target;
			else if (pos.x < x) 
				beginning = target;
			else 
				break; //position found
		}
		return pos.y;
	}
	
	function getIntegral(json) {
		//Initialize integral as a running sum
		var integral = 0;
		//Obtain length for json.results
		var jsonLength = json.length;
		
		for (var i = 1; i < jsonLength; i++) {
			//Assign variables to date and data (just making code easier to read)
			var date1 = json[i - 1].Date;
			var data1 = json[i - 1].Data;
			var date2 = json[i].Date;
			var data2 = json[i].Data;
			
			//Difference between two dates (unit: days)
			var timeDiff = (date2 - date1) / (1000 * 60 * 60 * 24);
			//get area of trapezoid, add to running sum
			integral = integral + (data2 + data1) * (timeDiff / 2.0);
		}
		
		return integral;
	}
	
	function calcIntegrals(parent, grphBrush, arr) {
		// Inside the graph's integral data box, create a new <table>
		$('#id-' + parent).html('<table><tbody></tbody></table>');
		// Clear the arr[] array so it's empty
		arr = [];
		// Create a variable to hold the oldest date on the current graph
		var firstDate = null;
		// Create a variable to hold the newest date on the current graph
		var lastDate = null;
		// If the graph brush is currently in use (or at least 1 pixel in width or more)...
		if (grphBrush != null) {
			// ...the oldest date is the brush’s left date value
			firstDate = grphBrush.extent()[0];
			// ...the newest date is the brush’s right date value
			lastDate = grphBrush.extent()[1];
			// If firstDate is equal to lastDate and the graph is the main parent graph...
			if (firstDate.getTime() == lastDate.getTime() && parent == 'svgParent') {
				// ...firstDate equals data’s first date in the data array
				firstDate = data[0].DayTime;
				// ...lastDate equals data’s last date in the data array
				lastDate = data[data.length - 1].DayTime;
			}
		// If the graph brush is currently not open and the graph is the main parent graph...
		} else if (parent == 'svgParent') {
			// ...firstDate equals data’s first date in the data array
			firstDate = data[0].DayTime;
			// ...lastDate equals data’s last date in the data array
			lastDate = data[data.length - 1].DayTime;
		}
		// For each object in the settings array...
		for (var i = 0; i < settings.length; i++) {
			// If the current name is not undefined...
			if (settings[i].name != undefined) {
				// ...set id as the current setting ID
				var id = settings[i].id;
				// Add an object into arr that contains the following object:
				arr.push({
					"id": id,
					"colour": null,
					"integral": null
				});
			}
		}
		// For each of the objects in arr...
		for (var i = 0; i < arr.length; i++) {
			// ...set id as the current setting ID
			var id = arr[i].id;
			// For each object in the initialData array...
			for (var j = 0; j < initialData.length; j++) {
				// If initialData's current ID == arr's current ID...
				if (initialData[j].id == id) {
					// .. creeate a couple of variables to hold the current ID's oldest and newest dates
					var idDateFirst = null;
					var idDateLast = null;
					// For each object in initialData's current results object...
					for (var k = 0; k < initialData[j].results.length; k++) {
						// ...get its current date
						var thisDate = parseDate(initialData[j].results[k].Date);
						// If idDateFirst is still empty and idDateFirst is newer than the current date...
						if (idDateFirst == null || idDateFirst > thisDate) 
							idDateFirst = thisDate;
						// If idDateLast is still empty and idDateLast is older than the current date...
						if (idDateLast == null || idDateLast < thisDate) 
							idDateLast = thisDate;
					}
					// If idDateFirst is newer than data’s newest date or idDateFirst is older than data’s oldest date...
					if (idDateFirst > lastDate || idDateLast < firstDate) 
						// ...no integral value
						arr[i].integral = '--';
					else {
						
						// console.log(initialData[j].results[k]);
						// console.log('Date: ' + thisDate + ', Data: ' + initialData[j].results[k].Data);
						
						
						// 
						var integral = 0;
						var intFirstDate = null;
						var intLastDate = null;
						var grphSettings = (parent == 'svgParent') ? mgFocus : rgRange;
						var x1 = 0;
						var x2 = null;
						/*
							If the path's first and last date is completely contained within the graph's 
							visible area...
						*/
						if (idDateFirst > firstDate && idDateLast < lastDate) {
							x2 = getDateX(grphSettings.x, {"Date": idDateLast}) - getDateX(grphSettings.x, {"Date": idDateFirst});
							intFirstDate = idDateFirst;
							intLastDate = idDateLast;
						} else {
							// If the path's first date is greater than the graph's oldest visible date...
							if (idDateFirst > firstDate && idDateFirst < lastDate) {
								// Something's still wrong with these values. Still needs work.
								x2 = Math.round(grphSettings.width - getDateX(grphSettings.x, {"Date": idDateFirst}));
								intFirstDate = idDateFirst;
							}
							// ...else if the path's last date is less than the graph's youngest visible date...
							else if (idDateLast < lastDate && idDateLast > firstDate) {
								x2 = 0 + getDateX(grphSettings.x, {"Date": idDateLast});
								intLastDate = idDateLast;
							}
							if (x2 == null) 
								x2 = grphSettings.width;
							if (intFirstDate == null) 
								intFirstDate = firstDate;
							if (intLastDate == null) 
								intLastDate = lastDate;
						}
						if (parent == 'svgParent') {
							var y1 = Math.round((216 - getYPos(x1, d3.select('#' + parent + ' path.path-' + id).node())) / 2.16);
							var y2 = Math.round((216 - getYPos(x2, d3.select('#' + parent + ' path.path-' + id).node())) / 2.16);
						} else {
							var y1 = Math.round((230 - getYPos(x1, d3.select('#' + parent + ' path.path-' + id).node())) / 2.3);
							var y2 = Math.round((230 - getYPos(x2, d3.select('#' + parent + ' path.path-' + id).node())) / 2.3);
						}
						/*
							ALERT: At this point, you should construct your JSON object of dates and 
							Data values to pass into Cindy's function to get the integral value. You'll have 
							the oldest date and the newest date. You'll just need to grab all of the points 
							in between the two dates.
						*/
						
						
						
						
						var integralData = [];
						
						// For each object in initialData's current results object...
						for (var k = 0; k < initialData[j].results.length; k++) {
							// ...get its current date
							var thisDate = parseDate(initialData[j].results[k].Date);
							
							/*
								ALERT: I'm 95% certain that this is working now. Still need to run this by Cindy to make sure.
							*/
							
							if (thisDate > intFirstDate && thisDate < intLastDate) {
								integralData.push({
									"Date": thisDate,
									"Data": initialData[j].results[k].Data
								});
							}
						}
						
						
						integralData.unshift({
							"Date": intFirstDate,
							"Data": y1
						});
						
						
						integralData.push({
							"Date": intLastDate,
							"Data": y2
						});
						
						/*
						// Difference between two dates (unit: days)
						var timeDiff = (intLastDate - intFirstDate) / (1000 * 60 * 60 * 24);
						// get area of trapezoid, add to running sum
						arr[i].integral = integral + (y2 + y1) * (timeDiff / 2.0);
						*/
						
						console.log(integralData);
						
						arr[i].integral = getIntegral(integralData);
						
						// console.log('Integral: ' + arr[i].integral);
						
					}
				}
			}
			arr[i].colour = $('#focus path.path-' + arr[i].id).css('stroke');
			if (arr[i].integral != '--') 
				arr[i].integral = arr[i].integral.toFixed(2);
			$('#id-' + parent + ' table tbody').append('<tr><td class="intLeg-' + arr[i].id + '"><div style="background-color: ' + arr[i].colour + ';">&nbsp;</div></td><td>' + arr[i].integral + '</td></tr>');
		}
	}
	
	function calcIntegralsWrong(parent, grphBrush, arr) {
		
		/*
			ALERT: This does work. There's some logic that still needs to be worked
			out to determine when the function should be invoked, and, the y value 
			is the position down from the top of the SVG, but the values at the 0 x 
			position are accurate, so if the first point on the path isn't visible (or the 
			last point), this function could be involked to get the needed y value.
		*/
		/*$('#' + parent + ' path.dataPath').each(function() {
			// console.log($(this).attr('class'));
			var x1 = 0;
			var x2 = mgFocus.width;
			var id = $(this).attr('class').split('-')[1];
			var y1 = Math.round((216 - getYPos(x1, d3.select('#' + parent + ' path.path-' + id).node())) / 2.16);
			var y2 = Math.round((216 - getYPos(x2, d3.select('#' + parent + ' path.path-' + id).node())) / 2.16);
			var colour = $('#focus .path-' + id).css('stroke');
			switch (colour) {
				case 'rgb(255, 0, 0)' : 
					colour = 'red';
					break;
				case 'rgb(0, 0, 255)' : 
					colour = 'blue';
					break;
				case 'rgb(0, 255, 0)' : 
					colour = 'green';
					break;
				default : 
					colour = 'orange';
					break;
			}
			if ($(this).css('stroke') != 'transparent') 
				console.log(id + ' (' + colour + '): y1: ' + y1 + ', y2: ' + y2);
		});*/
		
		
		
		$('#id-' + parent).html('<table><tbody></tbody></table>');
		arr = [];
		var firstDate = null;
		var lastDate = null;
		
		// ALERT: Issue with two bottom range integral values.
		
		if (grphBrush != null) {
			firstDate = grphBrush.extent()[0];
			lastDate = grphBrush.extent()[1];
			if (firstDate.getTime() == lastDate.getTime() && parent == 'svgParent') {
				firstDate = data[0].DayTime;
				lastDate = data[data.length - 1].DayTime;
			}
		} else if (parent == 'svgParent') {
			firstDate = data[0].DayTime;
			lastDate = data[data.length - 1].DayTime;
		}
		for (var i = 0; i < settings.length; i++) {
			if (settings[i].name != undefined) {
				var id = settings[i].id;
				// var colour = settings[i].colour;
				// console.log(colour);
				arr.push({
					"id": id,
					"colour": null,
					// "values": [],
					"integral": null
				});
			}
		}
		for (var i = 0; i < arr.length; i++) {
			var id = arr[i].id;
			for (var j = 0; j < initialData.length; j++) {
				if (initialData[j].id == id) {
					var idDateFirst = null;
					var idDateLast = null;
					for (var k = 0; k < initialData[j].results.length; k++) {
						var thisDate = parseDate(initialData[j].results[k].Date);
						if (idDateFirst == null || idDateFirst > thisDate) 
							idDateFirst = thisDate;
						if (idDateLast == null || idDateLast < thisDate) 
							idDateLast = thisDate;
					}
					/*var colour = $('#' + parent + ' .path-' + id).css('stroke');
					switch (colour) {
						case 'rgb(255, 0, 0)' : 
							colour = 'red';
							break;
						case 'rgb(0, 0, 255)' : 
							colour = 'blue';
							break;
						case 'rgb(0, 255, 0)' : 
							colour = 'green';
							break;
						case 'rgb(255, 165, 0)' : 
							colour = 'orange';
							break;
					}*/
					// console.log(id + ' (' + colour + '): ' + idDateFirst + ' > ' + lastDate + ': ' + (idDateFirst > lastDate) + ', ' + idDateLast + ' < ' + firstDate + ': ' + (idDateLast < firstDate));
					/*
						If the path's first date is greater than the graph’s oldest visible date or
						if the path's last date is less than the graph's newest visible date...
					*/
					if (idDateFirst > lastDate || idDateLast < firstDate) 
						arr[i].integral = '--';
					else {
						var integral = 0;
						var intFirstDate = null;
						var intLastDate = null;
						var grphSettings = (parent == 'svgParent') ? mgFocus : rgRange;
						var x1 = 0;
						var x2 = null;
						// var diff = 0;
						/*
							NOTE: The value of x2 is going to need to be determined based on its length.
						*/
						/*
							If the path's first and last date is completely contained within the graph's 
							visible area...
						*/
						if (idDateFirst > firstDate && idDateLast < lastDate) {
							// diff = getDateX(grphSettings.x, {"Date": idDateLast}) - getDateX(grphSettings.x, {"Date": idDateFirst});
							// x2 = diff;
							x2 = getDateX(grphSettings.x, {"Date": idDateLast}) - getDateX(grphSettings.x, {"Date": idDateFirst});
							intFirstDate = idDateFirst;
							intLastDate = idDateLast;
						} else {
							// If the path's first date is greater than the graph's oldest visible date...
							if (idDateFirst > firstDate && idDateFirst < lastDate) {
								// Something's still wrong with these values. Still needs work.
								// diff = Math.round(grphSettings.width - getDateX(grphSettings.x, {"Date": idDateFirst}));
								x2 = Math.round(grphSettings.width - getDateX(grphSettings.x, {"Date": idDateFirst}));
								// console.log(id + ' (' + colour + '): Length: ' + diff);
								// x2 = grphSettings.width - diff;
								// x2 = diff;
								intFirstDate = idDateFirst;
							}
							// ...else if the path's last date is less than the graph's youngest visible date...
							else if (idDateLast < lastDate && idDateLast > firstDate) {
								// diff = 0 + getDateX(grphSettings.x, {"Date": idDateLast});
								// x2 = 0 + diff;
								x2 = 0 + getDateX(grphSettings.x, {"Date": idDateLast});
								intLastDate = idDateLast;
							}
							if (x2 == null) 
								x2 = grphSettings.width;
							if (intFirstDate == null) 
								intFirstDate = firstDate;
							if (intLastDate == null) 
								intLastDate = lastDate;
						}
						if (parent == 'svgParent') {
							var y1 = Math.round((216 - getYPos(x1, d3.select('#' + parent + ' path.path-' + id).node())) / 2.16);
							var y2 = Math.round((216 - getYPos(x2, d3.select('#' + parent + ' path.path-' + id).node())) / 2.16);
						} else {
							var y1 = Math.round((230 - getYPos(x1, d3.select('#' + parent + ' path.path-' + id).node())) / 2.3);
							var y2 = Math.round((230 - getYPos(x2, d3.select('#' + parent + ' path.path-' + id).node())) / 2.3);
						}
						/*if ($('#' + parent + ' path.path-' + id).css('stroke') != 'transparent') 
							console.log(id + ' (' + colour + '): y1: ' + y1 + ', y2: ' + y2);*/
						// Difference between two dates (unit: days)
						var timeDiff = (intLastDate - intFirstDate) / (1000 * 60 * 60 * 24);
						// get area of trapezoid, add to running sum
						arr[i].integral = integral + (y2 + y1) * (timeDiff / 2.0);
					}
				}
			}
			// var intTotal = arr[i].values[arr[i].values.length - 1] - arr[i].values[0];
			// $('#id-' + parent + ' table tbody').append('<tr><td class="intLeg-' + arr[i].id + '"><div style="background-color: ' + arr[i].colour + ';">&nbsp;</div></td><td>' + intTotal.toFixed(2) + '</td></tr>');
			arr[i].colour = $('#focus path.path-' + arr[i].id).css('stroke');
			if (arr[i].integral != '--') 
				arr[i].integral = arr[i].integral.toFixed(2);
			$('#id-' + parent + ' table tbody').append('<tr><td class="intLeg-' + arr[i].id + '"><div style="background-color: ' + arr[i].colour + ';">&nbsp;</div></td><td>' + arr[i].integral + '</td></tr>');
		}
	}
	
	function setIntegrals(graph) {
		var gph = graph.attr('id');
		switch (gph) {
			case 'focus' : 
				calcIntegrals('svgParent', mgContext.brush, integralsFocus);
				break;
			case 'range1Graph' : 
				calcIntegrals('svgRange1', mgFocus.brush1, integralsRange1);
				break;
			case 'range2Graph' : 
				calcIntegrals('svgRange2', mgFocus.brush2, integralsRange2);
				break;
		}
	}
	
	function plotDataGroup(graph, dataType) {
		// For each setting object...
		for (var i = 0; i < settings.length; i++) {
			// ...create a temporaty array called mapData to store the date/data info for each collection of data
			var mapData = [];
			var id = settings[i].id;
			var colour = settings[i].colour;
			// For each date in data...
			for (var j = 0; j < data.length; j++) {
				var DayTime = data[j].DayTime;
				// For each collection of data in each date...
				for (var k = 0; k < data[j].Data.length; k++) {
					// If the current collection of data’s id matches the current id in settings...
					if (data[j].Data[k].id == id) {
						// ...create a Date/Data object in mapData
						if (dataType == 'data') {
							mapData.push({
								"Date": DayTime,
								"Data": parseInt(data[j].Data[k].Data)
							});
						} else {
							mapData.push({
								"Date": DayTime,
								"Data": parseInt(data[j].Data[k].MA)
							});
						}
					}
				}
			}
			// Add a path for mapData’s Date and Data points in Focus
			if (dataType == 'data') {
				graph.insert('path', 'rect.mask')
					.datum(mapData)
					// .attr('clip-path', 'url(#clip)')
					.attr('d', mgFocus.line)
					.attr('class', 'dataPath path-' + id)
					.style('stroke', colour);
			} else {
				graph.insert('path', 'rect.mask')
					.datum(mapData)
					// .attr('clip-path', 'url(#clip)')
					.attr('d', mgFocus.line)
					.attr('class', 'dataMa ma-' + id)
					.style('stroke', colour);
			}
		}
	}
	
	function plotData(graph) {
		plotDataGroup(graph, 'data');
		plotDataGroup(graph, 'movingAverage');
		if (graph == focus) {
			plotComments(focus);
		}
		setIntegrals(graph);
	}
	
	function reposTickText(id) {
		d3.select('#' + id).select('g.x g.tick:first-child text').attr('x', '20');
		d3.select('#' + id).select('g.x g.tick:nth-child(' + $('#' + id + ' g.x g.tick').length + ') text').attr('x', '-20');
	}
	
	function rangeVertGreyAdj(range) {
		range.selectAll('g.x g.tick line').attr('y2', rgRange.height);
		range.selectAll('g.x g.tick text').attr('y', rgRange.height + 9);
		// focus.select('g.x path.domain').remove();
		// reposTickText(range);
		
	}
	
	function focusVertGreyAdj() {
		focus.selectAll('g.x g.tick line').attr('y2', mgFocus.height + 49);
		focus.selectAll('g.x g.tick text').attr('y', mgFocus.height + 49 + 9);
		// focus.select('g.x path.domain').remove();
		// reposTickText('focus');
		
	}
	
	function resizeRangeContext(brush, leftRight, id) {
		d3.select('#' + id).call(brush.extent(leftRight));	// ALERT: Problem solved!
	}
	
	function createFocusBrush() {
		// var lastX = null;
		var extent = d3.svg.brush()
			.x(mgContext.x)
			.on('brush', function() {
				/*if ($('#context g.brush rect.extent').attr('x') != lastX) 
					$('#focus g.brush rect.extent').attr('width', '0');*/
				mgFocus.x.domain(mgContext.brush.empty() ? mgContext.x.domain() : mgContext.brush.extent());
				focus.selectAll('path').attr('d', mgFocus.line);
				focus.select('.x.axis').call(mgFocus.xAxis);
				focusVertGreyAdj();
				// lastX = $('#context g.brush rect.extent').attr('x');
				plotComments(focus);
				plotNotes(focus);
				setIntegrals(focus);
				
				if (mgFocus.brush1.empty() != true) 
					resizeRangeContext(mgFocus.brush1, range1dates, 'r-1');
				if (mgFocus.brush2.empty() != true) 
					resizeRangeContext(mgFocus.brush2, range2dates, 'r-2');
				
			});
		return extent;
	}
	
	function createRangeBrush(id) {	// NOTE: Ultimately I think I'm going to have to modulize the onBrush function
		var range;
		var initial = false;
		var extent = d3.svg.brush()
			.x(mgFocus.x)
			.on('brush', function() {	// 'brushstart' is what I'm going to want to listen for
				// Sets the range graph to either range1 or range 2
				range = (id == 1) ? range1 : range2;
				// If this is the first time the brush is being rendered...
				if (initial == false) {
					// Set the initial variable to true
					initial = true;
					// If the current graph has more than one data path, remove the data paths...
					if ($('#range' + id + 'Graph > path').length > 0) 
						$('#range' + id + 'Graph > path').remove();
					// If the current graph has more than one date marker, remove the date markers...
					if ($('#range' + id + 'Graph g.x').length > 0) 
						$('#range' + id + 'Graph g.x').remove();
					// Set the range of x positions along the parent graph (dates)
					createXdomain(rgRange.x, data);
					// Plot the graph's data
					plotData(range);
					// Change all of the range graph’s data paths to transparent on initial creation...
					range.selectAll('path').style('stroke', 'transparent');
					// This is the bottom horizontal date/time bar
					range.append('g')
						.attr('class', 'x axis')
						// .attr('transform', 'translate(0,' + (mgFocus.height + 49) + ')')
						.attr('transform', 'translate(0,0)')
						.call(rgRange.xAxis);
					// Adjust the height of the vertical grey bars and their date/time markers
					rangeVertGreyAdj(range);
				}
				// If the focus graph's brush rectangle has a width greater than 0px...
				if ($('#r-' + id + ' rect.extent').attr('width') > 0) {
					
					// For each setting...
					for (var i = 0; i < settings.length; i++) {
						/*
							...set the colour of each of the range graph’s paths to the same colour of 
							their cooresponding focus paths
						*/
						range.select('path.path-' + settings[i].id).style('stroke', focus.select('path.path-' + settings[i].id).style('stroke'));
						range.select('path.ma-' + settings[i].id).style('stroke', focus.select('path.ma-' + settings[i].id).style('stroke'));
					}
					// ...for either range1 or range2, get the range of data to display
					if (id == 1) {
						rgRange.x.domain(mgFocus.brush1.empty() ? mgFocus.x.domain() : mgFocus.brush1.extent());
						range1dates = mgFocus.brush1.extent();
						// console.log(range1dates);
					} else {
						rgRange.x.domain(mgFocus.brush2.empty() ? mgFocus.x.domain() : mgFocus.brush2.extent());
						range2dates = mgFocus.brush2.extent();
						// console.log(range2dates);
					}
					// Select all of the target range's graphed lines
					range.selectAll('path').attr('d', rgRange.line);
					// Set the new data for the data points
					range.select('.x.axis').call(rgRange.xAxis);
					// Adjust the height of the vertical grey bars and their date/time markers
					rangeVertGreyAdj(range);
					setIntegrals(range);
				}
			});
		return extent;
	}
	
	function getLine(x, y) {
		var line = d3.svg.line()
			.interpolate('linear')
			.x(function(d) {
				// console.log(d.Date);
				return x(d.Date);
			})
			.y(function(d) {
				// console.log(d.Data);
				return y(d.Data);
			});
		return line;
	}
	
	/*function getArea(x, height, y) {
		var area = d3.svg.area()
			.interpolate('linear')
			.x(function(d) {
				// console.log(d);
				return x(d.Date);
			})
			.y0(height)
			.y1(function(d) {
				return y(d.Data);
			});
		return area;
	}*/
	
	function graphSettings(gSettings, width, height) {
		gSettings.width = (width - gSettings.margin.left) - gSettings.margin.right;
		gSettings.height = (height - gSettings.margin.top) - gSettings.margin.bottom;
		gSettings.x = getX(gSettings.width);
		gSettings.y = getY(gSettings.height);
		gSettings.xAxis = getXaxis(gSettings.x);
		gSettings.yAxis = getYaxis(gSettings.y);
		// graph.area = getArea(graph.x, graph.height, graph.y);
		gSettings.line = getLine(gSettings.x, gSettings.y);
		if (gSettings == mgContext) {
			gSettings.brush = createFocusBrush();
		}
		else if (gSettings == mgFocus) {
			gSettings.brush1 = createRangeBrush(1);
			gSettings.brush2 = createRangeBrush(2);
		}
		
	}
	
	function addIntegralsDiv(id) {
		$(id).append('<div class="integralData" id="id-' + id.split('#')[1] + '"><p class="noData">This graph contains no data.</p></div>');
	}
	
	function createSvg(element, id, width, height, mTop, mRight, mBottom, mLeft) {
		d3.select(element).append('svg')
			.attr('id', id)
			.attr('width', width + mLeft + mRight)
			.attr('height', height + mTop + mBottom);
	}
	
	/*function createGroup(id, mTop, mLeft) {
		var graph = d3.select('#' + id).append('g')
			.attr('transform', 'translate(' + mLeft + ',' + mTop + ')');
		return graph;
	}*/
	
	function createRect(graph, id, mTop, mLeft, width, height) {
		graph.append('g')
			.attr('class', id)// I think this needs a transform attribute
			.attr('transform', 'translate(' + mLeft + ',' + mTop + ')')
			.append('rect')
				.attr('width', width)
				.attr('height', height);
	}
	
	function updateData() {
		settings = [];
		data = [];
		var colourCount = 0;
		/*
			
			The structure of the data object...
			
			[
				{
					"DayTime": "2013-01-01 12:00:00",
					"Data": [
						{
							"id": "fa",
							"Data": 21
						}
					]
				},
				{
					"DayTime": "2013-01-01 12:00:00",
					"Data": [
						{
							"id": "fa",
							"Data": 21
						}
					]
				}
			]
			
		*/
		
		// console.log(initialData);
		
		// Create the data object...
		for (var i = 0; i < initialData.length; i++) {
			// ...if the current data collection isn’t 'comment'...
			if (initialData[i].id != 'comment') {
				// console.log(initialData[i].colour);
				if (initialData[i].length > 0) {
					// If the current data object's colour is null...
					if (initialData[i].colour == null) {
						// ...and its results object isn't null...
						if (initialData[i].results != null) {
							// ...apply one of the preset default colours to the initial value
							initialData[i].colour = colours[colourCount];
							// Increase the colourCount variable by 1
							colourCount++;
						// Otherwise, apply transparent to the data object's colour property
						} else 
							initialData[i].colour = 'transparent';
					}
					// For each collection of data in initialData Ajax response...
					var id = initialData[i].id;
					var name = initialData[i].name;
					// console.log(name);
					var colour = initialData[i].colour;
					// console.log('id: ' + id + ', name: ' + name + ', colour: ' + colour);
					// ...create an object in settings for the collected data.
					settings.push({
						"id": id,
						"name": name,
						"colour": colour
					});
					if (initialData[i].results != null) {
						// For the data’s date/data collection...
						for (var j = 0; j < initialData[i].results.length; j++) {
							var rDate = initialData[i].results[j].Date;
							var rData = initialData[i].results[j].Data;
							var rMovAv = initialData[i].results[j].MA;
							var rIntegral = initialData[i].results[j].I;
							// If there hasn't yet been a collection of date data added to the data object...
							if (data.length == 0) {
								// ...add an initial date data collection with the first entry.
								data.push({
									"DayTime": rDate,
									"Data": [
										{
											"id": id,
											"Data": rData,
											"MA": rMovAv,
											"integral": rIntegral
										}
									]
								});
							// If there is at least one collection of date data in data...
							} else {
								// Determines whether there has been a match for the current date in the loop in data
								var dateMatch = false;
								// For each date data collection in data...
								for (var k = 0; k < data.length; k++) {
									/*
										...if the current data date doesn’t match initialData’s current date...
											...and the current data date is the last one in data...
											...and dateMatch still equals false (meaning no date match was found)...
									*/
									if (data[k].DayTime != rDate && k == (data.length - 1) && dateMatch == false) {
										// ...add a new date data collection with the current initialData entry.
										data.push({
											"DayTime": rDate,
											"Data": [
												{
													"id": id,
													"Data": rData,
													"MA": rMovAv,
													"integral": rIntegral
												}
											]
										});
									// If a data date/initialData date match is found...
									} else if (data[k].DayTime == rDate) {
										// ...mark dateMatch as true.
										dateMatch = true;
										// Determines whether there has been a match for the current mood in the loop in the date data
										var idMatch = false;
										// For each collection of data in each date object in data...
										for (var l = 0; l < data[k].Data.length; l++) {
											/*
												...if the current data id doesn’t match initialData’s current id...
													...and the current data collection is the last one in the current date data collection...
													...and idMatch still equals false (meaning no id match was found)...
											*/
											if (data[k].Data[l].id != id && l == (data[k].Data.length - 1) && idMatch == false) {
												// ...add a new id/Data data collection with the current initialData entry.
												data[k].Data.push({
													"id": id,
													"Data": rData,
													"MA": rMovAv,
													"integral": rIntegral
												});
											// If an id match is found...
											} else if (data[k].Data[l].id == id) {
												// ...mark idMatch as true.
												idMatch = true;
											}
										}
									}
								}
							}
						}
					}
				}
			// If the current data collection is 'comment' and its length is less than 1...
			} else if (initialData[i].id == 'comment' && commentsCreated == false) {
				// For each comment entry...
				for (var m = 0; m < initialData[i].results.length; m++) {
					// ...create a matching object in the comments array containing the date and data
					comments.push(initialData[i].results[m]);
				}
			}
		}
		
		if (data.length > 0) {
			$('#mb').hide();
			$('#cfg div.svgWrap').show();
		} else 
			$('#mb').show();
		
		// Convert each date in data to a true JavaScript Date() object
		jQuery.each(data, function(i, d) {
			d.DayTime = parseDate(d.DayTime);
		});
		// Sort the date objects in data in order of date (from oldest to newest)
		data.sort(dateSortAsc);
		
		// Set the graph settings for the parent graph
		graphSettings(mgFocus, pgWidth, pgHeight);
		// Set the range of x positions along the parent graph (dates)
		createXdomain(mgFocus.x, data);
		// Set the range of y positions along the parent graph (0 - 100)
		createYdomain(mgFocus.y);
		
		if (commentsCreated == false) {
			commentsCreated = true;
			// Convert each date in comments to a true JavaScript Date() object
			jQuery.each(comments, function(i, c) {
				// console.log('Date: '+ c.Date);	ALERT: The problem has to do with these dates on the second pass. They've already been converted.
				c.Date = parseDate(c.Date);
				// console.log('Date: '+ c.Date);
			});
			// Sort the date objects in comments in order of date (from oldest to newest)
			comments.sort(dateSortAsc);
		}
	}
	
	function updateInitial(id, name, dates) {
		for (var i = 0; i < initialData.length; i++) {
			if (initialData[i].id == id) {
				// initialData[i].colour = null;
				initialData[i].name = name;
				initialData[i].results = dates;
			}
		}
		updateData();
	}
	
	function addFocusContext() {
		// Create the group in parent that will house the data paths for each collection of data
		if ($('#focus').length > 0) 
			$('#focus').remove();
		parent.append('g')// 'g' stands for 'group'
			.attr('id', 'focus')
			.attr('transform', 'translate(' + mgFocus.margin.left + ',' + mgFocus.margin.top + ')');
		focus = d3.select('#focus');
		
		// Chart the data paths and insert them into focus in parent
		plotData(focus);
		
		// This is the bottom horizontal date/time bar
		focus.append('g')
			.attr('class', 'x axis')
			// .attr('transform', 'translate(0,' + (mgFocus.height + 49) + ')')
			.attr('transform', 'translate(0,0)')
			.call(mgFocus.xAxis);
		focusVertGreyAdj();
		
		// The next context append() creates the extent rectangle selection tool
		for (var i = 1; i <= 2; i++) {
			focus.append('g')
				.attr('class', 'x brush')
				.attr('id', 'r-' + i);
			var brush = d3.select('#r-' + i);
			/*brush.append('text')
				.attr('x', '10')
				.attr('y', '23')
				.html('Range ' + i);*/
			if (i == 1) 
				brush.call(mgFocus.brush1);
			else 
				brush.call(mgFocus.brush2);
			brush.selectAll('rect')
				.attr('y', 0)
				.attr('height', mgFocus.height / 2);
			if (i == 2) 
				brush.attr('transform', 'translate(0,' + mgFocus.height / 2 + ')');
		}
		
		// If the parent SVG contains the fgFocus group...
		if ($('#parentSvg g.fgFocus').length > 0) 
			// ...remove it
			$('#parentSvg g.fgFocus').remove();
		
		// Insert the bordered rectangle in front of the focus graph
		createRect(parent, 'fgFocus', mgFocus.margin.top, mgFocus.margin.left, mgFocus.width, mgFocus.height + 49);
		// Set the graph settings for the parent graph’s context bar
		graphSettings(mgContext, pgWidth, pgHeight);
		
		// Set the range of x positions along the context graph (dates)
		mgContext.x.domain(mgFocus.x.domain());
		// Set the range of y positions along the context graph (0 - 100)
		mgContext.y.domain(mgFocus.y.domain());
		
		// Create the group in parent that will house the all of the dates within data (the context menu)
		if ($('#context').length > 0) 
			$('#context').remove();
		parent.append('g')
			.attr('id', 'context')
			.attr('transform', 'translate(' + mgContext.margin.left + ',' + mgContext.margin.top + ')');
		context = d3.select('#context');
		
		// This is the data path
		/*context.append('path')
			.datum(data)
			.attr('d', mgContext.line);*/
		
		// This is the bottom horizontal date/time bar
		context.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,0)')
			.call(mgContext.xAxis);
		context.selectAll('g.x g.tick text').attr('y', 8);
		// reposTickText('context');
		
		// The next context append() creates the extent rectangle selection tool
		context.append('g')
			.attr('class', 'x brush')
			.call(mgContext.brush)
			.selectAll('rect')
				.attr('y', 0)
				.attr('height', mgContext.height);
		
		focus.append('rect')
			.attr({
				'width': '32',
				'height': '296',
				'x': '-33',
				'y': '-2',
				'class': 'mask maskLeft',
				'id': 'fml'
			});
		
		focus.append('rect')
			.attr({
				'width': '18',
				'height': '296',
				'x': '1043',
				'y': '-2',
				'class': 'mask maskRight'
			});
		
		// This is the left vertical data bar
		focus.append('g')
			.attr('class', 'y axis')
			.call(mgFocus.yAxis);
		focus.selectAll('g.y g.tick line').attr('x2', mgFocus.width);
		// focus.select('g.y path.domain').remove();
		
	}
	
	function updateColourRefs(arr, id, colour) {
		jQuery.each(arr, function(i, d) {
			if (d.id == id) {
				d.colour = colour;
				console.log(d + ': ' + d.colour);
			}
		});
	}
	
	function addSwatches() {
		var otherCount = 0;
		
		if (data.length > 0) {
			// console.log(questions);
			
			$('#cfg').append('<div class="swatchColumns" id="scs"></div>');
			for (var i = 0; i < questions.length; i++) {
				var category = questions[i].category;
				/*
					ALERT: Here’s the problem with the items in the "OTHER" category: Two OTHER categories
					are being included instead of one, so I'm not including the second OTHER object...
				*/
				if (category != 'Aggregate Score' && (category != 'OTHER' || (category == 'OTHER' && otherCount == 0))) {
					if (category == 'OTHER') 
						otherCount++;
					$('#scs').append('<h2>' + category + '</h2><ul class="swatches" id="swtchs-' + category + '"></ul>');
					for (var j = 0; j < questions[i].type.length; j++) {
						var id = questions[i].type[j].id;
						var name = questions[i].type[j].name;
						$('#swtchs-' + category).append('<li class="disabled"><a href="#" title="Change ' + name + '’s colour" id="swatch-' + id + '"></a> <span>' + name + '</span></li>');
					}
				}
				/*
					ALERT: End OTHER fix.
				*/
				if (category == 'Aggregate Score') {
					$('#scs').append('<h2>Aggregate Score</h2>\
						<ul class="swatches" id="swtchs-aggregateScore">\
							<li><a href="#" title="Change Normalized Aggregate DID’s colour" id="swatch-NADID"></a> <span>Normalized Aggregate DID</span></li>\
						</ul>');
				}
				
				// For each setting...
				jQuery.each(settings, function(i, s) {
					$('#swatch-' + s.id).parent().removeClass('disabled');
					/*
						If the setting's colour is transparent, replace the swatches background colour with a 
						transparency image...
					*/
					if (s.colour == 'transparent') 
						$('#swatch-' + s.id).css('background', 'url(images/visualizer_colour_select_transparent.gif)');
					// ...otherwise, use the setting's background colour
					else 
						$('#swatch-' + s.id).css('background', s.colour);
					if (!$('#swatch-' + s.id).parent().hasClass('disabled')) {
						// Apply ColorPicker plug-in to the swatch
						$('#swatch-' + s.id).colorpicker({
							alpha: true,
							color: s.colour,
							colorFormat: 'RGBA',
							inline: false,
							select: function(event, color) {
								var newColour = color.formatted;
								var code = $(this).parents('ul.swatches').attr('id').split('-')[1];
								var name = $(this).parent().children('span').html();
								$(this).css('background', newColour);
								if (newColour.split(',')[3] == '0)') {
									newColour = 'transparent';
									$(this).css('background', 'url(images/visualizer_colour_select_transparent.gif)');
								}
								$('.path-' + s.id).css('stroke', newColour);
								$('.ma-' + s.id).css('stroke', newColour);
								$('.intLeg-' + s.id + ' div').css('background-color', newColour);
								s.colour = newColour;
								updateColourRefs(initialData, s.id, newColour);
								// updateColourRefs(integralsFocus, s.id, newColour);
								// updateColourRefs(integralsRange1, s.id, newColour);
								// updateColourRefs(integralsRange2, s.id, newColour);
								// Ajax calls are going to go in here
								jQuery.each(initialData, function(i, d) {
									if (s.id == d.id) {
										if (d.results == null) {
											$.ajax({
												type: 'GET',
												url: 'database/query_answers.php',
												data: {
													"patientID": patient,
													"questionID": d.id
												},
												dataType: 'json',
												success: function(response) {
													// console.log(response.results);
													updateInitial(s.id, code + '_' + name, response.results);
													// Reset the range1 and range2 brush settings
													mgFocus.brush1 = createRangeBrush(1);
													mgFocus.brush2 = createRangeBrush(2);
													// Re-add the parent SVG's focus graph and context graph
													addFocusContext();
													// Update the integrals table
													setIntegrals(focus);
												},
												error: function() {
													window.alert('Swatch Ajax error.');
												}
											});
										}
									}
								});
							}
						});
					}
				});
				$('#scs ul.swatches li a').click(function() {
					return false;
				});
			}
		}
	}
		
	function addGraph(element, id) {
		
		graphSettings(rgRange, rgWidth, rgHeight, false);
		
		// Create the parent SVG canvas
		createSvg(element, id + 'Svg', rgRange.width, rgRange.height + 48, rgRange.margin.top, rgRange.margin.right, rgRange.margin.bottom, rgRange.margin.left);
		var range = d3.select('#' + id + 'Svg');
		addIntegralsDiv(element);
		
		// Insert a few elements into the parent SVG (clipPath, rect)
		range.append('defs')
			.append('clipPath')
				.attr('id', 'clip-' + id)
				.append('rect')
					.attr('width', rgRange.width)
					.attr('height', rgRange.height);
		
		// Insert the white rectangle in behind the focus graph
		createRect(range, 'bgFocus', rgRange.margin.top, rgRange.margin.left, rgRange.width, rgRange.height + 48);
		createRect(range, 'bgColour', rgRange.margin.top + 22, rgRange.margin.left, rgRange.width, rgRange.height);
		
		// Set the range of x positions along the parent graph (dates)
		// createXdomain(rgRange.x, data);
		// Set the range of y positions along the parent graph (0 - 100)
		createYdomain(rgRange.y);
		
		// Create the group in parent that will house the data paths for each collection of data
		range.append('g')// 'g' stands for 'group'
			.attr('id', id + 'Graph')
			.attr('transform', 'translate(' + rgRange.margin.left + ',' + (rgRange.margin.top + 22) + ')');
		var graph = d3.select('#' + id + 'Graph');
		
		graph.append('rect')
			.attr({
				'width': '32',
				'height': '232',
				'x': '-33',
				'y': '-2',
				'class': 'mask maskLeft'
			});
		
		// This is the bottom horizontal date/time bar
		/*graph.append('g')
			.attr('class', 'x axis')
			// .attr('transform', 'translate(0,' + (mgFocus.height + 49) + ')')
			.attr('transform', 'translate(0,0)')
			.call(rgRange.xAxis);
		focusVertGreyAdj();*/
		
		// This is the left vertical data bar
		graph.append('g')
			.attr('class', 'y axis')
			.call(rgRange.yAxis);
		graph.selectAll('g.y g.tick line').attr('x2', rgRange.width);
		// graph.select('g.y path.domain').remove();
		
	}
	
	function maToggle() {
		$('a.btnMa').click(function() {
			$(this).parent().toggleClass('movingAverage');
			return false;
		});
	}
	
	function integralsToggle() {
		$('a.btnIntegrals').click(function() {
			$(this).parent().toggleClass('integrals');
			return false;
		});
	}
	
	function setup() {
		comments = [];
		commentsCreated = false;
		clinicianNotes = {
			nextId: 0,
			notes: []
		};
		
		/*
		$.ajax({
			url: '../database/query_answers_initial.php?patientID=Record06',
			type: 'GET',
			dataType: 'json',
			success: function(response) {
				
				initialData = response;
				
				// Update the data object
				updateData();
				
				// Create the parent SVG canvas
				createSvg('#svgParent', 'parentSvg', mgFocus.width, mgFocus.height, mgFocus.margin.top, mgFocus.margin.right, mgFocus.margin.bottom, mgFocus.margin.left);
				parent = d3.select('#parentSvg');
				
				parent.on('click', function() {
					console.log(d3.mouse(this));
				});
				
				// Insert a few elements into the parent SVG (clipPath, rect)
				parent.append('defs')
					.append('clipPath')
						.attr('id', 'clip-parent')
						.append('rect')
							.attr('width', mgFocus.width)
							.attr('height', mgFocus.height);
				
				// Insert the white rectangle in behind the focus graph
				createRect(parent, 'bgFocus', mgFocus.margin.top, mgFocus.margin.left, mgFocus.width, mgFocus.height + 77);
				// Insert a rectangle behind the context (zoom-in) graph
				// createRect(parent, 'bgContext', mgContext.margin.top, mgContext.margin.left, mgContext.width, mgContext.height);
				
				// Add the parent SVG's focus graph and context graph
				addFocusContext();
				
				// Add the range1 SVG
				addGraph('body', 'range1');
				r1svg = d3.select('#range1');
				range1 = d3.select('#range1Graph');
				// Add the range2 SVG
				addGraph('body', 'range2');
				r2svg = d3.select('#range2');
				range2 = d3.select('#range2Graph');
				
				// Create the swatch menu beneath the SVG graphs
				addSwatches();
			},
			error: function() {
				window.alert('Error!');
			}
		});
		
		*/
		
		// console.log(initialData);
		
		// Update the data object
		updateData();
		
		// Create the parent SVG canvas
		createSvg('#svgParent', 'parentSvg', mgFocus.width, mgFocus.height, mgFocus.margin.top, mgFocus.margin.right, mgFocus.margin.bottom, mgFocus.margin.left);
		parent = d3.select('#parentSvg');
		addIntegralsDiv('#svgParent');
		
		// Insert a few elements into the parent SVG (clipPath, rect)
		parent.append('defs')
			.append('clipPath')
				.attr('id', 'clip-parent')
				.append('rect')
					.attr('width', mgFocus.width)
					.attr('height', mgFocus.height);
		
		
		// Insert the white rectangle in behind the focus graph
		createRect(parent, 'bgFocus', mgFocus.margin.top, mgFocus.margin.left + 1, mgFocus.width, mgFocus.height + 77);
		/*createRect(parent, 'r1back', mgFocus.margin.top + 1, mgFocus.margin.left + 2, mgFocus.width, mgFocus.height / 2);
		createRect(parent, 'r2back', (mgFocus.margin.top + (mgFocus.height / 2)) + 1, mgFocus.margin.left + 2, mgFocus.width, mgFocus.height / 2);*/
		// Insert a rectangle behind the context (zoom-in) graph
		// createRect(parent, 'bgContext', mgContext.margin.top, mgContext.margin.left, mgContext.width, mgContext.height);
		
		
		
		if (data.length > 0) 
			createClinicianNotes();
		
		// Add the parent SVG's focus graph and context graph
		addFocusContext();
		
		// Add the range1 SVG
		addGraph('#svgRange1', 'range1');
		r1svg = d3.select('#range1');
		range1 = d3.select('#range1Graph');
		// Add the range2 SVG
		addGraph('#svgRange2', 'range2');
		r2svg = d3.select('#range2');
		range2 = d3.select('#range2Graph');
		
		// Create the swatch menu beneath the SVG graphs
		addSwatches();
		
		/*d3.select('#parentSvg g.bgFocus rect').on('click', function() {
			// console.log(d3.mouse(this));
			var thisX = d3.mouse(this)[0];
			var thisDate = mgFocus.x.invert(thisX);	// ALERT: SOLVED!!!
			console.log(thisDate);
		});*/
		
		maToggle();
		integralsToggle();
		
		clinicianNotes.patient = patient;
		
	}
	
	var init = function() {
		// clinician = dr;
		// console.log(clinician);
		setup();
	};
	
	return {
		deleteNote: deleteNote,
		closeNotes: closeNotes,
		closeComments: closeComments,
		init: init
	};
	
})();