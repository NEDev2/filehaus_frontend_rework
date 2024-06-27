var _____WB$wombat$assign$function_____ = function(name) {
    return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; 
};
if (!self.__WB_pmw) { 
    self.__WB_pmw = function(obj) { 
        this.__WB_source = obj; 
        return this; 
    } 
}
{
    let window = _____WB$wombat$assign$function_____("window");
    let self = _____WB$wombat$assign$function_____("self");
    let document = _____WB$wombat$assign$function_____("document");
    let location = _____WB$wombat$assign$function_____("location");
    let top = _____WB$wombat$assign$function_____("top");
    let parent = _____WB$wombat$assign$function_____("parent");
    let frames = _____WB$wombat$assign$function_____("frames");
    let opener = _____WB$wombat$assign$function_____("opener");

    let fileInput, uploadProgress, message;

    function init() {
        fileInput = document.getElementById('filetoupload');
        let torrentCheckbox = document.getElementById('torrent');
        let expirySelector = document.getElementById('expiry');
        uploadProgress = document.getElementById('upload-progress');
        message = document.getElementById('message');

        fileInput.addEventListener('change', async function () {
            let file = fileInput.files[0];

            // Add a function here to check for metadata
            async function checkForMetadata(videoFile) {
                return new Promise((resolve, reject) => {
                    EXIF.getData(videoFile, function() {
                        let metadata = {};
                        let hasMetadata = false;
            
                        // Check for GPS data
                        if (EXIF.getTag(this, "GPSLatitude")) {
                            metadata.location = `${EXIF.getTag(this, "GPSLatitude")}, ${EXIF.getTag(this, "GPSLongitude")}`;
                            hasMetadata = true;
                        }
            
                        // Check for make and model
                        if (EXIF.getTag(this, "Make")) {
                            metadata.make = EXIF.getTag(this, "Make");
                            hasMetadata = true;
                        }
                        if (EXIF.getTag(this, "Model")) {
                            metadata.model = EXIF.getTag(this, "Model");
                            hasMetadata = true;
                        }
            
                        // Check for creation date
                        if (EXIF.getTag(this, "DateTimeOriginal")) {
                            metadata.dateCreated = EXIF.getTag(this, "DateTimeOriginal");
                            hasMetadata = true;
                        }

                        // Check for unique identifiers
                        if (EXIF.getTag(this, "SerialNumber")) {
                            metadata.serialNumber = EXIF.getTag(this, "SerialNumber");
                            hasMetadata = true;
                        }

                        if (EXIF.getTag(this, "ImageUniqueID")) {
                            metadata.imageUniqueID = EXIF.getTag(this, "ImageUniqueID");
                            hasMetadata = true;
                        }

                        // Check for software information
                        if (EXIF.getTag(this, "Software")) {
                            metadata.software = EXIF.getTag(this, "Software");
                            hasMetadata = true;
                        }
            
                        if (hasMetadata) {
                            let message = "This file contains the following metadata:\n\n";
                            for (let key in metadata) {
                                message += `${key}: ${metadata[key]}\n`;
                            }
                            message += "\nDo you want to proceed with processing this file?";
            
                            const confirmProcess = confirm(message);
                            resolve(confirmProcess);
                        } else {
                            resolve(true); // No metadata found proceed
                        }
                    });
                });
            }

            // Call the function and ask the user if to Proceed
            const toProceed = await checkForMetadata(file);
            if (!toProceed) {
                location.reload() // Reloading the page
                return "Canceled by the user!";
            }

            let xhr = new XMLHttpRequest(),
                startTime = new Date().getTime();

            xhr.upload.onloadstart = function (e) {
                uploadProgress.classList.add('visible');
                uploadProgress.value = 0;
                uploadProgress.max = e.total;
                message.textContent = 'Uploading...';
                fileInput.disabled = true;
                startTime = new Date().getTime();
            };

            xhr.upload.onprogress = function (e) {
                uploadProgress.value = e.loaded;
                uploadProgress.max = e.total;

                // Calculate upload speed in megabytes per second
                let currentTime = new Date().getTime();
                let elapsedSeconds = (currentTime - startTime) / 1000;
                let uploadSpeed = e.loaded / (1024 * 1024 * elapsedSeconds);

                // Calculate and display percentage done
                let percentage = (e.loaded / e.total) * 100;

                // Display upload speed and percentage on the page
                message.textContent = `Upload Speed: ${uploadSpeed.toFixed(2)} MB/s || ${percentage.toFixed(2)}% done`;
            };

            xhr.upload.onloadend = function (e) {
                uploadProgress.classList.remove('visible');
                // Reset message after upload completes
                message.textContent = 'Processing';
                fileInput.disabled = false;
            };

            xhr.onload = function () {
                // Update message with server response
                message.textContent = '' + xhr.responseText + '';
            };

            xhr.open('PUT', `api/upload/${file.name}`, true);
            xhr.setRequestHeader('Content-Type', file.type);

            // Add the "X-Torrent" header if the torrent checkbox is checked
            if (torrentCheckbox.checked) {
                xhr.setRequestHeader('X-Torrent', '1');
            }

            // Add the "X-Expires-After" header if a value other than Infinite is selected
            let expiryValue = expirySelector.value;
            if (expiryValue !== '0') {
                xhr.setRequestHeader('X-Expires-After', expiryValue);
            }

            xhr.send(file);
        });
    }

    init();
}

