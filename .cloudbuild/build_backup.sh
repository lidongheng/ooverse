#!/bin/sh
set -ex

echo "PROFILE: ${PROFILE}"
echo "SERVICE_NAME: ${SERVICE_NAME}"

echo "SERVICE_VERSION: ${SERVICE_VERSION}"
npm --version
node --version
ls -a

echo "======== check npm config ========"
npm config set strict-ssl false

echo "======== pnpm install ========"
npx pnpm install

echo "======== check profile ========"
if [ -z "${PROFILE}" ]; then
    PROFILE="prod"
fi
if [ -z "${SERVICE_NAME}" ];
then
    SERVICE_NAME="ooverse"
fi

echo "======== init build params ========"
if [ -z "${buildNumber}" ]; then
  if [ -e /proc/sys/kernel/random/uuid ] && [ -r /proc/sys/kernel/random/uuid ]; then
    build=$(cat /proc/sys/kernel/random/uuid | cksum | cut -f1 -d" ")
  else
    build=$RANDOM
  fi
  buildNumber="$(date + %Y%M%d%H%M%S).${build}"
else
  buildNumber="${buildNumber}"
  fi

# 判断当前构建是否为版本构建，以及定义构建变量(包版本，包服务名称，包编译存放路径，包类型，包编译名称，包打包名称)
if [ -z "${isRelease}" ] || [ "${isRelease}" = "false" ]; then
isRelease="false"
#版本号+时间戳+build随机数写入buildInfo.properties
SERVICE_VERSION='1.0.0-SNAPSHOT'."${buildNumber}"
elif [ "${isRelease}"x = "true"x ];
then
  SERVICE_VERSION="${CID_BUILD_TIME}"."${CID_BUILD_NUMBER}"
fi

echo "Release is ${isRelease}"
echo "service version: ${SERVICE_VERSION}"
echo "buildVersion=${SERVICE_VERSION}" > buildinfo.properties

# build every component
npx pnpm build:"${PROFILE}"

# prepare target dir and zip file

echo "====== prepare package file ======"
mkdir -p "${SERVICE_NAME}"
echo "====== current dir is ========"
ls -a
cp -r dist/* "${SERVICE_NAME}"/

cp .cloudbuild/start.sh "${SERVICE_NAME}"/
CURRENT_DATE=$(date "+ %Y%m%d_%H%M%S")

zip -r "${SERVICE_NAME}"-"${PROFILE}"-"${CURRENT_DATE}".zip "${SERVICE_NAME}"

echo ------------show me the ls --------------
ls -a
echo ------------ show me the ls--------------

# start build docker image

execute() {
  printf '[INFO] command:'
  printf ' %s' "$@"
  printf '\n'

  # "$@" 会保留每个参数的边界，避免使用 eval 再次解析命令字符串。
  "$@"
}

execute docker build \
  --build-arg "profile=${PROFILE}" \
  --pull \
  -f .cloudbuild/Dockerfile \
  -t "xxx.com/smartocc/${SERVICE_NAME}:${CID_BUILD_TIME}.${CID_BUILD_NUMBER}" \
  .
