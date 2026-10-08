FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml README.md ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY alembic.ini ./

RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir .

ENV PYTHONPATH=/app/apps/api

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]