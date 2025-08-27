ARG BUILD_DIR=/tmp/pb_build

FROM alpine:3.22 AS base

# Install runtime dependencies
RUN apk add --no-cache ca-certificates curl tzdata

FROM base AS build
RUN apk add --no-cache unzip

ARG PB_VERSION=0.29.3
ARG BUILD_DIR=/tmp/pb_build

# Download pocketbase binary for linux_amd64 and unzip
RUN curl -fsSL -o /tmp/pocketbase.zip \
    https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip /tmp/pocketbase.zip -d ${BUILD_DIR}

FROM base AS final

ARG UID=1001
ARG GID=1001
ARG USER=pocketbase
ARG GROUP=pocketbase
ARG PB_WORKDIR=/pocketbase
ARG PB_HOME=/opt/pocketbase
ARG PB_VERSION=0.29.3

ENV TZ=America/Sao_Paulo \
    PB_PORT=8090 \
    PB_WORKDIR=${PB_WORKDIR} \
    PB_HOME=${PB_HOME}

EXPOSE ${PB_PORT}

# create non-root user and directories
RUN addgroup -g ${GID} ${GROUP} \
    && adduser -u ${UID} -G ${GROUP} -s /bin/sh -D ${USER} \
    && mkdir -p "${PB_HOME}" \
    && mkdir -p -m 777 "${PB_WORKDIR}" \
    && chown ${USER}:${GROUP} "${PB_WORKDIR}"

# copy the pocketbase executable from build stage
COPY --from=build /tmp/pb_build/pocketbase ${PB_HOME}/pocketbase
RUN chmod 755 "${PB_HOME}/pocketbase" \
    && ln -s "${PB_HOME}/pocketbase" /usr/local/bin/pocketbase

# copy project-specific pocketbase folders so hooks/migrations/public are available
COPY ./pb_public ${PB_WORKDIR}/pb_public
# COPY ./pb_migrations ${PB_WORKDIR}/pb_migrations
COPY ./pb_hooks ${PB_WORKDIR}/pb_hooks

USER ${USER}
WORKDIR "${PB_WORKDIR}"

CMD ["pocketbase", "serve", "--http=0.0.0.0:8090"]
