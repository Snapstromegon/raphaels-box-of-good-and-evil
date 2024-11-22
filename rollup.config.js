import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { copy } from "@web/rollup-plugin-copy";

export default {
  input: "src/index.html",
  output: { dir: "dest", format: "es", sourcemap: true },
  plugins: [
    html(),
    typescript(),
    resolve(),
    commonjs(),
    copy({ patterns: "assets/**", rootDir: "src" }),
  ],
};
