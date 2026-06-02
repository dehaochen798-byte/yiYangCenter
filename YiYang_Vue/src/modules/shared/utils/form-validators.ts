import { ElMessage } from 'element-plus'

type PrimitiveType = 'string' | 'number' | 'boolean' | 'datetime'

type FieldRule = {
  label: string
  type: PrimitiveType
  value: unknown
  optional?: boolean
  enumValues?: string[]
}

function isEmpty(value: unknown) {
  return value === '' || value === null || value === undefined
}

function isValidDateTime(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Date.parse(value))
}

export function validateFieldTypes(fields: FieldRule[]) {
  for (const field of fields) {
    if (field.optional && isEmpty(field.value)) {
      continue
    }

    if (field.type === 'string') {
      if (typeof field.value !== 'string') {
        ElMessage.warning(`${field.label}只能为文本类型`)
        return false
      }

      if (field.enumValues && !field.enumValues.includes(field.value)) {
        ElMessage.warning(`${field.label}类型不正确`)
        return false
      }

      continue
    }

    if (field.type === 'number') {
      if (typeof field.value !== 'number' || Number.isNaN(field.value)) {
        ElMessage.warning(`${field.label}只能为数字类型`)
        return false
      }

      continue
    }

    if (field.type === 'boolean') {
      if (typeof field.value !== 'boolean') {
        ElMessage.warning(`${field.label}只能为布尔类型`)
        return false
      }

      continue
    }

    if (field.type === 'datetime' && !isValidDateTime(field.value)) {
      ElMessage.warning(`${field.label}只能为有效时间类型`)
      return false
    }
  }

  return true
}
