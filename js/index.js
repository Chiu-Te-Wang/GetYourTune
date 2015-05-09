$('#main-table').children('tr').each(function() {
    $(this).children('td').each(function(){
        addAudioProperties(this);
    });
});

$('.tab-content').children('.tab-pane').each(function(){
	$(this).children('.sound-source').each(function(){
		addAudioProperties(this);
	});
});

var target = $('.navbar');
var targetHeight = target.outerHeight();
$(document).scroll(function(e){
    var scrollPercent = (targetHeight - window.scrollY -50) / targetHeight;
    if(scrollPercent >= 0){
        target.css('opacity', '1.0');
    }
    else{
        target.css('opacity', '0.85');
    }
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
                if($(ui.draggable).parent("#recordTabContent").length){
                    fixRecordSlowStart(this,ui.draggable.data('sound'));
                }
                else{
                    addAudioProperties(this);
                }
            }
        });
    }
});

var tunePlayingOrNot = false;
var loopInterval;
var measureCounter = 0;
var playSpeedSec = 0.8;
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
        //s.playbackRate.value = Math.min(1.0/playSpeedSec, 2.0);
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
        if($(ui.draggable).parent("#recordTabContent").length){
            fixRecordSlowStart(this,ui.draggable.data('sound'));
        }
        else{
            addAudioProperties(this);
        }
    }
});

$("a[data-toggle='tab']").click(function(e){
    var tabSelector = this;
    $(".tab-content").children(".tab-pane").each(function(){
        $(this).css("border-color",$(tabSelector).css('backgroundColor'));
    });
});

//tune play speed change event
$("#slider-speed").slider({
    range:"min",
    value:1.2,
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
var fixAudioURL;
$("#btn-record").click(function(e){
    if(!($(this).hasClass("clicked"))){
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
                    //console.log("Error : "+error.name);
                    recordErrorFunction();
                });
        }
        else{
            //console.log("getUserMedia is not support!");
            recordErrorFunction();
        }
    }
    else{
        $(this).removeClass("clicked");
        streamData.stop();
        recordRTC.stopRecording(function(audioURL) {
            var recordTag = document.getElementById('recordTabContent').appendChild(document.createElement('div'));
            recordTag.setAttribute('data-sound',audioURL);
            recordTag.className = recordTag.className + "draggable ";
            recordTag.className = recordTag.className + "col-md-1 ";
            $(recordTag).draggable({ opacity: 0.7, helper: "clone", zIndex: 100 });
            var img = document.createElement('img');
            img.src = "img/record0.png";
            img.alt="user-sound";
            img.border=3; 
            img.height=60; 
            img.width=60;
            recordTag.appendChild(img);
            recordTag.className += " sound-source ";
            $(recordTag).click(function(){
                $(this).trigger('play');
            });
            fixRecordSlowStart(recordTag, audioURL);
        });

    }
    
});
function recordErrorFunction(){
    if($("#recordErrorDialog").children("div").children("div").children(".modal-body").children().length < 1){
        $("#recordErrorDialog").children("div").children("div").children(".modal-body").append('<p>Recording is failed. Please check your record device or give the permission.</p>');
        $("#recordErrorDialog").children("div").children("div").children(".modal-header").children(".modal-title").text("Recored Failed");
    }
    $("#recordErrorDialog").modal('show');
}

function fixRecordSlowStart(object,url){
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
 
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            var bufferData = buffer.getChannelData(0);
            var offset = Math.floor(bufferData.length/3);
            object.buffer = context.createBuffer(1,bufferData.length-offset,buffer.sampleRate);
            var targetBufferData = object.buffer.getChannelData(0);
            //store init message
            for(var i = 0; i<10; i++){
                targetBufferData[i] = bufferData[i+offset];
            }
            //cutting
            for(var i = 10; i<bufferData.length-offset; i++){
                targetBufferData[i] = bufferData[i+offset];
            }
        });
    }
    request.send();

    var sourceBuf;
    object.play = function () {
        var s = context.createBufferSource();
        sourceBuf = s;
        //s.playbackRate.value = Math.min(1.0/playSpeedSec, 2.0);
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

//click sound-source event
$(".sound-source").click(function(){
	$(this).trigger('play');
});

//save tune event
$("#btn-save-tune").click(function(e){
    var bufferLength = 0;
    var bufferSampleRate = 0.0;
    $("#main-table").children("tr").children("td").each(function(){
            bufferSampleRate = this.buffer.sampleRate;
    });
    var lengthOfEachSlot = playSpeedSec*bufferSampleRate;
    var bufferLength = lengthOfEachSlot*measureNumber;

    var channelNum = $("#main-table").children("tr").length;
	var appendBuffer = context.createBuffer(channelNum, Math.floor(bufferLength), bufferSampleRate);

    var channelNumCounter = 0;
    var chunk = [];
    $("#main-table").children("tr").each(function(){
        var tempLength = 0;
        var channel = appendBuffer.getChannelData(channelNumCounter);
        $(this).children("td").each(function(){
            var bufferData = this.buffer.getChannelData(0);
            var tmpArray =  Array.prototype.slice.call(bufferData);
            var tmpArray2 = tmpArray.slice(0,Math.floor(lengthOfEachSlot)-1);
            //var bufferData2 = new Float32Array(tmpArray2)
            channel.set(new Float32Array(tmpArray2),tempLength);
            tempLength += Math.floor(lengthOfEachSlot)-1;
        });
        chunk.push(channel);
        channelNumCounter++;
    });
    //var blob = new Blob(chunk, { 'type' : 'audio/mpeg; codecs=mpeg' });
    //window.location.href = URL.createObjectURL(blob);
    //$("table").append('<div class="col-md-1"><a href="' + URL.createObjectURL(blob) + '" download="RecordRTC.mp3" target="_blank">Save RecordRTC.webm to Disk!</a></div>');
    setupSaving(appendBuffer,channelNumCounter,currCallback);

});

function setupSaving(saveBuffer,channelNum,cb){
    var WORKER_PATH = './js/Recorderjs/recorderWorker.js';
    var worker = new Worker(WORKER_PATH);
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: saveBuffer.sampleRate,
        numChannels: channelNum
      }
    });
    worker.onmessage = function(e){
      var blob = e.data;
      cb(blob);
    }
    var buffer = [];
    for (var channel = 0; channel < channelNum; channel++){
          buffer.push(saveBuffer.getChannelData(channel));
      }
    worker.postMessage({
        command: 'record',
        buffer: buffer
    });
    worker.postMessage({
        command: 'exportWAV',
        type: 'audio/wav'
    });
    //worker.postMessage({ command: 'clear' });
    //worker.terminate();
}

var outputCounter = 1;
function currCallback(blob){
    var filename = 'Output'+outputCounter+'.wav';
    outputCounter++;
    var url = URL.createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    $(link).text(filename); 
    var aContainer = window.document.createElement('div');
    aContainer.appendChild(link);
    aContainer.style.backgroundColor = "#82DA82";
    aContainer.style.textAlign = "center";
    aContainer.style.paddingTop = "5px";
    aContainer.style.paddingBottom = "5px";
    $("#saveAudioDialog").children("div").children("div").children(".modal-body").append(aContainer);
    $("#saveAudioDialog").children("div").children("div").children(".modal-header").children(".modal-title").text("Saving Your Tune");
    $("#saveAudioDialog").modal('show');
}

$("#bt-fb-share").click(function(){
     FB.ui({
    method: 'share',
    href: "http://chiu-te-wang.github.io/GetYourTune/",
    caption: "Get Your Tune",
    description: "Click, drag, and drop. Get your own tune!",
    message: "Enjoy it!",
    media: [{  
                type: "image", 
                src: "http://imgur.com/s08yUiv",    
                href: "http://www.permadi.com/"  // Go here if user click the picture
            }]
}, function(response){});
});

