FROM python:3.12-slim

ARG MODE

ENV MODE=$MODE

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["./init.sh"]

CMD ["python", "run.py"]