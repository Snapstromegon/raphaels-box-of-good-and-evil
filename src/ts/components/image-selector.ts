import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { listImages, loadImage } from "../storage.js";
import "./markdown-box.js";
import { Task } from "@lit/task";
import { repeat } from "lit/directives/repeat.js";
import { Image } from "./image-manager.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("image-selector")
export default class ImageSelector extends LitElement {
  static override styles = css`
    #wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
      gap: 0.5rem;
      list-style: none;
      padding: .5rem;
      gap: .5rem;
      height: 100%;
      overflow-y: auto;
      align-content: start;
    }

    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: contain;
      border-radius: 0.5rem;
    }

    .selected {
      outline: 2px solid #00f;
    }
  `;

  @property({ type: String }) selected?: string;

  imageNames = new Task(
    this,
    async () => {
      return await listImages();
    },
    () => []
  );

  images = new Task(
    this,
    async ([imageNames]) => {
      let res = await Promise.all(
        imageNames?.map(async (name) => {
          return { name, file: await loadImage(name) };
        }) || []
      );
      return res;
    },
    () => [this.imageNames.value]
  );

  override render() {
    return html`<div id="wrapper">
      ${this.images.render({
        complete: (images: Image[]) =>
          html`${repeat(
            images,
            (image) => image.name,
            (image) =>
              html`<img
                src="${URL.createObjectURL(image.file)}"
                alt=${image.name}
                title=${image.name}
                @click=${() => this.select(image.name)}
                class=${classMap({selected: image.name === this.selected})}
              />`
          )}`,
      })}
    </div>`;
  }

  select(imageName: string) {
    this.dispatchEvent(new CustomEvent("select", { detail: imageName }));
  }
}
