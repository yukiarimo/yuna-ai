import {
  LlamaCpp
} from "./llama.js";

var app;
const buttonRun = document.querySelector("#run");
const buttonRunProgressLoadingModel = document.querySelector("#run-progress-loading-model");
const buttonRunProgressLoadedModel = document.querySelector("#run-progress-loaded-model");
const buttonRunProgressGenerating = document.querySelector("#run-progress-generating");
const selectedModel = "/lib/models/yuna/tinymistral-248m-sft-v4.q8_0.gguf"
const modelProgress = document.querySelector("#model-progress");
const textareaPrompt = document.querySelector("textarea#prompt");
const textareaResult = document.querySelector("#result");

const onModelLoaded = () => {
  const prompt = textareaPrompt.value;
  console.debug("model: loaded");

  app.run({
    prompt: prompt,
    ctx_size: 2048,
    temp: 0.8,
    top_k: 40,
    no_display_prompt: false,
  });
  console.log(app);
}

function stopOnYuki(text) {
  if (text.includes("Yuki")) {
    console.log("Stopping generation on 'Yuki'");
    //onComplete();
    app.stop();
    stopMe()
  }
}

document.getElementById("startme").addEventListener("click", function() {
  app.start();
});

const onMessageChunk = (text) => {
  console.log(text);

  stopOnYuki(text);

  // textareaResult.value += text;
  textareaResult.innerText += text;
};

const onComplete = () => {
  console.debug("model: completed");
  modelProgress.setAttribute("hidden", "hidden");
};

buttonRun.addEventListener("click", (e) => {
  modelProgress.removeAttribute("hidden");
  // textareaResult.value = "";
  textareaResult.innerText = "";
  
  if (app && app.url == selectedModel) {
    onModelLoaded();
    return;
  }

  app = new LlamaCpp(
    selectedModel,
    onModelLoaded,
    onMessageChunk,
    onComplete,
  );
});

function stopMe() {
  modelProgress.removeAttribute("hidden");
  // textareaResult.value = "";
  textareaResult.innerText = "";
}