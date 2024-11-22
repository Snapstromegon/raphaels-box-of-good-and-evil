import { Task } from "@lit/task";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { deleteImage, listImages, loadImage, saveImage } from "../storage.js";

export type Image = { name: string; file: Blob };

@customElement("image-manager")
export default class ImageManager extends LitElement {
  static override styles = css`
    * {
      box-sizing: border-box;
    }

    #wrapper {
      padding: 0.5rem;
      background: #bef;
      border-radius: 0.5rem;
    }

    summary h2 {
      display: inline;
    }

    ul {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
      gap: 1rem;
      list-style: none;
      padding: 0;
      gap: 1rem;

      & li {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-rows: auto 1fr;
        grid-template-areas: "name delete" "image image";
        background: #333;
        border-radius: 0.5rem;
        color: #fff;

        & img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: contain;
          grid-column: 1 / -1;
        }

        & h4 {
          grid-area: name;
          margin: 0;
          z-index: 1;
          padding: 0.5rem;
          word-break: break-all;
        }

        & button {
          grid-area: delete;
          background: none;
          border: none;
          fill: #f00;
          cursor: pointer;
          background: #333a;

          &:hover {
            background: #f00;
            fill: #fff;
          }
        }
      }
    }
  `;

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
    return html`
      <div id="wrapper">
        <details>
          <summary>
            <h2>Bilder</h2>
          </summary>
          ${this.images.render({
            pending: () => html`Loading...`,
            complete: (images: Image[]) => html`
              <ul>
                ${repeat(
                  images,
                  (image) => image.name,
                  (image) =>
                    html`<li>
                      <h4>${image.name}</h4>
                      <img src="${URL.createObjectURL(image.file)}" /><button
                        @click=${() => this.deleteImage(image.name)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                        >
                          <path
                            d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"
                          />
                        </svg>
                      </button>
                    </li>`
                )}
              </ul>
            `,
          })}
        </details>
        <footer>
          <form @submit=${this.handleSubmit}>
            <input type="file" name="image" multiple accept="image/*" />
            <button type="submit">Speichern</button>
          </form>
        </footer>
      </div>
    `;
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    for (const file of form.image.files || []) {
      await saveImage(file.name, file);
    }
    this.imageNames.run();
  }

  async deleteImage(name: string) {
    if (confirm(`Bild ${name} wirklich löschen?`)) {
      await deleteImage(name);
      this.imageNames.run();
    }
  }
}
