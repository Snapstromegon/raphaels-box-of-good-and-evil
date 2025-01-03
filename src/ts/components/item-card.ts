import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { deleteItem, Item, itemCategoryDE, itemRarityDE, saveItem } from "../storage.js";
import "./markdown-box.js";
import { classMap } from "lit/directives/class-map.js";

const categoryIcon = {
  "": "",
  armor: "security",
  magic_sticks: "ink_marker",
  magical_object: "emoji_objects",
  potion: "air_freshner",
  ring: "circles",
  scepter: "man_4",
  scroll: "contract",
  wand: "wounds_injury",
  weapon: "swords",
};

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
      grid-template-columns: 1fr 1fr auto auto auto;
      grid-template-rows: auto auto;
      gap: 0.5rem;
      grid-template-areas: "name name printCount delete edit" "front back back back back";
      padding: 1rem;
      background: #333;
      border-radius: 0.5rem;

      &.uncommon .card {
        border-color: #51a72e;
      }

      &.rare .card {
        border-color: #156082;
      }

      &.very_rare .card {
        border-color: #a02b93;
      }

      &.legendary .card {
        border-color: #e97132;
      }
    }

    h2 {
      grid-area: name;
      color: #fff;
      padding: 0;
      margin: 0;
    }

    #front {
      grid-area: front;
      display: grid;
      grid-template-rows: 1fr auto;
    }

    #back {
      grid-area: back;
    }

    #printCount {
      grid-area: printCount;
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
      border-radius: 0.5rem;
      overflow: hidden;
      padding: 2mm;
      page-break-inside: avoid;
      border: 2mm solid #aaa;
      place-content: center;
      & markdown-box {
        mix-blend-mode: multiply;
        text-align: center;
      }

      footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;
        gap: 0.5rem;
        margin-top: 0.25rem;
        flex-wrap: wrap-reverse;
        & img {
          height: 16px;
        }

        & span {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
      }
    }
    @media print {
      #printCount,
      #edit,
      #delete {
        display: none !important;
      }

      h2 {
        display: none;
      }

      .card {
        border-radius: 0;
        & markdown-box {
          mix-blend-mode: normal;
        }
      }

      #wrapper {
        padding: 0;
        background: none;
        gap: 0;
        grid-template-columns: 1fr 1fr 1fr;
      }
    }
  `;

  @property({ type: Object }) item?: Item;
  @property({ type: Boolean }) controls = false;

  override render() {
    // console.log("item:", this.item);
    return html`
      <div
        id="wrapper"
        class=${classMap({
          [this.item?.rarity || "common"]: true,
        })}
      >
        <h2>${this.item?.name}</h2>
        <input type="number" id="printCount" value=${this.item?.printCount ?? 1} @input=${this.updatePrintCount} min=0 max=64 />
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
          <footer>
            <span>
              ${this.item?.category
                ? html`<img
                    id="category"
                    src="${"assets/icons/" +
                    categoryIcon[this.item?.category || ""] +
                    ".svg"}"
                    style="fill: #f00;"
                  />`
                : ""}
              ${itemCategoryDE[this.item?.category || ""]}
            </span>
            <span>${itemRarityDE[this.item?.rarity || "common"]}</span>
            ${this.item?.needsAttunement
              ? html`<span id="attunement">Einstimmung</span>`
              : ""}
          </footer>
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

  async updatePrintCount(e: InputEvent) {
    if (this.item) {
      this.item.printCount = Number((e.target as HTMLInputElement).value);
      await saveItem(this.item);
      this.dispatchEvent(new CustomEvent("updatePrintCount", { detail: this.item }));
    }
  }
}
