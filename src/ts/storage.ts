export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "very_rare"
  | "legendary";

export const itemRarityDE = {
  common: "Gewöhnlich",
  uncommon: "Ungewöhnlich",
  rare: "Selten",
  very_rare: "Sehr Selten",
  legendary: "Legendär",
};

export type ItemCategory =
  | ""
  | "armor"
  | "magic_sticks"
  | "magical_object"
  | "potion"
  | "ring"
  | "scepter"
  | "scroll"
  | "wand"
  | "weapon";

export const itemCategoryDE = {
  "": "",
  armor: "Rüstung",
  ring: "Ring",
  scroll: "Schriftrolle",
  potion: "Trank",
  weapon: "Waffe",
  magical_object: "Wundersamer Gegenstand",
  wand: "Zauberstab",
  magic_sticks: "Zauberstecken",
  scepter: "Zepter",
};

export type Item = {
  name: string;
  frontMd: string;
  backMd: string;
  needsAttunement: boolean;
  rarity: ItemRarity;
  category: ItemCategory;
};

export type Items = { [Key: string]: Item };
export type Export = { items: Items; images: { [key: string]: string } };

const getFilesystem = async () => {
  return await navigator.storage.getDirectory();
};

const getImageDirectory = async () => {
  const fs = await getFilesystem();
  return await fs.getDirectoryHandle("images", { create: true });
};

const commitItems = async (items: Items) => {
  const fs = await getFilesystem();
  const file = await (
    await fs.getFileHandle("items.json", { create: true })
  ).createWritable();
  await file.write(JSON.stringify(items));
  await file.close();
};

export const loadItems = async (): Promise<Items> => {
  const fs = await getFilesystem();
  try {
    const file = await fs.getFileHandle("items.json");
    const parsedFile: Object = JSON.parse(await (await file.getFile()).text());
    for (const item of Object.values(parsedFile)) {
      item.needsAttunement = item.needsAttunement ?? false;
      item.rarity = item.rarity ?? "Gewöhnlich";
      item.category = item.category ?? "";
    }
    return parsedFile as Items;
  } catch {
    return {};
  }
};

export const saveItem = async (item: Item) => {
  const items = await loadItems();
  items[item.name] = item;
  await commitItems(items);
};

export const deleteItem = async (name: string) => {
  const items = await loadItems();
  delete items[name];
  await commitItems(items);
};

export const getItem = async (name: string): Promise<Item | undefined> => {
  const items = await loadItems();
  return items[name];
};

export const saveImage = async (name: string, image: Blob) => {
  const fs = await getImageDirectory();
  const file = await (
    await fs.getFileHandle(name, { create: true })
  ).createWritable();
  await file.write(image);
  await file.close();
};

export const loadImage = async (name: string): Promise<Blob> => {
  const fs = await getImageDirectory();
  const file = await fs.getFileHandle(name);
  return await file.getFile();
};

export const deleteImage = async (name: string) => {
  const fs = await getImageDirectory();
  await fs.removeEntry(name);
};

export const listImages = async (): Promise<string[]> => {
  const fs = await getImageDirectory();
  const res = [];
  for await (const entry of (fs as any).values()) {
    res.push(entry.name);
  }
  console.log(res);
  return res;
};

export const exportAll = async () => {
  const items = await loadItems();

  const imageNames = await listImages();

  const images: { [key: string]: string } = {};

  for (const name of imageNames) {
    images[name] = await toBase64(await loadImage(name));
  }

  const exportData = { items, images };
  return exportData;
};

export const importAll = async (data: Export) => {
  const items = data.items;
  for (const item of Object.values(items)) {
    await saveItem(item);
  }

  const fs = await getImageDirectory();
  for (const [name, image] of Object.entries(data.images)) {
    const file = await fs.getFileHandle(name, { create: true });
    const writable = await file.createWritable();
    await writable.write(await fetch(image).then((res) => res.blob()));
    await writable.close();
  }
};

const toBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
