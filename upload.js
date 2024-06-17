(function () {
  "use strict";

  let fileInput, uploadProgress, message;

  function init() {
    fileInput = document.getElementById("filetoupload");
    uploadProgress = document.getElementById("upload-progress");
    message = document.getElementById("message");

    fileInput.addEventListener("change", handleFileUpload);
  }

  function handleFileUpload() {
    const file = fileInput.files[0];
    const xhr = new XMLHttpRequest();
    let startTime = performance.now();

    xhr.upload.onloadstart = function (e) {
      showUploadProgress(e);
      startTime = performance.now();
    };

    xhr.upload.onprogress = function (e) {
      updateUploadProgress(e, startTime);
    };

    xhr.upload.onloadend = function () {
      hideUploadProgress();
      message.textContent = "Processing";
      fileInput.disabled = false;
    };

    // Modifed this to display onion link as well
    xhr.onload = function () {

      xhr.onreadystatechange = () => {
        if (xhr.readyState === xhr.HEADERS_RECEIVED) {
          const contentType = client.getResponseHeader("Onion-Location");
          let onionLink = contentType
          let clearnetLink = xhr.responseText

          // Display both the clear net link && onion link
          message.textContent = `Link: ${clearnetLink}\nOnion Link: ${onionLink}`
        }
      }
      // message.textContent = xhr.responseText;
    };

    xhr.open("PUT", `/api/upload/${file.name}`, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  }

  function showUploadProgress(e) {
    uploadProgress.classList.add("visible");
    uploadProgress.value = 0;
    uploadProgress.max = e.total;
    message.textContent = "Uploading...";
    fileInput.disabled = true;
  }

  function updateUploadProgress(e, startTime) {
    uploadProgress.value = e.loaded;
    uploadProgress.max = e.total;

    const elapsedSeconds = (performance.now() - startTime) / 1000;
    const uploadSpeed = e.loaded / (1024 * 1024 * elapsedSeconds);
    const percentage = (e.loaded / e.total) * 100;

    message.textContent = `Upload Speed: ${uploadSpeed.toFixed(
      2
    )} MB/s || ${percentage.toFixed(2)}% done`;
  }

  function hideUploadProgress() {
    uploadProgress.classList.remove("visible");
  }

  init();
})();
