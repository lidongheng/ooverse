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
npx --yes pnpm@10.12.3 --version

echo "======== pnpm install ========"
npx --yes pnpm@10.12.3 install --frozen-lockfile

echo "======== build cost-operation ========"
npx --yes pnpm@10.12.3 --filter @ooverse/cost-operation run "${BUILD_SCRIPT}"

echo "======== build digital-map-cost ========"
npx --yes pnpm@10.12.3 --filter @ooverse/digital-map-cost run "${BUILD_SCRIPT}"

echo "======== build ioc ========"
npx --yes pnpm@10.12.3 --filter @ooverse/ioc run "${BUILD_SCRIPT}"

echo "======== build operation-map ========"
npx --yes pnpm@10.12.3 --filter @ooverse/operation-map run "${BUILD_SCRIPT}"

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
