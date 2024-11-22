import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { deleteItem, Item } from "../storage.js";
import "./markdown-box.js";

@customElement("item-card")
export default class ItemCard extends LitElement {
  static override styles = css`
    * {
      box-sizing: border-box;
    }

    :host([controls]) {
      & #edit,
      & #delete {
        display: block;
      }
    }

    #wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr auto auto;
      grid-template-rows: auto auto;
      gap: 0.5rem;
      grid-template-areas: "name name delete edit" "front back back back";
      padding: 1rem;
      background: #333;
      border-radius: 0.5rem;
    }

    h2 {
      grid-area: name;
      color: #fff;
      padding: 0;
      margin: 0;
    }

    #front {
      grid-area: front;
    }

    #back {
      grid-area: back;
    }

    #edit {
      grid-area: edit;
      --color: #e8eaed;
      --counter-color: #000;
    }

    #delete {
      grid-area: delete;
      --color: #f00;
      --counter-color: #fff;
    }
    button {
      border: none;
      background: none;
      cursor: pointer;
      fill: var(--color);
      color: var(--color);
      display: none;

      &:hover {
        background: var(--color);
        fill: var(--counter-color);
      }
    }

    .card {
      width: 6cm;
      height: 9cm;
      background: url("./assets/paper-texture.png");
      display: flex;
      flex-direction: column;
      align-items: center;
      place-content: center;
      border-radius: 0.5rem;
      overflow: hidden;
      padding: 5mm;
      & markdown-box {
        mix-blend-mode: multiply;
        text-align: center;
      }
    }
  `;

  @property({ type: Object }) item?: Item;
  @property({ type: Boolean }) controls = false;

  override render() {
    console.log("item:", this.item);
    return html`
      <div id="wrapper">
        <h2>${this.item?.name}</h2>
        <button id="delete" @click=${this.delete}>
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
        <button id="edit" @click=${this.edit}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
          >
            <path
              d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"
            />
          </svg>
        </button>
        <div class="card" id="front">
          <markdown-box markdown=${this.item?.frontMd || ""}></markdown-box>
        </div>
        <div class="card" id="back">
          <markdown-box markdown=${this.item?.backMd || ""}></markdown-box>
        </div>
      </div>
    `;
  }

  async delete() {
    if (this.item && confirm(`Wirklich "${this.item?.name}" löschen?`)) {
      await deleteItem(this.item.name);
      this.dispatchEvent(new CustomEvent("delete", { detail: this.item }));
    }
  }

  async edit() {
    this.dispatchEvent(new CustomEvent("edit", { detail: this.item }));
  }
}
