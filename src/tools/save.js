import Tool from './tool';

class Save extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Save';
    this.icon = 'icon-save';
    this.label = 'Save';
  }

  handleClick() {
    const state = this.state;
    const u = navigator.userAgent;
    const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    const imgData = state.context.canvas.toDataURL('image/png');
    if (isIOS) {
      window.webkit.messageHandlers.saveImage.postMessage(imgData);
    } else if (isAndroid) {
      window.android.saveImage(imgData);
    } else {
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'whiteboard.png';
      link.click();
    }
  }
}

export default Save;
