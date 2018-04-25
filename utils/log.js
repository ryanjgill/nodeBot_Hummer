export default (message, showLogs) => {
  if (!showLogs) { return }
  console.log(message)
}