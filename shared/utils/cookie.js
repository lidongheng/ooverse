const encode = (value) => encodeURIComponent(value)
const decode = (value) => decodeURIComponent(value)

const appendAttribute = (parts, name, value) => {
  if (value === false || value === undefined) {
    return
  }

  if (value === true) {
    parts.push(name)
    return
  }

  parts.push(`${name}=${value}`)
}

export const getCookies = () => {
  const cookies = {}

  if (document.cookie === '') {
    return cookies
  }

  document.cookie.split('; ').forEach((item) => {
    const separatorIndex = item.indexOf('=')
    const name = decode(item.slice(0, separatorIndex))
    const value = decode(item.slice(separatorIndex + 1))

    cookies[name] = value
  })

  return cookies
}

export const getCookie = (name) => getCookies()[name]

export const setCookie = (name, value, attributes) => {
  const parts = [`${encode(name)}=${encode(value)}`]

  if (attributes !== undefined) {
    Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
      if (attributeName === 'expires') {
        let expires = attributeValue

        if (typeof expires === 'number') {
          expires = new Date(Date.now() + expires * 864e5)
        }

        if (!(expires instanceof Date)) {
          throw new TypeError('Cookie expires 必须是天数或 Date 实例')
        }

        appendAttribute(parts, 'Expires', expires.toUTCString())
        return
      }

      const normalizedName = attributeName.replace(/^[a-z]/, (character) => character.toUpperCase())
      appendAttribute(parts, normalizedName, attributeValue)
    })
  }

  const cookie = parts.join('; ')
  document.cookie = cookie

  return cookie
}

export const removeCookie = (name, attributes) => {
  const removalAttributes = {
    expires: new Date(0)
  }

  if (attributes !== undefined) {
    Object.assign(removalAttributes, attributes)
    removalAttributes.expires = new Date(0)
  }

  return setCookie(name, '', removalAttributes)
}

const Cookies = {
  get(name) {
    if (name === undefined) {
      return getCookies()
    }

    return getCookie(name)
  },
  set: setCookie,
  remove: removeCookie
}

export default Cookies
