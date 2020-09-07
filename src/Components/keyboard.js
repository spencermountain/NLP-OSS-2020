const keypress = function (e, i) {
  if (e.keyCode === 32 || e.keyCode === 39 || e.keyCode === 40) {
    e.preventDefault()
    return i + 1
  }
  if (e.keyCode === 37 || e.keyCode === 38) {
    e.preventDefault()
    i = i - 1
    i = i < 0 ? 0 : i // dont go under 0
    return i
  }
  return i
}
export default keypress
