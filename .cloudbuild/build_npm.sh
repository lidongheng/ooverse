#!/bin/sh
set -ex

echo "======== check profile ========"
echo "PROFILE: ${PROFILE}"

if [ -z "${PROFILE}" ]; then
  echo "必须设置 PROFILE，支持 sit、uat、prod"
  exit 1
fi

if [ "${PROFILE}" = "sit" ]; then
  BUILD_SCRIPT="build:sit"
elif [ "${PROFILE}" = "uat" ]; then
  BUILD_SCRIPT="build:uat"
elif [ "${PROFILE}" = "prod" ]; then
  BUILD_SCRIPT="build"
else
  echo "不支持的 PROFILE: ${PROFILE}"
  exit 1
fi

echo "BUILD_SCRIPT: ${BUILD_SCRIPT}"

echo "======== check build environment ========"
node --version
npm --version

echo "======== npm install cost-operation ========"
npm install --prefix cost-operation

echo "======== npm install digital-map-cost ========"
npm install --prefix digital-map-cost

echo "======== npm install ioc ========"
npm install --prefix ioc

echo "======== npm install operation-map ========"
npm install --prefix operation-map

echo "======== build cost-operation ========"
npm --prefix cost-operation run "${BUILD_SCRIPT}"

echo "======== build digital-map-cost ========"
npm --prefix digital-map-cost run "${BUILD_SCRIPT}"

echo "======== build ioc ========"
npm --prefix ioc run "${BUILD_SCRIPT}"

echo "======== build operation-map ========"
npm --prefix operation-map run "${BUILD_SCRIPT}"

echo "======== prepare ooverse directory ========"
# CI 工作区可能被复用，每次都删除上一轮整理的产物。
rm -rf ooverse

mkdir -p ooverse/cost-operation
mkdir -p ooverse/digital-map-cost
mkdir -p ooverse/ioc
mkdir -p ooverse/operation-map

echo "======== copy cost-operation ========"
cp -R cost-operation/dist/cost-operation/. ooverse/cost-operation/

echo "======== copy digital-map-cost ========"
cp -R digital-map-cost/dist/digital-map-cost/. ooverse/digital-map-cost/

echo "======== copy ioc ========"
cp -R ioc/dist/ioc/. ooverse/ioc/

echo "======== copy operation-map ========"
cp -R operation-map/dist/operation-map/. ooverse/operation-map/

echo "======== check ooverse directory ========"
if [ ! -f ooverse/cost-operation/index.html ]; then
  echo "缺少文件: ooverse/cost-operation/index.html"
  exit 1
fi

if [ ! -f ooverse/digital-map-cost/index.html ]; then
  echo "缺少文件: ooverse/digital-map-cost/index.html"
  exit 1
fi

if [ ! -f ooverse/ioc/index.html ]; then
  echo "缺少文件: ooverse/ioc/index.html"
  exit 1
fi

if [ ! -f ooverse/operation-map/index.html ]; then
  echo "缺少文件: ooverse/operation-map/index.html"
  exit 1
fi

echo "已整理: ooverse/cost-operation/index.html"
echo "已整理: ooverse/digital-map-cost/index.html"
echo "已整理: ooverse/ioc/index.html"
echo "已整理: ooverse/operation-map/index.html"
echo "前端构建与统一产物整理完成"
