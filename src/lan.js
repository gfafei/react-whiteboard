const en = {
  'Pencil': 'Pencil',
  'Shape': 'Shape',
  'Text': 'Text',
  'Format': 'Format',
  'Eraser': 'Eraser',
  'Undo': 'Undo',
  'Redo': 'Redo',
  'Clear': 'Clear',
  'Save': 'Save'
}
const zh = {
  'Pencil': '画笔',
  'Shape': '形状',
  'Text': '文本',
  'Format': '格式',
  'Eraser': '橡皮',
  'Undo': '撤销',
  'Redo': '恢复',
  'Clear': '清除',
  'Save': '保存'
}

export default (lang) => {
  const dir = lang === 'zh' ? zh : en;
  return (key) => {
    return dir[key] || '';
  }
}
