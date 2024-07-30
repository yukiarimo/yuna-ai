# Docker
You still need to grab the models! - Check [Model Files](#model-files) or install from index.sh

Depending on your system, will need to use the appropriate docker container!

Clone the repo (Easiest way due to the many files that need to be persistent - can alternatively create the folders yourself and mount those):
```
git clone https://github.com/0xGingi/yuna-ai
```

Pull the docker container:
```
docker pull 0xgingi/yuna-ai:latest # For x86_64 CPU
docker pull 0xgingi/yuna-ai:cuda  # For nvidia gpu
```

Run the docker container (Don't Forget to change your device to "cpu" or "cuda" in "~/yuna-ai/static/config.json"):

CPU:
```
docker run --name yuna -p 4848:4848 --restart=always -v ~/yuna-ai:/app 0xgingi/yuna-ai:latest
```
Nvidia: 
```
docker run --gpus all --name yuna -p 4848:4848 --restart=always -v ~/yuna-ai:/app 0xgingi/yuna-ai:cuda
```

## Updating Docker
```
docker stop yuna
docker rm yuna
cd yuna-ai
git pull
docker pull 0xgingi/yuna-ai:[tag]
```
