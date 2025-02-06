function makeNewsPane(image, text, url) {
	var image_html = "";
	if (image) {
		image_html = "<img class='post_image' src='" + image + "' />";
	}

	//console.log(text.linkify());
	var words = text.split(" ");
	if (words.length > 100) {
		words = words.slice(0, 100);
		text = words.join(" ").linkify() + "... <a href='" + url + "'> Read more</a>";
	} else {
		text = text.linkify();
	}

	return "<div data-link='" + url + "' class='row news_pane'>" +
				"<div class='col-sm-3'>" + 
					image_html +
				"</div>" +
				"<div class='col-sm-9 text-muted news_text'>" + 
					text + 
				"</div>" +
			"</div>";
			
}


$(document).ready(function() {
	$.ajaxSetup({ cache: true });
	$.getScript('https://connect.facebook.net/en_US/sdk.js', function(){
		FB.init({
			appId: '633208140137328',
			version: 'v4.0'
		});

		var pageAccessToken = 'EAAIZC5kJDA3ABAMvAsM7u0aJgBZBZCjPtx9L0UCqOFMClHOZA8GvKWTEzrZBNTZCrnraVRV3qVArjuCiHVg5kq5HM1FQ4ameQaKZCXUWXLgJbX90YveVtIZArdTitrhQBg0XZBisfETYeY3Ia1tKMN2eZAiZBYs2WWaRqL6ud0QgPC41yU4kw1pf1UN';
		FB.api('/ucsdgradwic/posts?fields=picture,full_picture,link,message,created_time,permalink_url', {
			access_token: pageAccessToken,
			limit: 10
		}, function(response) {
			console.log(response);
			var num_posted = 0;
			if (response.data) {
				// DO STUFF HERE
				response.data.forEach(function(post) {
					if ((!post.link || post.link.indexOf("/events/") == -1) && num_posted < 3 && post.message) { 
						// it wasn't just an event share
						$("#post_content").append(makeNewsPane(post.full_picture, post.message, post.permalink_url));
						num_posted++;
					}
				});

				$(".linkified").click(function(e) {
					e.stopPropagation();
				});

				$(".news_pane").click(function() {
					window.location = $(this).attr("data-link");
				});
			}
			

		});

		FB.api('/ucsdgradwic/events?fields=cover,id,start_time,name,description,place,link', {
			access_token: pageAccessToken
		}, function(response) {
			console.log(response);

			if (response.data) {
				var item = response.data;
				var monthList = [ "Jan", "Feb", "Mar", "Apr","May","June","July", "Aug", "Sept", "Oct", "Nov", "Dec"];

				var upcoming_output="";
				var past_output="";

				var linkToEvent = "";
				var eventPlaceName = "";
				var eventTime = "";
				var isPastEvent = true;


				var currentDate = new Date();
				var currday = currentDate.getDate();
				var curryear = currentDate.getFullYear();
				var currmonth = currentDate.getMonth()+1;
				//console.log("Current :"+currentDate);




				for (var i in item) {
	                //console.log(item);
					var timeStr = item[i].start_time;
					//console.log(timeStr);
					var date = new Date(dateFromISO8601(timeStr));
					var day = date.getDate();
					var year = date.getFullYear();
					var month = date.getMonth()+1;
					var dateStr = month+"-"+day+"-"+year;
					console.log(dateStr);
					console.log(item[i].name);
					console.log(curryear);
					console.log(currmonth);
					console.log(currday);
					console.log(year);
					console.log(month);
					console.log(day);

					if (year >= (curryear-1)){

						if ((year > curryear) ||
							(year == curryear && month > currmonth) ||
							(year == curryear && month == currmonth && day >= currday)) {
							var next_output = "";
							next_output+="<li>";
							next_output+= "<time datetime="+dateStr+"\">"+
							"<span class=\"day\">"+ day + "</span>"+
							"<span class=\"month\">"+monthList[date.getMonth()]+"</span>"+
							"<span class=\"year\">"+year+"</span>"+
							"</time>"
							next_output+= "<div class=\"info\">" + "<h2 class=\"title\">" + item[i].name + "</h2>"

							if(!item[i].place)
							eventPlaceName = "TBD";
							else
							eventPlaceName = item[i].place.name;

							if(!timeStr)
							eventTime = "TBD";
							else
							eventTime = timeStr.slice(11, 16);




							next_output+= "<p class=\"desc\">"+eventPlaceName+"<br>"+"Time: "+eventTime + "<br><a style=\'color: #A351CC\' target=\'_blank\' href=\'https://facebook.com/" + item[i].id + "\'>RSVP</a></p>"+"</div>"

							next_output+="</li>";

							upcoming_output = next_output + upcoming_output;
						} else if ((year == curryear && month >= (currmonth - 6)) ||
							(currmonth <= 6 && year == curryear - 1 && month >= (currmonth + 6))) {
							// within 6 months only
							console.log("within 6 months");
							past_output+="<li>";
							past_output+= "<time datetime="+dateStr+"\">"+
							"<span class=\"day\">"+ day + "</span>"+
							"<span class=\"month\">"+monthList[date.getMonth()]+"</span>"+
							"<span class=\"year\">"+year+"</span>"+
							"</time>"
							past_output+= "<div class=\"info\">" + "<h2 class=\"title\">" + item[i].name + "</h2>"

							if(!item[i].place)
							eventPlaceName = "TBD";
							else
							eventPlaceName = item[i].place.name;

							if(!timeStr)
							eventTime = "TBD";
							else
							eventTime = timeStr.slice(11, 16);




							past_output+= "<p class=\"desc\">"+eventPlaceName+"<br>"+"Time: "+eventTime + "<br><a style=\'color: #A351CC\' target=\'_blank\' href=\'https://facebook.com/" + item[i].id + "\'>RSVP</a></p>"+"</div>"

							past_output+="</li>";
						}


					}//end for loop
				}
				if (upcoming_output == "") {
					$("#upcoming_none").show();
					$("#upcoming_events").hide();
				} else {
					document.getElementById("upcoming_events").innerHTML=upcoming_output;
				}

				document.getElementById("past_events").innerHTML=past_output;

			}


		});

		var outputgallery="";

		FB.api('/ucsdgradwic/photos?fields=images,link&type=uploaded', {
			access_token: pageAccessToken
		}, function(response) {
			//console.log(response);

			var item = response.data;

			var output="";

			//for (var i in item) {
			for (var i=0;i<6;i++) {

				//console.log(item[i].link);

				//output+= "<p class=\"desc\">"+eventPlaceName+"<br>"+"Time: "+eventTime+"</p>"+"</div>"

				//output+="<li>";

				//output+="<div data-alt=\"img03\" data-description=\"<h3>Sky high</h3>\" data-max-width=\"1800\" data-max-height=\"1350\">";

				//output+="<div data-src=\""+item[i].images[0].source+"\" data-min-width=\"300\"></div>";

				//output+="</li>";

				outputgallery+="<div class=\"col-lg-6 col-md-6 gallery-set text-center\">";
				outputgallery+="<a href=\""+item[i].link+"\"><img src = \""+item[i].images[4].source+"\" style='width:auto; max-height:300px'  /></a></div>";


				//output+="<img src=\""+item[i].images[0].source+"\" />";





			}//end for loop

			//document.getElementById("gallery").innerHTML=outputgallery;

		});



	});
});

// parse ISO8601 date format in any browser
//(date format compatibility with all browsers)
function dateFromISO8601(isoDateString) {
	var parts = isoDateString.match(/\d+/g);
	var isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
	var isoDate = new Date(isoTime);

	return isoDate;
}
