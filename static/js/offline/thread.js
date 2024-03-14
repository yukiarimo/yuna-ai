const action = {
  LOAD: 0,
  INITIALIZED: 1,
  RUN_MAIN: 2,
  WRITE_RESULT: 3,
  RUN_COMPLETED: 4,
  ERROR: 5
};

class LlamaCpp {
  // callback have to be defined before load_worker
  constructor(url, init_callback, write_result_callback, on_complete_callback) {
      this.url = url;
      this.init_callback = init_callback;
      this.write_result_callback = write_result_callback;
      this.on_complete_callback = on_complete_callback;
      this.loadWorker();
  }
  
  loadWorker() {
      this.worker = new Worker(
          new URL("./main-worker.js", import.meta.url),
          {type: "module"}
      );
      
      this.worker.onmessage = (event) => {
          switch (event.data.event) {
              case action.INITIALIZED:
                  // Load Model
                  if (this.init_callback) {
                      this.init_callback();
                  }

                  break;
              case action.WRITE_RESULT:
                  // Capture result
                  if (this.write_result_callback) {
                      this.write_result_callback(event.data.text);
                  }

                  break;
              case action.RUN_COMPLETED:
                  // Execution Completed
                  if (this.on_complete_callback) {
                      this.on_complete_callback();
                  }
                  
                  break;
          }
      };

      this.worker.postMessage({
          event: action.LOAD,
          url: this.url,
      });
  }

  run({
      prompt,
      chatml=false,
      n_predict=-2,
      ctx_size=2048,
      batch_size=512,
      temp=0.8,
      n_gpu_layers=0,
      top_k=40,
      top_p=0.9,
      no_display_prompt=true,
  }={}) {
      this.worker.postMessage({
          event: action.RUN_MAIN,
          prompt,
          chatml,
          n_predict,
          ctx_size,
          batch_size,
          temp,
          n_gpu_layers,
          top_k,
          top_p,
          no_display_prompt,
      });
  }
  stop() {
      this.worker.terminate();
  }
  start() {
      this.loadWorker();
  }
}

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
    temp: 0.7,
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