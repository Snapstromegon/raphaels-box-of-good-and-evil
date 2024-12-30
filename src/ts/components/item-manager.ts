import { Task } from "@lit/task";
import { LitElement, html, css } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { range } from "lit/directives/range.js";
import { map } from "lit/directives/map.js";
import { Item, loadItems, saveItem } from "../storage.js";
import "./item-card.js";
import "./item-editor.js";

@customElement("item-manager")
export default class ItemManager extends LitElement {
  static override styles = css`
    * {
      box-sizing: border-box;
    }

    #wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fit, calc(12cm + 2.5rem));
      gap: 1rem;
      list-style: none;
      padding: 0;
      justify-content: center;
    }

    #printWrapper {
      display: none;
    }

    @media print {
      h2 {
        display: none;
      }

      button {
        display: none;
      }

      #wrapper {
        display: none;
      }

      #printWrapper {
        display: grid;
        grid-template-columns: repeat(auto-fit, calc(12cm + 2.5rem));
        gap: 1rem;
        list-style: none;
        padding: 0;
        justify-content: center;
      }
    }
  `;

  itemsTask = new Task(
    this,
    async () => {
      return await loadItems();
    },
    () => []
  );

  @query("dialog")
  editorDialog!: HTMLDialogElement;

  @state()
  editItem?: Item;

  override render() {
    return html`
      <h2>Items</h2>
      <button @click=${() => window.print()}>Drucken</button>
      <button @click=${this.printDeselectAll}>Alle Abwählen</button>
      <button @click=${this.printSelectAll}>Alle Wählen</button>
      <button
        @click=${() =>
          this.openEdit({
            name: "",
            frontMd: "",
            backMd: "",
            needsAttunement: false,
            rarity: "common",
            category: "",
          })}
      >
        Neues Item
      </button>
      <div id="wrapper">
        ${this.itemsTask.render({
          pending: () => html`Loading...`,
          complete: (items) =>
            html`${repeat(
              Object.values(items),
              (item) => item.name,
              (item) =>
                html`
                  <item-card
                    controls
                    .item=${item}
                    @delete=${() => this.itemsTask.run()}
                    @edit=${() => this.openEdit(item)}
                    @updatePrintCount=${() => this.itemsTask.run()}
                  ></item-card>
                `
            )}`,
        })}
      </div>
      <div id="printWrapper">
        ${this.itemsTask.render({
          pending: () => html`Loading...`,
          complete: (items) =>
            html`${repeat(
              Object.values(items),
              (item) => item.name,
              (item) =>
                map(
                  range(item.printCount ?? 1),
                  () =>
                    html`
                      <item-card
                        controls
                        .item=${item}
                        @delete=${() => this.itemsTask.run()}
                        @edit=${() => this.openEdit(item)}
                        @updatePrintCount=${() => this.itemsTask.run()}
                      ></item-card>
                    `
                )
            )}`,
        })}
      </div>
      <dialog>
        <h3>Item Editor</h3>
        <item-editor
          .item=${this.editItem}
          @close=${this.closeEdit}
        ></item-editor>
      </dialog>
    `;
  }

  openEdit(item: Item) {
    this.editItem = item;
    this.editorDialog.showModal();
  }

  closeEdit() {
    this.editorDialog.close();
    this.editItem = undefined;
    this.itemsTask.run();
  }

  async printSelectAll() {
    for (const item of Object.values(this.itemsTask.value || {})) {
      item.printCount = 1;
      await saveItem(item);
    }
    this.itemsTask.run();
  }

  async printDeselectAll() {
    for (const item of Object.values(this.itemsTask.value || {})) {
      item.printCount = 0;
      await saveItem(item);
    }
    this.itemsTask.run();
  }
}
