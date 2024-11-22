import { LitElement, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { deleteItem, Item, saveItem } from "../storage.js";
import { ifDefined } from "lit/directives/if-defined.js";
import "./markdown-box.js";
import "./item-card.js";
import "./image-selector.js";

@customElement("item-editor")
export default class ItemEditor extends LitElement {
  static override styles = css`
    * {
      box-sizing: border-box;
    }

    #wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr 25rem;
      grid-template-rows: 1fr 1fr;
      grid-template-areas: "front back images" "card card images";
      gap: 1rem;
      padding: 0;
    }

    #frontmd {
      grid-area: front;
    }

    #backmd {
      grid-area: back;
    }

    item-card {
      grid-area: card;
    }

    image-selector {
      grid-area: images;
    }
  `;

  @property({ type: Object }) item?: Item;

  @query("#frontmd")
  frontMd!: HTMLTextAreaElement;

  @query("#backmd")
  backMd!: HTMLTextAreaElement;

  @query("#name")
  name!: HTMLInputElement;

  @state()
  selectedImage?: string;

  override render() {
    return html`
      <button @click=${this.close}>Schließen</button>
      <input
        id="name"
        type="text"
        .value=${this.item?.name || ""}
        @input=${this.rename}
      />
      <div id="wrapper">
        <textarea
          id="frontmd"
          @input=${this.liveUpdate}
          @focus=${this.applyImage}
          rows="10"
          cols="40"
        >
${this.item?.frontMd}</textarea
        >
        <textarea
          id="backmd"
          @input=${this.liveUpdate}
          @focus=${this.applyImage}
          rows="10"
          cols="40"
        >
${this.item?.backMd}</textarea
        >
        <item-card .item=${this.item}></item-card>
        <image-selector
          @select=${this.selectImage}
          selected=${ifDefined(this.selectedImage)}
        ></image-selector>
      </div>
    `;
  }

  async close() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  async liveUpdate() {
    this.item!.frontMd = this.frontMd.value;
    this.item!.backMd = this.backMd.value;
    this.item = { ...this.item! };
    await saveItem(this.item!);
  }

  async applyImage(e: FocusEvent) {
    if (this.selectedImage) {
      let target = e.target as HTMLTextAreaElement;
      console.log(target);
      target.value += `![](${encodeURI(this.selectedImage)})`;
      await this.liveUpdate();
      this.selectedImage = undefined;
    }
  }

  selectImage(e: CustomEvent<string>) {
    this.selectedImage = e.detail;
  }

  async saveEdit() {
    await saveItem(this.item!);
    this.requestUpdate();
  }

  async rename(e: InputEvent) {
    const newName = (e.target as HTMLInputElement).value;
    if (this.item) {
      await deleteItem(this.item.name);
    }
    this.item = { ...this.item!, name: newName };
    await this.saveEdit();
  }
}
