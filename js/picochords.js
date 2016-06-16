"use strict";

// specify the location of the soundfont files here
var soundFontLocation = 'http://0.0.0.0/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/';

var ctx = null;
var bufferList = [];
var chordTypes = {
	'x': [0, 4, 7],
	'xm': [0, 3, 7],
	'x7': [0, 4, 7, 10],
	'xmaj7': [0, 4, 7, 11],
	'xm7': [0, 3, 7, 10],
	'xmM7': [0, 3, 7, 11],
	'xsus4': [0, 5, 7],
	'x7sus4': [0, 5, 7, 10],
	'xadd9': [0, 2, 4, 7],
	'xdim': [0, 3, 6],
	'xm7-5': [0, 3, 6, 10],
	'xaug': [0, 4, 8],
	'x6': [0, 4, 7, 9],
	'xm6': [0, 3, 7, 9],
	'x7-5': [0, 4, 6, 10],
	'x7-9': [0, 4, 7, 10, 13],
	'x7+5': [0, 4, 8, 10],
	'x9': [0, 4, 7, 10, 14],
	'xm9': [0, 3, 7, 10, 14],
	'xmaj9': [0, 4, 7, 11, 14]
};
var keyNotes = {
	'c': 0,
	'c1': 1,
	'd2': 1,
	'd': 2,
	'd1': 3,
	'e2': 3,
	'e': 4,
	'f': 5,
	'f1': 6,
	'g2': 6,
	'g': 7,
	'g1': 8,
	'a2': 8,
	'a': 9,
	'a1': 10,
	'b2': 10,
	'b': 11,
	'highc': 12
};
var keyCodes = {
	'c': 'C',
	'c1': 'C&#9839;',
	'd2': 'D&#9837;',
	'd': 'D',
	'd1': 'D&#9839;',
	'e2': 'E&#9837;',
	'e': 'E',
	'f': 'F',
	'f1': 'F&#9839;',
	'g2': 'G&#9837;',
	'g': 'G',
	'g1': 'G&#9839;',
	'a2': 'A&#9837;',
	'a': 'A',
	'a1': 'A&#9839;',
	'b2': 'B&#9837;',
	'b': 'B',
	'highc': 'C'
};
var playInversions = false;
var playUpperNote = true;

$(document).ready(function() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	ctx = new AudioContext();
	loadSound();
	setupButtons();
});

function setupButtons() {
	for (var keyCode in keyCodes) {
		var element = $.parseHTML('<div class="chordKey" id="' + keyCode + '"></div>');
		// element.attr({
		// 	class: 'chordKey',
		// 	id: keyNames[keyName]
		// });
		$('#chordList').append(element);
	}

	$('.chordKey').each(function() {
		for (var chordType in chordTypes) {
			var element = $.parseHTML('<div class="chord ' + chordType + '">' + keyCodes[$(this).attr('id')] + chordType.substring(1) + '</div>');
			$(this).append(element);
		}
	});

	$('.chord').each(function() {
		$(this).mousedown(function() {
			//console.log($(this).parent().attr('id'));
			playChord(
				$(this).parent().attr('id'),
				$(this).attr('class').split(' ')[1]
			);
		});
	});
}

function playChord(chordKey, chordType) {
	var chordTypeKeys = chordTypes[chordType];
	for (var keyIndex in chordTypeKeys) {
		var keyToPlay = chordTypeKeys[keyIndex];
		if (playInversions && keyToPlay >= 6) {
			keyToPlay -= 12;
		}
		noteOn(keyToPlay + 60 + keyNotes[chordKey], ctx.currentTime + parseFloat(keyIndex) / 40);
	}
	if (playUpperNote && chordTypeKeys.length == 3) {
		noteOn(60 + keyNotes[chordKey] + 12, ctx.currentTime + 3 / 40);
	}
}

function noteOn(note, startTime) {
	var source = ctx.createBufferSource();
	source.buffer = bufferList[note];
	source.connect(ctx.destination);
	source.start(startTime);
}

function loadSound() {
	for (var i = 21; i <= 108; i++) {
		loadBuffer(i);
	}
}

function loadBuffer(index) {
	var request = new XMLHttpRequest();
	request.open('GET', soundFontLocation + noteToKey(index) + '.mp3', true);
	request.responseType = 'arraybuffer';
	request.onload = function() {
		ctx.decodeAudioData(request.response, function(buffer) {
			bufferList[index] = buffer;
		});
	};
	request.send();
}

/******** helper functions ********/

function noteToKey(note) {
	var keyNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
	return keyNames[note % 12].toString() + (Math.floor(note / 12) - 1).toString();
}