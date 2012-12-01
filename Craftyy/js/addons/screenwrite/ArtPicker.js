function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

    // Is it from web?
    // If so, evt.dataTransfer.types will include "text/uri-list"

	var files = evt.dataTransfer.files; // FileList object.

	// Just the first file
	var file = files[0];
	var reader = new FileReader();

	reader.onloadend = function(event) {
		if (event.target.readyState == FileReader.DONE) { // DONE == 2

			/*var cont = document.body;
			cont.innerHTML = '<img class="thumb" style="width:100%;height:100%" src="'+event.target.result+'"/>';*/

			Messenger.request("project.AddRawImage",event.target.result);

		}
    };

    var blob = file.slice(0,file.size);
    reader.readAsDataURL(blob);

}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.body;
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
