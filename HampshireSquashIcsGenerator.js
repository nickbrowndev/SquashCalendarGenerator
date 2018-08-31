function initJQuery() {
    var jQueryVersion="3.3.1";
    var a=document.createElement("script");
    a.src="//ajax.googleapis.com/ajax/libs/jquery/"+jQueryVersion+"/jquery.js";
    a.type="text/javascript";
    document.getElementsByTagName("head")[0].appendChild(a);
}

function executeScript() {
    initJQuery();
    var fixtures = parseFixtures();
    var fixturesIcs = generateIcs(fixtures);
    //window.open("data:text/plain;charset=utf-8," + encodeURIComponent(fixturesIcs));
    var wnd = window.open("about:blank","","_blank");
    wnd.document.write("<PRE>\n" + fixturesIcs + "\n</PRE>");
}

function parseFixtures() {
    var $fixtureRows = jQuery("#leaguesfull").find("tr:has(td)");
    var fixtures = [];
    $fixtureRows.each(function(index, element) {
        fixtures.push(parseFixtureRow(this));
    });
    return fixtures;
}

function parseFixtureRow(fixtureRow) {
    var fixture = {};
    var $fixtureRow = jQuery(fixtureRow);
    var $fixtureRowColumns = $fixtureRow.children();
    fixture.resultUrl = window.location.hostname + "/" + $fixtureRowColumns.eq(1).find("a").attr("href");
    fixture.date = $fixtureRowColumns.eq(1).find("a").text();
    fixture.time = $fixtureRowColumns.eq(2).first().text();
    fixture.league = $fixtureRowColumns.eq(3).first().text();
    fixture.homeTeam = $fixtureRowColumns.eq(6).first().text();
    fixture.awayTeam = $fixtureRowColumns.eq(10).first().text();
    
    var $directionsColumn = $fixtureRowColumns.eq(7);
    var $directionsLink = $directionsColumn.find("a");
    if ($directionsLink.length) {
        var url = $directionsLink.prop("href");
        var destinationAddressParam = "daddr=";
        var destinationPostcode = decodeURIComponent(url.substring(url.indexOf(destinationAddressParam)+destinationAddressParam.length));
        fixture.address = destinationPostcode;
        fixture.isHome = false;
    } else {
        fixture.isHome = true;
    }
    return fixture;
}


function generateIcs(fixtures) {
    var fixturesText = "";

    const TZID = "TZID=Europe/London";
    
    const EVENT_NAME_TEMPLATE = "Squash Match (%) % vs %";
    var ics = []; 
    ics.push("BEGIN:VCALENDAR");
    ics.push("VERSION:2.0");
    ics.push("PRODID:-//https://github.com/nickbrowndev/HampshireSquashCalendar");
    jQuery.each(fixtures, function(index, fixture) {
        ics.push("BEGIN:VEVENT");
        var homeAway = fixture.isHome ? "H" : "A";
        var team = fixture.isHome ? fixture.homeTeam : fixture.awayTeam;
        var opponent = fixture.isHome ? fixture.awayTeam : fixture.homeTeam;
        ics.push("SUMMARY:" + replaceInString(EVENT_NAME_TEMPLATE, homeAway, team, opponent));
        ics.push("STATUS:CONFIRMED");
        ics.push("DTSTART;"+TZID+":"+formatDate(fixture.date)+"T"+formatTime(fixture.time));
        ics.push("DURATION:P4H");
        ics.push("LOCATION:" + (fixture.isHome ? "Five Rivers Leisure Center" : fixture.address));
        ics.push("CATEGORIES:Squash");
        ics.push("DESCRIPTION:Squash Team Match " + fixture.homeTeam + " vs " + fixture.awayTeam + "\n " + fixture.date + " " + fixture.time + "\n " + fixture.resultUrl);
        ics.push("BEGIN:VALARM");
        ics.push("TRIGGER:-PT3H");
        ics.push("ACTION:DISPLAY");
        ics.push("END:VALARM");
        ics.push("BEGIN:VALARM");
        ics.push("TRIGGER:-P1D");
        ics.push("ACTION:DISPLAY");
        ics.push("END:VALARM");
        ics.push("END:VEVENT");
    });
    ics.push("END:VCALENDAR");

    return ics.join("\r\n");
}

function replaceInString(template) {
    var result = template;
    for (var i = 1; i < arguments.length; i++) {
        result = result.replace("%", arguments[i]);
    }
    return result;
}

function formatTime(time) {
    return time.replace(":","")+"00";
}

var monthIndexes = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
function formatDate(dateString) {
    var dateStringParts = dateString.split("-");
    var day = dateStringParts[0];
    var month = monthIndexes.indexOf(dateStringParts[1].toUpperCase());
    var year = dateStringParts[2];
    return year + (month < 10 ? "0" : "") + month + day;
}

executeScript();
