const keypress = function (e, i) {
  console.log(e.keyCode)
  if (e.keyCode === 32 || e.keyCode === 39 || e.keyCode === 40) {
    e.preventDefault()
    return i + 1
  }
  if (e.keyCode === 37 || e.keyCode === 38) {
    e.preventDefault()
    return i - 1
  }
  return i
}
export default keypress
