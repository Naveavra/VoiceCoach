FROM python:3.9-alpine

WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install psycopg2 dependencies
RUN apk update \
    && apk add postgresql-dev gcc python3-dev musl-dev
RUN pip install --upgrade pip

RUN apk builed-essential

#install pgagent
RUN apk add --no-cache pgagent

#install pgcron

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app .

# defining env vars
ENV FLASK_APP=main.py
# watch app' files
ENV FLASK_DEBUG=true
ENV FLASK_ENV=development

CMD ["python","main.py"]

