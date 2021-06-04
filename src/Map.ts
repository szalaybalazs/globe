export default class WorldMap {
  private url: string;
  private canvas: HTMLCanvasElement;
  private image: HTMLImageElement;
  private heatmap: { [key: string]: string } = {};

  constructor(url: string) {
    this.url = url;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 3840;
    this.canvas.height = 2160;
    this.image = new Image();
  }

  private loadImage = () => {
    return new Promise((res) => {
      this.image.onload = () =>
        setTimeout(() => {
          const context = this.canvas.getContext("2d");
          if (context) context.drawImage(this.image, 0, 0);
          res(true);
        }, 100);
      this.image.crossOrigin = "Anonymous";
      this.image.src = this.url;
    });
  };

  public load = async () => {
    await Promise.all([this.loadImage()]);

    return this;
  };

  public getColor = (x: number, y: number) => {
    const context = this.canvas.getContext("2d");
    const data = context?.getImageData(
      Math.min(1, Math.max(0, x)) * 2754,
      Math.min(1, Math.max(0, y)) * 1397,
      1,
      1
    );

    return data?.data?.[3] || 0;
  };
}
