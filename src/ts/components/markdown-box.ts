import { LitElement, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import markdown, { Token } from "markdown-it";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import MarkdownIt from "markdown-it";
import { loadImage } from "../storage.js";
import { Task } from "@lit/task";

@customElement("markdown-box")
export default class MarkdownBox extends LitElement {
  static override styles = css`
    img {
      width: 80%;
      max-height: 4cm;
      object-fit: contain;
    }
  `;

  @property({ type: String }) markdown = "";

  htmlTask = new Task(
    this,
    ([rawMarkdown]) => {
      return mir(markdown(), rawMarkdown, async (url) => {
        try {
          const blob = await loadImage(decodeURI(url));
          if (blob) {
            return URL.createObjectURL(blob);
          }
        } catch (e) {
          console.log("Failed to load image", url, e);
        }
        return url;
      });
    },
    () => [this.markdown]
  );

  override render() {
    return this.htmlTask.render({
      complete: (mdHtml) => unsafeHTML(mdHtml),
    });
  }
}

async function mir(
  md: MarkdownIt,
  markdown: string,
  replacer: (url: string) => Promise<string | undefined>
) {
  const parsed = md.parse(markdown, { references: {} });

  await replaceImageUrls(parsed, replacer);
  return md.renderer.render(parsed, {}, {});
}

function replaceImageUrls(
  tokens: Token[],
  replacer: (url: string) => Promise<string | undefined>
) {
  // For every token
  const ops = tokens.map(async (token) => {
    // fuse replacer for tokens with the image type
    if (token.type === "image") {
      const url = token.attrGet("src");

      // If the token has an image URL, replace it
      if (url) {
        const newUrl = await replacer(url);
        token.attrSet("src", newUrl || url);
      }
    }

    // travel down the tree: find & replace all URLs of the token's children as well
    if (token.children) {
      await replaceImageUrls(token.children, replacer);
    }
  });

  return Promise.all(ops);
}
