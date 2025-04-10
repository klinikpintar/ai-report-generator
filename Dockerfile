# Use the official PostgreSQL image as the base
FROM postgres:latest

# Install dependencies required to build pgvector
RUN apt-get update && apt-get install -y \
    postgresql-server-dev-all \
    gcc \
    make \
    git

# Clone the pgvector repository and build the extension
RUN git clone https://github.com/pgvector/pgvector.git /pgvector && \
    cd /pgvector && \
    make && \
    make install

# Ensure the extension is available when the container starts
RUN echo "shared_preload_libraries = 'vector'" >> /usr/share/postgresql/postgresql.conf.sample