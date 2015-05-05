$('#main-table').children('tr').each(function() {
    $(this).children('td').each(function(){
        addAudioProperties(this);
    });
});

//add new row event
var measureNumber = 12;
var soundArray = ["audio/sound0.mp3","audio/sound1.mp3","audio/sound2.mp3","audio/sound3.mp3","audio/sound4.mp3","audio/sound5.mp3","audio/sound6.mp3","audio/sound7.mp3"]
$('#btn-add-table').on("click",function(){
    var row = document.getElementById('main-table').appendChild(document.createElement('tr'));
    var i = 0;
    var cellNumber = measureNumber;
    for(i = 0; i<cellNumber; i++){
        var cell = row.appendChild(document.createElement('td'));
        cell.setAttribute('data-sound',soundArray[0]);
        cell.className = cell.className + "droppable";
        var img = document.createElement('img');
        img.src = "img/default.png";
        img.alt="kk";
        img.border=3; 
        img.height=60; 
        img.width=60;
        cell.appendChild(img);
        addAudioProperties(cell);
        $(cell).droppable({
            drop: function(event, ui) {
                $(this).children('img').attr('src',ui.draggable.children('img').attr('src'));
                $(this).data('sound',ui.draggable.data('sound'));
                addAudioProperties(this);
            }
        });
    }
});

var tunePlayingOrNot = false;
var loopInterval;
var measureCounter = 0;
var playSpeedSec = 0.5;
$('#btn-play-tune').on("click",function(){
    if(tunePlayingOrNot){
        clearInterval(loopInterval);
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
        loopInterval = setInterval(loopPlayCallback, playSpeedSec*1000);
    }
});

function loopPlayCallback(){
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
}

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
    var sourceBuf;
    object.play = function () {
        var s = context.createBufferSource();
        s.playbackRate.value = Math.min(1.0/playSpeedSec, 2.0);
        sourceBuf = s;
        s.buffer = object.buffer;
        s.connect(context.destination);
        s.start(0);
        object.s = s;
    }
    object.stop = function () {
        sourceBuf.stop(0);
        object.s = sourceBuf;
    }
}

$('#sidebar').children('#btn-sidebar-toggle').click(function(){
    $('#sidebar').hide();
    $('#sidebar2').show( "slide", { direction: "up" }, "slow" );
});
$('#sidebar2').children("#toggle-wraper").children('#btn-sidebar-toggle2').click(function(){
    $('#sidebar2').hide( "slide", { direction: "up" }, "slow" );
    $('#sidebar').show();
});

$('.draggable').draggable({ opacity: 0.7, helper: "clone", zIndex: 100 });
$('.droppable').droppable({
    drop: function(event, ui) {
        $(this).children('img').attr('src',ui.draggable.children('img').attr('src'));
        $(this).data('sound',ui.draggable.data('sound'));
        addAudioProperties(this);
    }
});

$("a[data-toggle='tab']").click(function(e){
    var tabSelector = this;
    $(".tab-content").children(".tab-pane").each(function(){
        $(this).css("border-color",$(tabSelector).css('backgroundColor'));
        console.log($(this).css("border-color"));
    });
});

//tune play speed change event
$("#slider-speed").slider({
    range:"min",
    value:1,
    step:0.1,
    min:0.5,
    max:5.0,
    slide : function(event, ui){
        playSpeedSec = 1.0/ui.value;
        if(tunePlayingOrNot){
            clearInterval(loopInterval);
            loopInterval = setInterval(loopPlayCallback, playSpeedSec*1000);
        }
    }
});
//record event
var streamData;
var recordRTC;
$("#btn-record").click(function(e){
    if(!($(this).hasClass("clicked"))){
        console.log("start recording!");
        var tempRecordBtn = this;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;
        if(navigator.getUserMedia){
            navigator.getUserMedia( {audio:true}, 
                function(stream){
                    streamData = stream;
                    recordRTC = RecordRTC(stream);
                    recordRTC.startRecording();
                    $(tempRecordBtn).addClass("clicked");
                },
                function(error){
                    console.log("Error : "+error.name);
                    $("#recordErrorDialog").modal('show');
                });
        }
        else{
            console.log("getUserMedia is not support!");
        }
    }
    else{
        console.log("stop recording!");
        $(this).removeClass("clicked");
        streamData.stop();
        recordRTC.stopRecording(function(audioURL) {
            var recordTag = document.getElementById('recordTabContent').appendChild(document.createElement('div'));
            recordTag.setAttribute('data-sound',audioURL);
            recordTag.className = recordTag.className + "draggable ";
            recordTag.className = recordTag.className + "col-md-1 ";
            $(recordTag).draggable({ opacity: 0.7, helper: "clone", zIndex: 100 });
            var img = document.createElement('img');
            img.src = "img/icon8.png";
            img.alt="user-sound";
            img.border=3; 
            img.height=60; 
            img.width=60;
            recordTag.appendChild(img);

            //$("table").append('<div class="col-md-1"><a href="' + audioURL + '" download="RecordRTC.webm" target="_blank">Save RecordRTC.webm to Disk!</a></div>');
            //addAudioProperties("#recordTest");

            /*var recordedBlob = recordRTC.getBlob();
            recordRTC.getDataURL(function(dataURL) {
                console.log("dataURL : "+dataURL);
            });
            console.log("recordedBlob : "+recordedBlob);*/
        });

    }
    
});

//save tune event
$("#btn-save-tune").click(function(e){
	
});
