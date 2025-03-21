# Use a Python 3.10+ base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy your project files
COPY . .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Run the application with gunicorn
CMD ["gunicorn", "EventManagementSystem.wsgi:application", "--bind", "0.0.0.0:8000"]
