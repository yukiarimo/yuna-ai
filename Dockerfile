# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 4848 available to the world outside this container
EXPOSE 4848

# Define environment variable
ENV NAME YunaAI

# Run index.py when the container launches
CMD ["python", "./index.py"]