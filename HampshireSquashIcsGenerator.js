function initJQuery() {
    var jQueryVersion="3.7.1";
    var a=document.createElement("script");
    a.src="https://code.jquery.com/jquery-"+jQueryVersion+".js";
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
    ics.push("PRODID:-//https://github.com/nickbrowndev/SquashCalendarGenerator");
    ics.push(getTimeZoneIcsInfo());
    jQuery.each(fixtures, function(index, fixture) {
        ics.push("BEGIN:VEVENT");
        //ics.push("UID:" + fixture.date + (fixture.homeTeam+fixture.awayTeam).replace("\\s", ""));
        ics.push("UID:" + fixture.resultUrl);
        ics.push("DTSTAMP:" + getTimeStamp());
        var homeAway = fixture.isHome ? "H" : "A";
        var team = fixture.isHome ? fixture.homeTeam : fixture.awayTeam;
        var opponent = fixture.isHome ? fixture.awayTeam : fixture.homeTeam;
        var summary = replaceInString(EVENT_NAME_TEMPLATE, homeAway, team, opponent);
        ics.push("SUMMARY:" + summary);
        ics.push("STATUS:CONFIRMED");
        ics.push("DTSTART;"+TZID+":"+formatDate(fixture.date)+"T"+formatTime(fixture.time));
        ics.push("DURATION:PT4H");
        ics.push("LOCATION:" + (fixture.isHome ? "Five Rivers Leisure Center" : fixture.address));
        ics.push("CATEGORIES:Squash");
        ics.push("DESCRIPTION:Squash Match " + fixture.homeTeam + " vs " + fixture.awayTeam + "\\n " + fixture.date + " " + fixture.time + "\\n" + fixture.league + "\\n" + fixture.resultUrl);
        ics.push("BEGIN:VALARM");
        ics.push("TRIGGER:-PT3H");
        ics.push("ACTION:DISPLAY");
        ics.push("DESCRIPTION:" + summary);
        ics.push("END:VALARM");
        ics.push("BEGIN:VALARM");
        ics.push("TRIGGER:-P1D");
        ics.push("ACTION:AUDIO");
        ics.push("END:VALARM");
        ics.push("END:VEVENT");
    });
    ics.push("END:VCALENDAR");

    return ics.join("\r\n");
}

function getTimeStamp() {
    var date = new Date();
    var year = date.getFullYear();
    var month = padTo2Chars(date.getMonth() + 1);
    var day = date.getDate();
    var hours = padTo2Chars(date.getHours());
    var minutes = padTo2Chars(date.getMinutes());
    var seconds = padTo2Chars(date.getSeconds());
    return year + month + day + "T" + hours + minutes + seconds;
}


function padTo2Chars(value) {
    return ("0" + value).slice(-2);
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
    var month = padTo2Chars(monthIndexes.indexOf(dateStringParts[1].toUpperCase()) + 1);
    var year = dateStringParts[2];
    return year + month + day;
}

function getTimeZoneIcsInfo() {
return "BEGIN:VTIMEZONE" +
"\nTZID:Europe/London" +
"\nTZURL:http://tzurl.org/zoneinfo/Europe/London" +
"\nX-LIC-LOCATION:Europe/London" +
"\nBEGIN:DAYLIGHT" +
"\nTZOFFSETFROM:+0000" +
"\nTZOFFSETTO:+0100" +
"\nTZNAME:BST" +
"\nDTSTART:19810329T010000" +
"\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU" +
"\nEND:DAYLIGHT" +
"\nBEGIN:STANDARD" +
"\nTZOFFSETFROM:+0100" +
"\nTZOFFSETTO:+0000" +
"\nTZNAME:GMT" +
"\nDTSTART:19961027T020000" +
"\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU" +
"\nEND:STANDARD" +
"\nBEGIN:STANDARD" +
"\nTZOFFSETFROM:-000115" +
"\nTZOFFSETTO:+0000" +
"\nTZNAME:GMT" +
"\nDTSTART:18471201T000000" +
"\nRDATE:18471201T000000" +
"\nEND:STANDARD" +
"\nBEGIN:DAYLIGHT" +
"\nTZOFFSETFROM:+0000" +
"\nTZOFFSETTO:+0100" +
"\nTZNAME:BST" +
"\nDTSTART:19160521T020000" +
"\nRDATE:19160521T020000" +
"\nRDATE:19170408T020000" +
"\nRDATE:19180324T020000" +
"\nRDATE:19190330T020000" +
"\nRDATE:19200328T020000" +
"\nRDATE:19210403T020000" +
"\nRDATE:19220326T020000" +
"\nRDATE:19230422T020000" +
"\nRDATE:19240413T020000" +
"\nRDATE:19250419T020000" +
"\nRDATE:19260418T020000" +
"\nRDATE:19270410T020000" +
"\nRDATE:19280422T020000" +
"\nRDATE:19290421T020000" +
"\nRDATE:19300413T020000" +
"\nRDATE:19310419T020000" +
"\nRDATE:19320417T020000" +
"\nRDATE:19330409T020000" +
"\nRDATE:19340422T020000" +
"\nRDATE:19350414T020000" +
"\nRDATE:19360419T020000" +
"\nRDATE:19370418T020000" +
"\nRDATE:19380410T020000" +
"\nRDATE:19390416T020000" +
"\nRDATE:19400225T020000" +
"\nRDATE:19460414T020000" +
"\nRDATE:19470316T020000" +
"\nRDATE:19480314T020000" +
"\nRDATE:19490403T020000" +
"\nRDATE:19500416T020000" +
"\nRDATE:19510415T020000" +
"\nRDATE:19520420T020000" +
"\nRDATE:19530419T020000" +
"\nRDATE:19540411T020000" +
"\nRDATE:19550417T020000" +
"\nRDATE:19560422T020000" +
"\nRDATE:19570414T020000" +
"\nRDATE:19580420T020000" +
"\nRDATE:19590419T020000" +
"\nRDATE:19600410T020000" +
"\nRDATE:19610326T020000" +
"\nRDATE:19620325T020000" +
"\nRDATE:19630331T020000" +
"\nRDATE:19640322T020000" +
"\nRDATE:19650321T020000" +
"\nRDATE:19660320T020000" +
"\nRDATE:19670319T020000" +
"\nRDATE:19680218T020000" +
"\nRDATE:19720319T020000" +
"\nRDATE:19730318T020000" +
"\nRDATE:19740317T020000" +
"\nRDATE:19750316T020000" +
"\nRDATE:19760321T020000" +
"\nRDATE:19770320T020000" +
"\nRDATE:19780319T020000" +
"\nRDATE:19790318T020000" +
"\nRDATE:19800316T020000" +
"\nEND:DAYLIGHT" +
"\nBEGIN:STANDARD" +
"\nTZOFFSETFROM:+0100" +
"\nTZOFFSETTO:+0000" +
"\nTZNAME:GMT" +
"\nDTSTART:19161001T030000" +
"\nRDATE:19161001T030000" +
"\nRDATE:19170917T030000" +
"\nRDATE:19180930T030000" +
"\nRDATE:19190929T030000" +
"\nRDATE:19201025T030000" +
"\nRDATE:19211003T030000" +
"\nRDATE:19221008T030000" +
"\nRDATE:19230916T030000" +
"\nRDATE:19240921T030000" +
"\nRDATE:19251004T030000" +
"\nRDATE:19261003T030000" +
"\nRDATE:19271002T030000" +
"\nRDATE:19281007T030000" +
"\nRDATE:19291006T030000" +
"\nRDATE:19301005T030000" +
"\nRDATE:19311004T030000" +
"\nRDATE:19321002T030000" +
"\nRDATE:19331008T030000" +
"\nRDATE:19341007T030000" +
"\nRDATE:19351006T030000" +
"\nRDATE:19361004T030000" +
"\nRDATE:19371003T030000" +
"\nRDATE:19381002T030000" +
"\nRDATE:19391119T030000" +
"\nRDATE:19451007T030000" +
"\nRDATE:19461006T030000" +
"\nRDATE:19471102T030000" +
"\nRDATE:19481031T030000" +
"\nRDATE:19491030T030000" +
"\nRDATE:19501022T030000" +
"\nRDATE:19511021T030000" +
"\nRDATE:19521026T030000" +
"\nRDATE:19531004T030000" +
"\nRDATE:19541003T030000" +
"\nRDATE:19551002T030000" +
"\nRDATE:19561007T030000" +
"\nRDATE:19571006T030000" +
"\nRDATE:19581005T030000" +
"\nRDATE:19591004T030000" +
"\nRDATE:19601002T030000" +
"\nRDATE:19611029T030000" +
"\nRDATE:19621028T030000" +
"\nRDATE:19631027T030000" +
"\nRDATE:19641025T030000" +
"\nRDATE:19651024T030000" +
"\nRDATE:19661023T030000" +
"\nRDATE:19671029T030000" +
"\nRDATE:19711031T030000" +
"\nRDATE:19721029T030000" +
"\nRDATE:19731028T030000" +
"\nRDATE:19741027T030000" +
"\nRDATE:19751026T030000" +
"\nRDATE:19761024T030000" +
"\nRDATE:19771023T030000" +
"\nRDATE:19781029T030000" +
"\nRDATE:19791028T030000" +
"\nRDATE:19801026T030000" +
"\nRDATE:19811025T020000" +
"\nRDATE:19821024T020000" +
"\nRDATE:19831023T020000" +
"\nRDATE:19841028T020000" +
"\nRDATE:19851027T020000" +
"\nRDATE:19861026T020000" +
"\nRDATE:19871025T020000" +
"\nRDATE:19881023T020000" +
"\nRDATE:19891029T020000" +
"\nRDATE:19901028T020000" +
"\nRDATE:19911027T020000" +
"\nRDATE:19921025T020000" +
"\nRDATE:19931024T020000" +
"\nRDATE:19941023T020000" +
"\nRDATE:19951022T020000" +
"\nEND:STANDARD" +
"\nBEGIN:DAYLIGHT" +
"\nTZOFFSETFROM:+0100" +
"\nTZOFFSETTO:+0200" +
"\nTZNAME:BDST" +
"\nDTSTART:19410504T020000" +
"\nRDATE:19410504T020000" +
"\nRDATE:19420405T020000" +
"\nRDATE:19430404T020000" +
"\nRDATE:19440402T020000" +
"\nRDATE:19450402T020000" +
"\nRDATE:19470413T020000" +
"\nEND:DAYLIGHT" +
"\nBEGIN:DAYLIGHT" +
"\nTZOFFSETFROM:+0200" +
"\nTZOFFSETTO:+0100" +
"\nTZNAME:BST" +
"\nDTSTART:19410810T030000" +
"\nRDATE:19410810T030000" +
"\nRDATE:19420809T030000" +
"\nRDATE:19430815T030000" +
"\nRDATE:19440917T030000" +
"\nRDATE:19450715T030000" +
"\nRDATE:19470810T030000" +
"\nEND:DAYLIGHT" +
"\nBEGIN:STANDARD" +
"\nTZOFFSETFROM:+0100" +
"\nTZOFFSETTO:+0100" +
"\nTZNAME:BST" +
"\nDTSTART:19681027T000000" +
"\nRDATE:19681027T000000" +
"\nEND:STANDARD" +
"\nBEGIN:STANDARD" +
"\nTZOFFSETFROM:+0000" +
"\nTZOFFSETTO:+0000" +
"\nTZNAME:GMT" +
"\nDTSTART:19960101T000000" +
"\nRDATE:19960101T000000" +
"\nEND:STANDARD" +
"\nEND:VTIMEZONE";
}

executeScript();
