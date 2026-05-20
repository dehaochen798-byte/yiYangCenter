export async function http(config) {
  return Promise.resolve({
    code: 200,
    message: 'mock success',
    data: config,
  })
}
