$('#main-table').children('tr').each(function() {
    $(this).children('td').each(function(){
        addAudioProperties(this);
    });
});

var measureNumber = 12;
var soundArray = ["audio/high-drum.mp3","audio/low-drum.mp3"]
$('#btn-add-table').on("click",function(){
    var row = document.getElementById('main-table').appendChild(document.createElement('tr'));
    var i = 0;
    var cellNumber = measureNumber;
    for(i = 0; i<cellNumber; i++){
        var cell = row.appendChild(document.createElement('td'));
        cell.setAttribute('data-sound',soundArray[0]);
        var img = document.createElement('img');
        img.src = "img/koala.jpg";
        img.alt="kk";
        img.border=3; 
        img.height=60; 
        img.width=60;
        cell.appendChild(img);
        addAudioProperties(cell);
    }
});

var tunePlayingOrNot = false;
var interval;
var measureCounter = 0;
$('#btn-play-tune').on("click",function(){
    if(tunePlayingOrNot){
        clearInterval(interval);
        tunePlayingOrNot = false;
        var previousTdIndex = measureCounter-1;
        if(measureCounter == 0){ previousTdIndex = measureNumber-1;}
        $('#main-table').children('tr').each(function() {
            $(this).children('td').eq(previousTdIndex).removeClass("myhover");
            $(this).children('td').eq(previousTdIndex).trigger('stop');
        });
        measureCounter = 0;
        $(this).html("Play");
    }
    else{
        tunePlayingOrNot = true;
        $(this).html("Stop");
        interval = setInterval(function () {
            var previousTdIndex = measureCounter-1;
            if(measureCounter == 0){ previousTdIndex = measureNumber-1;}
            $('#main-table').children('tr').each(function() {
                $(this).children('td').eq(previousTdIndex).removeClass("myhover");
                $(this).children('td').eq(previousTdIndex).trigger('stop');
                $(this).children('td').eq(measureCounter).addClass("myhover");
                $(this).children('td').eq(measureCounter).trigger('play');
            });
            measureCounter++;
            if(measureCounter == measureNumber){measureCounter = 0;}
        }, 500);
    }
});

var context = new AudioContext();
function loadAudio( object, url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
 
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            object.buffer = buffer;
        });
    }
    request.send();
}

function addAudioProperties(object) {
    object.source = $(object).data('sound');
    loadAudio(object, object.source);
    object.play = function () {
        var s = context.createBufferSource();
        s.buffer = object.buffer;
        s.connect(context.destination);
        s.start(0);
        object.s = s;
    }
}

$('#sidebar').children('#btn-sidebar-toggle').click(function(){
    $('#sidebar').hide();
    $('#sidebar2').show( "slide", { direction: "up" }, "slow" );
});
$('#sidebar2').children('#btn-sidebar-toggle2').click(function(){
    $('#sidebar2').hide( "slide", { direction: "up" }, "slow" );
    $('#sidebar').show();
});

$('.draggable').draggable({ opacity: 0.7, helper: "clone" });
$('.droppable').droppable({
    drop: function(event, ui) {
        console.log(ui.draggable.children('img').attr('src'));
        $(this).children('img').attr('src',ui.draggable.children('img').attr('src'));
    }
});

/*$('#tests').each(function() {
    addAudioProperties(this);
});
$('#tests').click(function() {
    this.play();
});
$('button').on("click",function(){
    $(this).parents('div').children('audio').trigger('play');
});*/


