# Yuna Docker Docs
## Docker Installation Guide

This guide will help you set up and run the Yuna AI project using Docker.

### Prerequisites

- Docker installed on your system
- Git (for cloning the repository)
- Appropriate hardware (CPU or NVIDIA GPU)

### Model Files

Before proceeding, ensure you have the necessary model files. You can either:
- Check the [Model Files](#model-files) section for manual installation
- Run the `index.sh` script to automatically install the models

### Clone the Repository

Clone the Yuna AI repository to your local machine:

```bash
git clone https://github.com/0xGingi/yuna-ai
```

### Pull the Docker Image

Choose the appropriate Docker image based on your system:

For x86_64 CPU:
```bash
docker pull 0xgingi/yuna-ai:latest
```

For NVIDIA GPU:
```bash
docker pull 0xgingi/yuna-ai:cuda
```

### Configure the Application

Before running the container, make sure to set the correct device in the configuration file:

1. Open `~/yuna-ai/static/config.json`
2. Set the "device" value to either "cpu" or "cuda" based on your hardware

### Run the Docker Container

Run the appropriate command based on your hardware:

For CPU:
```bash
docker run --name yuna -p 4848:4848 --restart=always -v ~/yuna-ai:/app 0xgingi/yuna-ai:latest
```

For NVIDIA GPU:
```bash
docker run --gpus all --name yuna -p 4848:4848 --restart=always -v ~/yuna-ai:/app 0xgingi/yuna-ai:cuda
```

### Updating the Docker Container

To update the Yuna AI Docker container, follow these steps:

1. Stop and remove the existing container:
   ```bash
   docker stop yuna
   docker rm yuna
   ```

2. Update the local repository:
   ```bash
   cd yuna-ai
   git pull
   ```

3. Pull the latest Docker image (replace [tag] with 'latest' or 'cuda' as appropriate):
   ```bash
   docker pull 0xgingi/yuna-ai:[tag]
   ```

4. Run the new container using the appropriate command from the "Run the Docker Container" section above.

### Troubleshooting

If you encounter any issues, please check the project's issue tracker or contact the maintainers for support.
