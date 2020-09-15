export const uuid = () => {
  return Date.now().toString(36) + (Math.round(Math.random() * 36)).toString(36);
}
