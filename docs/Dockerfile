FROM python:2.7

RUN mkdir -p /docs

COPY . /docs
WORKDIR /docs

RUN pip install mkdocs

EXPOSE 8080

CMD ["mkdocs", "serve"]