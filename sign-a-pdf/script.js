/* global grist, PDFLib, Konva */
const { degrees, PDFDocument, rgb, StandardFonts } = PDFLib;

const { pdfjsLib } = window;
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "//cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs";

let pdfDoc = null,
  pageNum = 1,
  pageRendering = false,
  pageNumPending = null;
const pdfCanvas = document.getElementById("pdf-canvas");

let xPos = 0.75,
  yPos = 0.75,
  signatureScale = 0.15,
  signatureBlob = null;

function getSettings() {
  return { signatureBlob, xPos, yPos, signatureScale };
}

const signatureStage = new Konva.Stage({
  container: "konva-container",
});

async function renderPage() {
  if (pageRendering) return;

  const currentDoc = pdfDoc;
  try {
    pageRendering = true;
    // Using promise to fetch the page
    const page = await currentDoc.getPage(pageNum);
    // Support HiDPI-screens.
    const outputScale = window.devicePixelRatio || 1;

    const viewport = page.getViewport({ scale: 0.8 });
    for (const canvas of [pdfCanvas]) {
      canvas.height = viewport.height * outputScale;
      canvas.width = viewport.width * outputScale;
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";
    }
    signatureStage.width(viewport.width);
    signatureStage.height(viewport.height);

    //    pdfCanvas.parentNode.style.width = Math.floor(viewport.width) + "px";
    //    pdfCanvas.parentNode.style.height = Math.floor(viewport.height) + "px";

    const transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    // Render PDF page into canvas context
    const renderContext = {
      canvasContext: pdfCanvas.getContext("2d"),
      viewport,
      transform,
    };
    await page.render(renderContext).promise;
  } finally {
    pageRendering = false;
    if (pdfDoc !== currentDoc) {
      // New page rendering is pending
      await renderPage();
    }
  }
}

const reloadButton = document.getElementById("reload-me");
reloadButton.onclick = function () {
  window.location.reload();
};

async function getAttachmentBlob(id) {
  const tokenInfo = await grist.docApi.getAccessToken({ readOnly: true });

  const gristUrl = `${tokenInfo.baseUrl}/attachments/${id}/download?auth=${tokenInfo.token}`;

  const gristResponse = await fetch(gristUrl);

  const blob = await gristResponse.blob();
  return blob;
}

async function uploadAttachment(blob, filename) {
  const tokenInfo = await grist.docApi.getAccessToken({ readOnly: false });

  const gristUrl = `${tokenInfo.baseUrl}/attachments?auth=${tokenInfo.token}`;

  const formData = new FormData();

  formData.set("upload", blob, filename);

  const gristResponse = await fetch(gristUrl, {
    method: "POST",
    body: formData,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  const response = await gristResponse.json();
  return response[0];
}

let inputBlob, signedBlob;

let saveButton;

async function updatePreview(inputBlob) {
  // const preview = document.getElementById("preview");
  // preview.setAttribute("src", URL.createObjectURL(inputBlob));

  pdfDoc = await pdfjsLib.getDocument(await inputBlob.arrayBuffer()).promise;
  renderPage();
}

document.addEventListener("DOMContentLoaded", async () => {
  saveButton = document.getElementById("save-it");

  const dumpbin = document.getElementById("dumpbin");

  grist.ready({
    columns: [
      { name: "source", type: "Attachments"},
      { name: "target", type: "Attachments"},
      { name: "signed", optional: true, type: "Bool" }
    ],
  });

  let gristRecord;
  let gristMappings;
  const sourceAttachmentIndex = 0;
  let sourceAttachmentId;

  grist.onRecord(async function (rawRecord, mappings) {
    try {
      //dumpbin.innerText = JSON.stringify(mappings, null, 2) + "\n";
      gristMappings = mappings;

      inputBlob = signedBlob = null;

      gristRecord = grist.mapColumnNames(rawRecord);

      sourceAttachmentId = gristRecord.source[sourceAttachmentIndex];
      inputBlob = await getAttachmentBlob(sourceAttachmentId);

      await updatePreview(inputBlob);
      await previewSignature(getSettings());
    } catch (e) {
      dumpbin.innerText += `ouch! ${e.message}\n${e.stack}`;
    }
  });

  saveButton.addEventListener("click", async function () {
    try {
      await applySignature(getSettings());

      const attachmentId = await uploadAttachment(signedBlob, "signed.pdf");

      let updatedTargetValue;
      if (gristRecord.target == null) {
	updatedTargetValue = ['L', attachmentId]
      } else {
	updatedTargetValue = gristRecord.target.slice();
	const index = updatedTargetValue.indexOf(sourceAttachmentId);
	if (index !== -1) {
	  updatedTargetValue[index] = attachmentId;
	} else {
	  updatedTargetValue.push(attachmentId);
	}
	updatedTargetValue.unshift('L');
      }

      const fields = { [gristMappings.target]: updatedTargetValue };
      if (gristMappings.signed) {
	fields[gristMappings.signed] = true;
      }
      const table = grist.getTable();
      const result = await table.update({
        id: gristRecord.id,
        fields: fields
      });
    } catch (e) {
      dumpbin.innerText += `ouch! ${e.message}\n${e.stack}`;
    }
  });
  
  const signatureInput = document.getElementById("signature");
  signatureInput.onchange = async function (event) {
    signatureBlob = signatureInput.files[0];
    await saveSignature(signatureBlob);
    const settings = getSettings();
    await previewSignature(settings);
    //await previewSignature(settings);
  };
  
  signatureBlob = loadSignature();
  const preview = document.getElementById("preview");
  // preview.setAttribute("src", URL.createObjectURL(signatureBlob));
});

async function applySignature({ signatureBlob, xPos, yPos, signatureScale }) {
  const dumpbin = document.getElementById("dumpbin");
  if (inputBlob?.type != "application/pdf") {
    dumpbin.innerText += `ouch! this is not a pdf`;
    return;
  }
  if (signatureBlob?.type != "image/png") {
    dumpbin.innerText += `ouch! signature is not png\n`;
    return;
  }

  const inputBuffer = await inputBlob.arrayBuffer();

  const pdfDoc = await PDFDocument.load(inputBuffer);

  const pages = pdfDoc.getPages();

  // Get the first page of the document
  const firstPage = pages[0];

  // Get the width and height of the first page
  const { width, height } = firstPage.getSize();

  const pngImageBytes = await signatureBlob.arrayBuffer();
  const pngImage = await pdfDoc.embedPng(pngImageBytes);
  const pngDims = pngImage.scale(1);
  const pngAspect = pngDims.height / pngDims.width;
  const imgDimensions = {
    width: width * signatureScale,
    height: width * signatureScale * pngAspect,
  };

  firstPage.drawImage(pngImage, {
    x: firstPage.getWidth() * xPos - imgDimensions.width / 2,
    y: firstPage.getHeight() * (1 - yPos) - imgDimensions.height / 2,
    width: imgDimensions.width,
    height: imgDimensions.height,
  });

  const pdfBytes = await pdfDoc.save();

  signedBlob = new Blob([pdfBytes], { type: "application/pdf" });
}

async function saveSignature(signatureBlob) {
  if (signatureBlob == null) return;
  const reader = new FileReader();
  reader.addEventListener(
    "load",
    () => {
      localStorage.setItem("signature", reader.result);
    },
    false
  );
  reader.readAsDataURL(signatureBlob);
}

function loadSignature() {
  const data = localStorage.getItem("signature");
  if (! data) return; 
  const parts = data.split(":")[1].split(",");;
  const format = parts[0].split(";")[0];
  
  const content = atob(parts[1]);
  var arrayBuffer = new ArrayBuffer(content.length);
  var bytes = new Uint8Array(arrayBuffer);
  for (var i = 0; i < content.length; i++) {
      bytes[i] = content.charCodeAt(i);
  }
  
  return new Blob([new DataView(arrayBuffer)], { type: format });
}

let node = null;

async function previewSignature({ signatureBlob, xPos, yPos, signatureScale }) {
  if (!signatureBlob) return;

  const layer = new Konva.Layer();
  signatureStage.destroyChildren();
  signatureStage.add(layer);

  Konva.Image.fromURL(URL.createObjectURL(signatureBlob), function (node) {
    const signatureAspect = node.height() / node.width();
    const signatureDimensions = {
      width: signatureStage.width() * signatureScale,
      height: signatureStage.width() * signatureScale * signatureAspect,
    };
    node.setAttrs({
      x: signatureStage.width() * xPos - signatureDimensions.width / 2,
      y: signatureStage.height() * yPos - signatureDimensions.height / 2,
      width: signatureDimensions.width,
      height: signatureDimensions.height,
      draggable: true,
      originalScale: signatureScale,
      signatureBlob: signatureBlob,
    });
    layer.destroyChildren();
    var transformer = new Konva.Transformer({
      nodes: [node],
      rotateEnabled: false,
      flipEnabled: false,
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
    });
    layer.add(transformer);
    layer.add(node);
    node.on("dragend transformend", async function (e) {
      await updateSignatureSizeAndLocation(e.currentTarget.attrs);
    });
  });
}

async function updateSignatureSizeAndLocation({
  x,
  y,
  scaleX,
  scaleY,
  width,
  height,
  originalScale,
  signatureBlob,
}) {
  xPos = (x + (width * scaleX) / 2) / signatureStage.width();
  yPos = (y + (height * scaleY) / 2) / signatureStage.height();
  signatureScale = originalScale * scaleX;
}

