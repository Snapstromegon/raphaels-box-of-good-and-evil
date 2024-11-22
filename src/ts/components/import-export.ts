import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { Export, exportAll, importAll } from "../storage.js";
import "./markdown-box.js";

@customElement("import-export")
export default class ImportExport extends LitElement {
  override render() {
    return html` <button @click=${this.export} id="edit">Export</button
      ><input type="file" @change=${this.import} />`;
  }

  async export() {
    downloadObjectAsJson(await exportAll(), "item_export");
  }

  async import(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    const data = await file.text();
    const exportData = JSON.parse(data) as Export;
    await importAll(exportData);
    window.location.href = "?imported";
  }
}

function downloadObjectAsJson(exportObj: Object, exportName: string) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
