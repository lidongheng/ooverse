export function fetchNoPermissionMock() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        status: 403,
        data: null,
        message: '没有相关权限'
      })
    }, 2000)
  })
}
