const wait = async function (time = 1.2, fn) {
  console.log('set wait')
  console.log('set wait')
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log('resolved')
      fn()
      resolve()
    }, time * 1000)
  )
}
export default wait
