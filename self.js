$('#main-table').children('tr').each(function() {
    $(this).children('td').each(function(){
        addAudioProperties(this);
    });
});

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
var interval;
var measureCounter = 0;
var playSpeedSec = 0.3;
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
        }, playSpeedSec*1000);
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
    var sourceBuf;
    object.play = function () {
        var s = context.createBufferSource();
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
/*
var myRecord;
var streamData;
$("#btn-record").click(function(e){
    if(!($(this).hasClass("clicked"))){
        console.log("start recording!");
        $(this).addClass("clicked");
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;
        if(navigator.getUserMedia){
            navigator.getUserMedia( {audio:true}, 
                function(stream){
                    streamData = stream;
                    var input = context.createMediaStreamSource(stream); 
                    myRecord = new Recorder(input, {
                      workerPath: '/js/Recorderjs/recorderWorker.js'
                    });
                    myRecord.record();
                },
                function(error){
                    console.log("Error : "+error.name);
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
        myRecord.stop();
        myRecord.exportWAV(function(e){
            myRecord.clear();
            Recorder.forceDownload(e, "filename.wav");
            console.log("Saving!");
        });

    }
    
});
*/

/*$('#tests').each(function() {
    addAudioProperties(this);
});
$('#tests').click(function() {
    this.play();
});
$('button').on("click",function(){
    $(this).parents('div').children('audio').trigger('play');
});*/

var streamData;
var recordRTC;
$("#btn-record").click(function(e){
    if(!($(this).hasClass("clicked"))){
        console.log("start recording!");
        $(this).addClass("clicked");
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;
        if(navigator.getUserMedia){
            navigator.getUserMedia( {audio:true}, 
                function(stream){
                    streamData = stream;
                    recordRTC = RecordRTC(stream);
                    recordRTC.startRecording();
                },
                function(error){
                    console.log("Error : "+error.name);
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
            $("#recordTest").data("sound", audioURL);

            var recordedBlob = recordRTC.getBlob();
            recordRTC.getDataURL(function(dataURL) { });
        });

    }
    
});
