import { Transform } from 'class-transformer'

function emptyToUndefined(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  return value
}

export function ToOptionalString() {
  return Transform(({ value }) => {
    const normalized = emptyToUndefined(value)
    return typeof normalized === 'string' ? normalized : normalized
  })
}

export function ToOptionalNumber() {
  return Transform(({ value }) => {
    const normalized = emptyToUndefined(value)

    if (normalized === undefined) {
      return undefined
    }

    return Number(normalized)
  })
}

export function ToOptionalBoolean() {
  return Transform(({ value }) => {
    const normalized = emptyToUndefined(value)

    if (normalized === undefined) {
      return undefined
    }

    if (typeof normalized === 'boolean') {
      return normalized
    }

    if (normalized === 'true') {
      return true
    }

    if (normalized === 'false') {
      return false
    }

    return Boolean(normalized)
  })
}
