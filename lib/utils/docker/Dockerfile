FROM python:3.12-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

ADD . /app

RUN pip3 install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir -r lib/util/docker/requirements-cpu.txt

EXPOSE 4848

CMD ["python", "index.py"]
