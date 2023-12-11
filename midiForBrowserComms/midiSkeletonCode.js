'use strict'

var midi = null;   //we'll use two global variables. I know, a bit untidy but if it bothers you, you can always make it slicker yourself... :)
var midiOutHandle;


//call this function to get things started :)
function midiInit(){
	navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure); 
}

function onMIDISuccess(midiAccess) {
  console.log("MIDI ready!");
  midi = midiAccess;
  listInputsAndOutputs(midi);
  startMessageHandlers(midi); 
}

function onMIDIFailure(msg) {
  console.error(`Failed to get MIDI access - ${msg}`);
}


//list the details of attached devices when we do the initial setup. You'll probably need to read the output in the console to find out how your device identifies itself.
function listInputsAndOutputs(midiAccess) {
  for (const entry of midiAccess.inputs) {
	  	console.log(entry);
    const input = entry[1];
    console.log("-port type:: ", input.type, " -manufacturer:: ", input.manufacturer, " -name:: ", input.name, " -version:: ", input.version);
  }
}


//You need to decide what device(s) you want to take notice of. Work out your devices name and include it below. Anthing not included here gets completely ignored!
function startMessageHandlers(midi, portNum){
	midi.inputs.forEach(function(entry) {
		console.log("entry: ", entry);
		if(entry.name=="MIDI Mix MIDI 1"){   //'MIDI Mix MIDI 1' is how my midi mixer happens to describe itself. Replace this for something relevant to you!
			entry.onmidimessage = doIncomingMessage;
			console.log("attaching a handler");
		} else {
			console.log("skipping an input: manufacturer = ", entry.manufacturer);
		}
	});
	
	//get a handle to output... :)
	midi.outputs.forEach(function(entry) {
		console.log("output:entry: ", entry);
		if(entry.name=="MIDI Mix MIDI 1"){ //again, 'MIDI Mix MIDI 1' is just my piece of hardware. Replace that with your hardwares reported name :)
			midiOutHandle = entry;
			console.log("Noting this output reference and setting up a message send..");
		} else {
			console.log("skipping an output: manufacturer = ", entry.manufacturer);
		}
	});
}


//this function will be called automatically anytime data comes in from the device(s) we decided to take notice of in the function above.
//You get three bytes. After that, the rest is pretty much up to you!
function doIncomingMessage(m){
	//when a message comes in, you  get three bytes of data in m.data[0], m.data[1], m.data[2]
	//The first two bytes identify the sending device. m.data[2] is the actual value it sent.
	console.log(m.data);
	//e.g:
	if (m.data[0]==176)&&(m.data[1]==20){
		console.log("dial 176, 20 just sent the value ", m.data[2]);
	}
}

//example use for sending data...
//	let msg = [0x00, 0x00, 0x00]; //just like we received three bytes, you get to send three bytes if you want to. Probably more interesting than three zeros. But thats up to you :)
//	sendMidiMessage(msg); 
function sendMidiMessage(msg){
	midiOutHandle.send(msg);
}


