const wait = async function (time = 1.2, fn) {
  return new Promise((resolve) =>
    setTimeout(() => {
      fn()
      resolve()
    }, time * 1000)
  )
}
export default wait
