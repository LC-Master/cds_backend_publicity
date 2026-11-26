variable "REGISTRY" {
    default = "ghcr.io/lc-master"
}

variable "APP_NAME_CDS" {
    default = "cds"
}

variable "APP_NAME_CDS_ENV" {
    default = "cds-env-initializer"
}

variable "APP_NAME_CDS_MIGRATOR" {
    default = "cds-db-migrator"
}

variable "TAG" {
    default = "latest"
}

group "default" {
    targets = ["cds", "cds-env", "cds-migrator"]
}

target "cds" {
    context    = "."
    dockerfile = "./docker/Dockerfile"
    target     = "final-stage" 
  
    tags = [
        "${REGISTRY}/${APP_NAME_CDS}:latest",
        "${REGISTRY}/${APP_NAME_CDS}:${TAG}"
    ]
    cache-from = ["type=local,src=.buildx-cache"]
    cache-to   = ["type=local,dest=.buildx-cache,mode=max"]
}

target "cds-env" {
    context    = "."
    dockerfile = "./docker/cds-env/Dockerfile"
    target     = "final-stage"

    tags = [
        "${REGISTRY}/${APP_NAME_CDS_ENV}:latest",
        "${REGISTRY}/${APP_NAME_CDS_ENV}:${TAG}"
    ]
    cache-from = ["type=local,src=.buildx-cache"]
    cache-to   = ["type=local,dest=.buildx-cache,mode=max"]
}

target "cds-migrator" {
    context    = "."
    dockerfile = "./docker/cds-migrator/Dockerfile"
    target     = "final-stage"

    tags = [
        "${REGISTRY}/${APP_NAME_CDS_MIGRATOR}:latest",
        "${REGISTRY}/${APP_NAME_CDS_MIGRATOR}:${TAG}"
    ]
    cache-from = ["type=local,src=.buildx-cache"]
    cache-to   = ["type=local,dest=.buildx-cache,mode=max"]
}