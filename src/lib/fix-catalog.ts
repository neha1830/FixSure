/**
 * Guided fix catalog — India-market brands + aesthetic staged photos.
 * Phones/laptops show ~15 primary series; remaining brands live under Others.
 */

import { PHONE_BRANDS } from "./troubleshooting-constants";

export type FixCategoryId = "phone" | "laptop" | "ipad" | "smartwatch";

export type FixSeries = {
  id: string;
  label: string;
  brand: string;
  image: string;
};

export type FixModel = {
  id: string;
  seriesId: string;
  label: string;
  image: string;
  details?: string;
};

export type FixCategory = {
  id: FixCategoryId;
  label: string;
  deviceType: string;
  series: FixSeries[];
  models: FixModel[];
};

export const FIX_CATEGORY_META: Array<{
  id: FixCategoryId;
  label: string;
  deviceType: string;
}> = [
  { id: "phone", label: "Phone", deviceType: "phone" },
  { id: "laptop", label: "Laptop", deviceType: "macbook" },
  { id: "ipad", label: "iPad", deviceType: "tablet" },
  { id: "smartwatch", label: "Watch", deviceType: "smartwatch" },
];

const P = "/images/products/stage";
const og = (id: string) => `${P}/${id}.jpg`;

export const FIX_CATEGORIES: FixCategory[] = [
  {
    id: "phone",
    label: "Phone",
    deviceType: "phone",
    series: [
      { id: "iphone", label: "iPhone", brand: "Apple", image: og("iphone-16-plus") },
      { id: "samsung", label: "Samsung", brand: "Samsung", image: og("s24-ultra") },
      { id: "pixel", label: "Pixel", brand: "Google", image: og("pixel-8-pro") },
      { id: "oneplus", label: "OnePlus", brand: "OnePlus", image: og("op-12") },
      { id: "vivo", label: "Vivo", brand: "Vivo", image: og("vivo-v30") },
      { id: "oppo", label: "Oppo", brand: "Oppo", image: og("oppo-find-x9-ultra") },
      { id: "nothing", label: "Nothing", brand: "Nothing", image: og("nothing-phone-3") },
      { id: "xiaomi", label: "Xiaomi", brand: "Xiaomi", image: og("xiaomi-17") },
      { id: "redmi", label: "Redmi", brand: "Xiaomi", image: og("redmi-note-15-pro-plus") },
      { id: "realme", label: "Realme", brand: "Realme", image: og("realme-gt7") },
      { id: "motorola", label: "Motorola", brand: "Motorola", image: og("moto-edge-70-fusion") },
      { id: "iqoo", label: "iQOO", brand: "iQOO", image: og("iqoo-z9") },
      { id: "poco", label: "POCO", brand: "POCO", image: og("poco-f7") },
      { id: "nokia", label: "Nokia", brand: "Nokia", image: og("nokia-g42") },
      { id: "infinix", label: "Infinix", brand: "Infinix", image: og("infinix-gt-20-pro") },
      { id: "others", label: "Others", brand: "Other", image: og("honor-400") },
    ],
    models: [
      // —— iPhone ——
      { id: "iphone-16-pro-max", seriesId: "iphone", label: "iPhone 16 Pro Max (2024)", image: og("iphone-16-pro-max") },
      { id: "iphone-16-pro", seriesId: "iphone", label: "iPhone 16 Pro (2024)", image: og("iphone-16-pro") },
      { id: "iphone-16-plus", seriesId: "iphone", label: "iPhone 16 Plus (2024)", image: og("iphone-16-plus") },
      { id: "iphone-16", seriesId: "iphone", label: "iPhone 16 (2024)", image: og("iphone-16") },
      { id: "iphone-15-pro-max", seriesId: "iphone", label: "iPhone 15 Pro Max (2023)", image: og("iphone-15-pro-max") },
      { id: "iphone-15-pro", seriesId: "iphone", label: "iPhone 15 Pro (2023)", image: og("iphone-15-pro") },
      { id: "iphone-15-plus", seriesId: "iphone", label: "iPhone 15 Plus (2023)", image: og("iphone-15-plus") },
      { id: "iphone-15", seriesId: "iphone", label: "iPhone 15 (2023)", image: og("iphone-15") },
      { id: "iphone-14-pro-max", seriesId: "iphone", label: "iPhone 14 Pro Max (2022)", image: og("iphone-14-pro-max") },
      { id: "iphone-14-pro", seriesId: "iphone", label: "iPhone 14 Pro (2022)", image: og("iphone-14-pro") },
      { id: "iphone-14-plus", seriesId: "iphone", label: "iPhone 14 Plus (2022)", image: og("iphone-14-plus") },
      { id: "iphone-14", seriesId: "iphone", label: "iPhone 14 (2022)", image: og("iphone-14") },
      { id: "iphone-13-pro-max", seriesId: "iphone", label: "iPhone 13 Pro Max (2021)", image: og("iphone-13-pro-max") },
      { id: "iphone-13-pro", seriesId: "iphone", label: "iPhone 13 Pro (2021)", image: og("iphone-13-pro") },
      { id: "iphone-13", seriesId: "iphone", label: "iPhone 13 (2021)", image: og("iphone-13") },
      { id: "iphone-13-mini", seriesId: "iphone", label: "iPhone 13 mini (2021)", image: og("iphone-13-mini") },
      { id: "iphone-12-pro-max", seriesId: "iphone", label: "iPhone 12 Pro Max (2020)", image: og("iphone-12-pro-max") },
      { id: "iphone-12-pro", seriesId: "iphone", label: "iPhone 12 Pro (2020)", image: og("iphone-12-pro") },
      { id: "iphone-12", seriesId: "iphone", label: "iPhone 12 (2020)", image: og("iphone-12") },
      { id: "iphone-12-mini", seriesId: "iphone", label: "iPhone 12 mini (2020)", image: og("iphone-12-mini") },
      { id: "iphone-11-pro-max", seriesId: "iphone", label: "iPhone 11 Pro Max (2019)", image: og("iphone-11-pro-max") },
      { id: "iphone-11-pro", seriesId: "iphone", label: "iPhone 11 Pro (2019)", image: og("iphone-11-pro") },
      { id: "iphone-11", seriesId: "iphone", label: "iPhone 11 (2019)", image: og("iphone-11") },
      { id: "iphone-xs-max", seriesId: "iphone", label: "iPhone XS Max (2018)", image: og("iphone-xs-max") },
      { id: "iphone-xs", seriesId: "iphone", label: "iPhone XS (2018)", image: og("iphone-xs") },
      { id: "iphone-xr", seriesId: "iphone", label: "iPhone XR (2018)", image: og("iphone-xr") },
      { id: "iphone-x", seriesId: "iphone", label: "iPhone X (2017)", image: og("iphone-x") },
      { id: "iphone-8-plus", seriesId: "iphone", label: "iPhone 8 Plus (2017)", image: og("iphone-8-plus") },
      { id: "iphone-8", seriesId: "iphone", label: "iPhone 8 (2017)", image: og("iphone-8") },
      { id: "iphone-7-plus", seriesId: "iphone", label: "iPhone 7 Plus (2016)", image: og("iphone-7-plus") },
      { id: "iphone-7", seriesId: "iphone", label: "iPhone 7 (2016)", image: og("iphone-7") },
      { id: "iphone-6s-plus", seriesId: "iphone", label: "iPhone 6s Plus (2015)", image: og("iphone-6s-plus") },
      { id: "iphone-6s", seriesId: "iphone", label: "iPhone 6s (2015)", image: og("iphone-6s") },
      { id: "iphone-6-plus", seriesId: "iphone", label: "iPhone 6 Plus (2014)", image: og("iphone-6-plus") },
      { id: "iphone-6", seriesId: "iphone", label: "iPhone 6 (2014)", image: og("iphone-6") },
      { id: "iphone-se-2022", seriesId: "iphone", label: "iPhone SE (3rd gen, 2022)", image: og("iphone-se-2022") },
      { id: "iphone-se-2020", seriesId: "iphone", label: "iPhone SE (2nd gen, 2020)", image: og("iphone-se-2020") },
      { id: "iphone-5s", seriesId: "iphone", label: "iPhone 5s (2013)", image: og("iphone-5s") },
      { id: "iphone-5c", seriesId: "iphone", label: "iPhone 5c (2013)", image: og("iphone-5c") },
      { id: "iphone-5", seriesId: "iphone", label: "iPhone 5 (2012)", image: og("iphone-5") },
      { id: "iphone-4s", seriesId: "iphone", label: "iPhone 4s (2011)", image: og("iphone-4s") },
      { id: "iphone-4", seriesId: "iphone", label: "iPhone 4 (2010)", image: og("iphone-4") },
      { id: "iphone-3gs", seriesId: "iphone", label: "iPhone 3GS (2009)", image: og("iphone-3gs") },
      // —— Samsung ——
      { id: "s26", seriesId: "samsung", label: "Galaxy S26 (2026)", image: og("s26") },
      { id: "s25", seriesId: "samsung", label: "Galaxy S25 (2025)", image: og("s25") },
      { id: "s24-ultra", seriesId: "samsung", label: "Galaxy S24 Ultra (2024)", image: og("s24-ultra") },
      { id: "s24", seriesId: "samsung", label: "Galaxy S24 (2024)", image: og("s24") },
      { id: "s23-ultra", seriesId: "samsung", label: "Galaxy S23 Ultra (2023)", image: og("s23-ultra") },
      { id: "s23", seriesId: "samsung", label: "Galaxy S23 (2023)", image: og("s23") },
      { id: "s22-ultra", seriesId: "samsung", label: "Galaxy S22 Ultra (2022)", image: og("s22-ultra") },
      { id: "s22", seriesId: "samsung", label: "Galaxy S22 (2022)", image: og("s22") },
      { id: "s21", seriesId: "samsung", label: "Galaxy S21 (2021)", image: og("s21") },
      { id: "s20", seriesId: "samsung", label: "Galaxy S20 (2020)", image: og("s20") },
      { id: "s20-fe", seriesId: "samsung", label: "Galaxy S20 FE (2020)", image: og("s20-fe") },
      { id: "s10", seriesId: "samsung", label: "Galaxy S10 (2019)", image: og("s10") },
      { id: "s9", seriesId: "samsung", label: "Galaxy S9 (2018)", image: og("s9") },
      { id: "s8", seriesId: "samsung", label: "Galaxy S8 (2017)", image: og("s8") },
      { id: "s7", seriesId: "samsung", label: "Galaxy S7 (2016)", image: og("s7") },
      { id: "s6", seriesId: "samsung", label: "Galaxy S6 (2015)", image: og("s6") },
      { id: "s5", seriesId: "samsung", label: "Galaxy S5 (2014)", image: og("s5") },
      { id: "s4", seriesId: "samsung", label: "Galaxy S4 (2013)", image: og("s4") },
      { id: "s3", seriesId: "samsung", label: "Galaxy S3 (2012)", image: og("s3") },
      { id: "note20", seriesId: "samsung", label: "Galaxy Note20 (2020)", image: og("note20") },
      { id: "note10", seriesId: "samsung", label: "Galaxy Note10 (2019)", image: og("note10") },
      { id: "note9", seriesId: "samsung", label: "Galaxy Note9 (2018)", image: og("note9") },
      { id: "note8", seriesId: "samsung", label: "Galaxy Note8 (2017)", image: og("note8") },
      { id: "note5", seriesId: "samsung", label: "Galaxy Note5 (2015)", image: og("note5") },
      { id: "note4", seriesId: "samsung", label: "Galaxy Note4 (2014)", image: og("note4") },
      { id: "note3", seriesId: "samsung", label: "Galaxy Note3 (2013)", image: og("note3") },
      { id: "note2", seriesId: "samsung", label: "Galaxy Note2 (2012)", image: og("note2") },
      { id: "a57", seriesId: "samsung", label: "Galaxy A57 (2026)", image: og("a57") },
      { id: "a56", seriesId: "samsung", label: "Galaxy A56 (2025)", image: og("a56") },
      { id: "a55", seriesId: "samsung", label: "Galaxy A55 (2024)", image: og("a55") },
      { id: "a54", seriesId: "samsung", label: "Galaxy A54 (2023)", image: og("a54") },
      { id: "a53", seriesId: "samsung", label: "Galaxy A53 (2022)", image: og("a53") },
      { id: "a52", seriesId: "samsung", label: "Galaxy A52 (2021)", image: og("a52") },
      { id: "a51", seriesId: "samsung", label: "Galaxy A51 (2019)", image: og("a51") },
      { id: "a50", seriesId: "samsung", label: "Galaxy A50 (2019)", image: og("a50") },
      { id: "a14", seriesId: "samsung", label: "Galaxy A14 (2023)", image: og("a14") },
      { id: "m53", seriesId: "samsung", label: "Galaxy M53 (2022)", image: og("m53") },
      { id: "m52", seriesId: "samsung", label: "Galaxy M52 (2021)", image: og("m52") },
      { id: "m51", seriesId: "samsung", label: "Galaxy M51 (2020)", image: og("m51") },
      { id: "m31", seriesId: "samsung", label: "Galaxy M31 (2020)", image: og("m31") },
      { id: "zfold7", seriesId: "samsung", label: "Galaxy Z Fold7 (2025)", image: og("zfold7") },
      { id: "zfold6", seriesId: "samsung", label: "Galaxy Z Fold6 (2024)", image: og("zfold6") },
      { id: "zfold5", seriesId: "samsung", label: "Galaxy Z Fold5 (2023)", image: og("zfold5") },
      { id: "zfold4", seriesId: "samsung", label: "Galaxy Z Fold4 (2022)", image: og("zfold4") },
      { id: "zfold3", seriesId: "samsung", label: "Galaxy Z Fold3 (2021)", image: og("zfold3") },
      { id: "zfold2", seriesId: "samsung", label: "Galaxy Z Fold2 (2020)", image: og("zfold2") },
      { id: "zflip7", seriesId: "samsung", label: "Galaxy Z Flip7 (2025)", image: og("zflip7") },
      { id: "zflip6", seriesId: "samsung", label: "Galaxy Z Flip6 (2024)", image: og("zflip6") },
      { id: "zflip5", seriesId: "samsung", label: "Galaxy Z Flip5 (2023)", image: og("zflip5") },
      { id: "zflip4", seriesId: "samsung", label: "Galaxy Z Flip4 (2022)", image: og("zflip4") },
      { id: "zflip3", seriesId: "samsung", label: "Galaxy Z Flip3 (2021)", image: og("zflip3") },
      { id: "zflip", seriesId: "samsung", label: "Galaxy Z Flip (2020)", image: og("zflip") },
      // —— Pixel ——
      { id: "pixel-10-pro-xl", seriesId: "pixel", label: "Pixel 10 Pro XL (2025)", image: og("pixel-10-pro-xl") },
      { id: "pixel-10-pro", seriesId: "pixel", label: "Pixel 10 Pro (2025)", image: og("pixel-10-pro") },
      { id: "pixel-10", seriesId: "pixel", label: "Pixel 10 (2025)", image: og("pixel-10") },
      { id: "pixel-9-pro-fold", seriesId: "pixel", label: "Pixel 9 Pro Fold (2024)", image: og("pixel-9-pro-fold") },
      { id: "pixel-9-pro-xl", seriesId: "pixel", label: "Pixel 9 Pro XL (2024)", image: og("pixel-9-pro-xl") },
      { id: "pixel-9-pro", seriesId: "pixel", label: "Pixel 9 Pro (2024)", image: og("pixel-9-pro") },
      { id: "pixel-9a", seriesId: "pixel", label: "Pixel 9a (2025)", image: og("pixel-9a") },
      { id: "pixel-9", seriesId: "pixel", label: "Pixel 9 (2024)", image: og("pixel-9") },
      { id: "pixel-8-pro", seriesId: "pixel", label: "Pixel 8 Pro (2023)", image: og("pixel-8-pro") },
      { id: "pixel-8a", seriesId: "pixel", label: "Pixel 8a (2024)", image: og("pixel-8a") },
      { id: "pixel-8", seriesId: "pixel", label: "Pixel 8 (2023)", image: og("pixel-8") },
      { id: "pixel-7-pro", seriesId: "pixel", label: "Pixel 7 Pro (2022)", image: og("pixel-7-pro") },
      { id: "pixel-7a", seriesId: "pixel", label: "Pixel 7a (2023)", image: og("pixel-7a") },
      { id: "pixel-7", seriesId: "pixel", label: "Pixel 7 (2022)", image: og("pixel-7") },
      { id: "pixel-6-pro", seriesId: "pixel", label: "Pixel 6 Pro (2021)", image: og("pixel-6-pro") },
      { id: "pixel-6a", seriesId: "pixel", label: "Pixel 6a (2022)", image: og("pixel-6a") },
      { id: "pixel-6", seriesId: "pixel", label: "Pixel 6 (2021)", image: og("pixel-6") },
      { id: "pixel-5a", seriesId: "pixel", label: "Pixel 5a (2021)", image: og("pixel-5a") },
      { id: "pixel-5", seriesId: "pixel", label: "Pixel 5 (2020)", image: og("pixel-5") },
      { id: "pixel-4a", seriesId: "pixel", label: "Pixel 4a (2020)", image: og("pixel-4a") },
      { id: "pixel-4", seriesId: "pixel", label: "Pixel 4 (2019)", image: og("pixel-4") },
      { id: "pixel-3a", seriesId: "pixel", label: "Pixel 3a (2019)", image: og("pixel-3a") },
      { id: "pixel-3", seriesId: "pixel", label: "Pixel 3 (2018)", image: og("pixel-3") },
      { id: "pixel-2", seriesId: "pixel", label: "Pixel 2 (2017)", image: og("pixel-2") },
      { id: "pixel-1", seriesId: "pixel", label: "Pixel (2016)", image: og("pixel-1") },
      // —— OnePlus ——
      { id: "op-15", seriesId: "oneplus", label: "OnePlus 15 (2025)", image: og("op-15") },
      { id: "op-13", seriesId: "oneplus", label: "OnePlus 13 (2024)", image: og("op-13") },
      { id: "op-13r", seriesId: "oneplus", label: "OnePlus 13R (2025)", image: og("op-13r") },
      { id: "op-12", seriesId: "oneplus", label: "OnePlus 12 (2023)", image: og("op-12") },
      { id: "op-12r", seriesId: "oneplus", label: "OnePlus 12R (2024)", image: og("op-12r") },
      { id: "op-11", seriesId: "oneplus", label: "OnePlus 11 (2023)", image: og("op-11") },
      { id: "op-10-pro", seriesId: "oneplus", label: "OnePlus 10 Pro (2022)", image: og("op-10-pro") },
      { id: "op-9-pro", seriesId: "oneplus", label: "OnePlus 9 Pro (2021)", image: og("op-9-pro") },
      { id: "op-9", seriesId: "oneplus", label: "OnePlus 9 (2021)", image: og("op-9") },
      { id: "op-8-pro", seriesId: "oneplus", label: "OnePlus 8 Pro (2020)", image: og("op-8-pro") },
      { id: "op-8", seriesId: "oneplus", label: "OnePlus 8 (2020)", image: og("op-8") },
      { id: "op-7-pro", seriesId: "oneplus", label: "OnePlus 7 Pro (2019)", image: og("op-7-pro") },
      { id: "op-7", seriesId: "oneplus", label: "OnePlus 7 (2019)", image: og("op-7") },
      { id: "op-6t", seriesId: "oneplus", label: "OnePlus 6T (2018)", image: og("op-6t") },
      { id: "op-6", seriesId: "oneplus", label: "OnePlus 6 (2018)", image: og("op-6") },
      { id: "op-5t", seriesId: "oneplus", label: "OnePlus 5T (2017)", image: og("op-5t") },
      { id: "op-5", seriesId: "oneplus", label: "OnePlus 5 (2017)", image: og("op-5") },
      { id: "op-3t", seriesId: "oneplus", label: "OnePlus 3T (2016)", image: og("op-3t") },
      { id: "op-3", seriesId: "oneplus", label: "OnePlus 3 (2016)", image: og("op-3") },
      { id: "op-2", seriesId: "oneplus", label: "OnePlus 2 (2015)", image: og("op-2") },
      { id: "op-x", seriesId: "oneplus", label: "OnePlus X (2015)", image: og("op-x") },
      { id: "op-one", seriesId: "oneplus", label: "OnePlus One (2014)", image: og("op-one") },
      { id: "op-nord-5", seriesId: "oneplus", label: "OnePlus Nord 5 (2025)", image: og("op-nord-5") },
      { id: "op-nord-4", seriesId: "oneplus", label: "OnePlus Nord 4 (2024)", image: og("op-nord-4") },
      { id: "op-nord-3", seriesId: "oneplus", label: "OnePlus Nord 3 (2023)", image: og("op-nord-3") },
      { id: "op-nord-2", seriesId: "oneplus", label: "OnePlus Nord 2 (2021)", image: og("op-nord-2") },
      { id: "op-nord", seriesId: "oneplus", label: "OnePlus Nord (2020)", image: og("op-nord") },
      // —— Vivo ——
      { id: "vivo-x300", seriesId: "vivo", label: "Vivo X300 (2025)", image: og("vivo-x300") },
      { id: "vivo-x200", seriesId: "vivo", label: "Vivo X200 (2024)", image: og("vivo-x200") },
      { id: "vivo-x100", seriesId: "vivo", label: "Vivo X100 (2023)", image: og("vivo-x100") },
      { id: "vivo-x90", seriesId: "vivo", label: "Vivo X90 (2022)", image: og("vivo-x90") },
      { id: "vivo-x80", seriesId: "vivo", label: "Vivo X80 (2022)", image: og("vivo-x80") },
      { id: "vivo-x70", seriesId: "vivo", label: "Vivo X70 (2021)", image: og("vivo-x70") },
      { id: "vivo-x60", seriesId: "vivo", label: "Vivo X60 (2021)", image: og("vivo-x60") },
      { id: "vivo-x50", seriesId: "vivo", label: "Vivo X50 (2020)", image: og("vivo-x50") },
      { id: "vivo-x7", seriesId: "vivo", label: "Vivo X7 (2016)", image: og("vivo-x7") },
      { id: "vivo-x5", seriesId: "vivo", label: "Vivo X5 (2014)", image: og("vivo-x5") },
      { id: "vivo-x1", seriesId: "vivo", label: "Vivo X1 (2012)", image: og("vivo-x1") },
      { id: "vivo-v80", seriesId: "vivo", label: "Vivo V80 (2026)", image: og("vivo-v80") },
      { id: "vivo-v60", seriesId: "vivo", label: "Vivo V60 (2025)", image: og("vivo-v60") },
      { id: "vivo-v50", seriesId: "vivo", label: "Vivo V50 (2025)", image: og("vivo-v50") },
      { id: "vivo-v40", seriesId: "vivo", label: "Vivo V40 (2024)", image: og("vivo-v40") },
      { id: "vivo-v30", seriesId: "vivo", label: "Vivo V30 (2024)", image: og("vivo-v30") },
      { id: "vivo-v29", seriesId: "vivo", label: "Vivo V29 (2023)", image: og("vivo-v29") },
      { id: "vivo-v27", seriesId: "vivo", label: "Vivo V27 (2023)", image: og("vivo-v27") },
      { id: "vivo-v25", seriesId: "vivo", label: "Vivo V25 (2022)", image: og("vivo-v25") },
      { id: "vivo-v23", seriesId: "vivo", label: "Vivo V23 (2022)", image: og("vivo-v23") },
      { id: "vivo-v21", seriesId: "vivo", label: "Vivo V21 (2021)", image: og("vivo-v21") },
      { id: "vivo-v20", seriesId: "vivo", label: "Vivo V20 (2020)", image: og("vivo-v20") },
      { id: "vivo-v17-pro", seriesId: "vivo", label: "Vivo V17 Pro (2019)", image: og("vivo-v17-pro") },
      { id: "vivo-v15-pro", seriesId: "vivo", label: "Vivo V15 Pro (2019)", image: og("vivo-v15-pro") },
      { id: "vivo-v15", seriesId: "vivo", label: "Vivo V15 (2019)", image: og("vivo-v15") },
      { id: "vivo-v11-pro", seriesId: "vivo", label: "Vivo V11 Pro (2018)", image: og("vivo-v11-pro") },
      { id: "vivo-v9", seriesId: "vivo", label: "Vivo V9 (2018)", image: og("vivo-v9") },
      { id: "vivo-v7", seriesId: "vivo", label: "Vivo V7 (2017)", image: og("vivo-v7") },
      { id: "vivo-v5", seriesId: "vivo", label: "Vivo V5 (2016)", image: og("vivo-v5") },
      { id: "vivo-y35", seriesId: "vivo", label: "Vivo Y35 (2022)", image: og("vivo-y35") },
      { id: "vivo-y21", seriesId: "vivo", label: "Vivo Y21 (2021)", image: og("vivo-y21") },
      { id: "vivo-y20", seriesId: "vivo", label: "Vivo Y20 (2020)", image: og("vivo-y20") },
      { id: "vivo-y200", seriesId: "vivo", label: "Vivo Y200 (2023)", image: og("vivo-y200") },
      { id: "vivo-t3", seriesId: "vivo", label: "Vivo T3 (2024)", image: og("vivo-t3") },
      // —— Oppo ——
      { id: "oppo-find-x9-ultra", seriesId: "oppo", label: "Oppo Find X9 Ultra (2025)", image: og("oppo-find-x9-ultra") },
      { id: "oppo-reno14-pro", seriesId: "oppo", label: "Oppo Reno 14 Pro (2025)", image: og("oppo-reno14-pro") },
      { id: "oppo-reno13-pro", seriesId: "oppo", label: "Oppo Reno 13 Pro (2025)", image: og("oppo-reno13-pro") },
      { id: "oppo-find-x8", seriesId: "oppo", label: "Oppo Find X8 (2024)", image: og("oppo-find-x8") },
      { id: "oppo-reno12", seriesId: "oppo", label: "Oppo Reno 12 (2024)", image: og("oppo-reno12") },
      { id: "oppo-find-x7", seriesId: "oppo", label: "Oppo Find X7 (2024)", image: og("oppo-find-x7") },
      { id: "oppo-reno11-pro", seriesId: "oppo", label: "Oppo Reno 11 Pro (2024)", image: og("oppo-reno11-pro") },
      { id: "oppo-reno10-pro-plus", seriesId: "oppo", label: "Oppo Reno 10 Pro+ (2023)", image: og("oppo-reno10-pro-plus") },
      { id: "oppo-reno8-pro", seriesId: "oppo", label: "Oppo Reno 8 Pro (2022)", image: og("oppo-reno8-pro") },
      { id: "oppo-find-x5-pro", seriesId: "oppo", label: "Oppo Find X5 Pro (2022)", image: og("oppo-find-x5-pro") },
      { id: "oppo-reno7-pro", seriesId: "oppo", label: "Oppo Reno 7 Pro (2021)", image: og("oppo-reno7-pro") },
      { id: "oppo-find-x3-pro", seriesId: "oppo", label: "Oppo Find X3 Pro (2021)", image: og("oppo-find-x3-pro") },
      { id: "oppo-reno6-pro", seriesId: "oppo", label: "Oppo Reno 6 Pro (2021)", image: og("oppo-reno6-pro") },
      { id: "oppo-reno5-pro", seriesId: "oppo", label: "Oppo Reno 5 Pro (2020)", image: og("oppo-reno5-pro") },
      { id: "oppo-reno4-pro", seriesId: "oppo", label: "Oppo Reno 4 Pro (2020)", image: og("oppo-reno4-pro") },
      { id: "oppo-find-x2-pro", seriesId: "oppo", label: "Oppo Find X2 Pro (2020)", image: og("oppo-find-x2-pro") },
      { id: "oppo-reno2", seriesId: "oppo", label: "Oppo Reno 2 (2019)", image: og("oppo-reno2") },
      { id: "oppo-reno", seriesId: "oppo", label: "Oppo Reno (2019)", image: og("oppo-reno") },
      { id: "oppo-f11-pro", seriesId: "oppo", label: "Oppo F11 Pro (2019)", image: og("oppo-f11-pro") },
      { id: "oppo-f9", seriesId: "oppo", label: "Oppo F9 (2018)", image: og("oppo-f9") },
      { id: "oppo-find-x", seriesId: "oppo", label: "Oppo Find X (2018)", image: og("oppo-find-x") },
      { id: "oppo-f7", seriesId: "oppo", label: "Oppo F7 (2018)", image: og("oppo-f7") },
      { id: "oppo-f5", seriesId: "oppo", label: "Oppo F5 (2017)", image: og("oppo-f5") },
      { id: "oppo-f3", seriesId: "oppo", label: "Oppo F3 (2017)", image: og("oppo-f3") },
      { id: "oppo-f1", seriesId: "oppo", label: "Oppo F1 (2016)", image: og("oppo-f1") },
      { id: "oppo-find-7", seriesId: "oppo", label: "Oppo Find 7 (2014)", image: og("oppo-find-7") },
      { id: "oppo-find-5", seriesId: "oppo", label: "Oppo Find 5 (2012)", image: og("oppo-find-5") },
      { id: "oppo-reno8", seriesId: "oppo", label: "Oppo Reno 8 (2022)", image: og("oppo-reno8") },
      { id: "oppo-f27", seriesId: "oppo", label: "Oppo F27 (2024)", image: og("oppo-f27") },
      { id: "oppo-f19", seriesId: "oppo", label: "Oppo F19 (2021)", image: og("oppo-f19") },
      { id: "oppo-a79", seriesId: "oppo", label: "Oppo A79 (2023)", image: og("oppo-a79") },
      // —— Nothing ——
      { id: "nothing-phone-4a", seriesId: "nothing", label: "Nothing Phone (4a) (2026)", image: og("nothing-phone-4a") },
      { id: "nothing-phone-3a-pro", seriesId: "nothing", label: "Nothing Phone (3a) Pro (2025)", image: og("nothing-phone-3a-pro") },
      { id: "nothing-phone-3a", seriesId: "nothing", label: "Nothing Phone (3a) (2025)", image: og("nothing-phone-3a") },
      { id: "nothing-phone-3", seriesId: "nothing", label: "Nothing Phone (3) (2025)", image: og("nothing-phone-3") },
      { id: "nothing-phone-2a-plus", seriesId: "nothing", label: "Nothing Phone (2a) Plus (2024)", image: og("nothing-phone-2a-plus") },
      { id: "nothing-phone-2a", seriesId: "nothing", label: "Nothing Phone (2a) (2024)", image: og("nothing-phone-2a") },
      { id: "nothing-phone-2", seriesId: "nothing", label: "Nothing Phone (2) (2023)", image: og("nothing-phone-2") },
      { id: "nothing-phone-1", seriesId: "nothing", label: "Nothing Phone (1) (2022)", image: og("nothing-phone-1") },
      // —— Xiaomi ——
      { id: "xiaomi-17-pro", seriesId: "xiaomi", label: "Xiaomi 17 Pro (2025)", image: og("xiaomi-17-pro") },
      { id: "xiaomi-17", seriesId: "xiaomi", label: "Xiaomi 17 (2025)", image: og("xiaomi-17") },
      { id: "xiaomi-15-ultra", seriesId: "xiaomi", label: "Xiaomi 15 Ultra (2025)", image: og("xiaomi-15-ultra") },
      { id: "xiaomi-15", seriesId: "xiaomi", label: "Xiaomi 15 (2024)", image: og("xiaomi-15") },
      { id: "xiaomi-14-ultra", seriesId: "xiaomi", label: "Xiaomi 14 Ultra (2024)", image: og("xiaomi-14-ultra") },
      { id: "xiaomi-14", seriesId: "xiaomi", label: "Xiaomi 14 (2023)", image: og("xiaomi-14") },
      { id: "xiaomi-13-pro", seriesId: "xiaomi", label: "Xiaomi 13 Pro (2022)", image: og("xiaomi-13-pro") },
      { id: "xiaomi-13", seriesId: "xiaomi", label: "Xiaomi 13 (2022)", image: og("xiaomi-13") },
      { id: "xiaomi-12-pro", seriesId: "xiaomi", label: "Xiaomi 12 Pro (2021)", image: og("xiaomi-12-pro") },
      { id: "xiaomi-12", seriesId: "xiaomi", label: "Xiaomi 12 (2021)", image: og("xiaomi-12") },
      { id: "mi-11", seriesId: "xiaomi", label: "Xiaomi Mi 11 (2020)", image: og("mi-11") },
      { id: "mi-10", seriesId: "xiaomi", label: "Xiaomi Mi 10 (2020)", image: og("mi-10") },
      { id: "mi-9", seriesId: "xiaomi", label: "Xiaomi Mi 9 (2019)", image: og("mi-9") },
      { id: "mi-8", seriesId: "xiaomi", label: "Xiaomi Mi 8 (2018)", image: og("mi-8") },
      { id: "mi-6", seriesId: "xiaomi", label: "Xiaomi Mi 6 (2017)", image: og("mi-6") },
      { id: "mi-5", seriesId: "xiaomi", label: "Xiaomi Mi 5 (2016)", image: og("mi-5") },
      { id: "mi-4", seriesId: "xiaomi", label: "Xiaomi Mi 4 (2014)", image: og("mi-4") },
      { id: "mi-3", seriesId: "xiaomi", label: "Xiaomi Mi 3 (2013)", image: og("mi-3") },
      // —— Redmi ——
      { id: "redmi-note-15-pro-plus", seriesId: "redmi", label: "Redmi Note 15 Pro+ (2025)", image: og("redmi-note-15-pro-plus") },
      { id: "redmi-note-14-pro-plus", seriesId: "redmi", label: "Redmi Note 14 Pro+ (2024)", image: og("redmi-note-14-pro-plus") },
      { id: "redmi-note-13-pro-plus", seriesId: "redmi", label: "Redmi Note 13 Pro+ (2024)", image: og("redmi-note-13-pro-plus") },
      { id: "redmi-note-12-pro-plus", seriesId: "redmi", label: "Redmi Note 12 Pro+ (2022)", image: og("redmi-note-12-pro-plus") },
      { id: "redmi-note-10-pro", seriesId: "redmi", label: "Redmi Note 10 Pro (2021)", image: og("redmi-note-10-pro") },
      { id: "redmi-note-9-pro", seriesId: "redmi", label: "Redmi Note 9 Pro (2020)", image: og("redmi-note-9-pro") },
      { id: "redmi-note-8-pro", seriesId: "redmi", label: "Redmi Note 8 Pro (2019)", image: og("redmi-note-8-pro") },
      { id: "redmi-note-7-pro", seriesId: "redmi", label: "Redmi Note 7 Pro (2019)", image: og("redmi-note-7-pro") },
      { id: "redmi-note-6-pro", seriesId: "redmi", label: "Redmi Note 6 Pro (2018)", image: og("redmi-note-6-pro") },
      { id: "redmi-note-5-pro", seriesId: "redmi", label: "Redmi Note 5 Pro (2018)", image: og("redmi-note-5-pro") },
      { id: "redmi-note-4", seriesId: "redmi", label: "Redmi Note 4 (2017)", image: og("redmi-note-4") },
      { id: "redmi-note-3", seriesId: "redmi", label: "Redmi Note 3 (2016)", image: og("redmi-note-3") },
      { id: "redmi-13", seriesId: "redmi", label: "Redmi 13 (2024)", image: og("redmi-13") },
      { id: "redmi-12", seriesId: "redmi", label: "Redmi 12 (2023)", image: og("redmi-12") },
      { id: "redmi-10", seriesId: "redmi", label: "Redmi 10 (2021)", image: og("redmi-10") },
      { id: "redmi-9", seriesId: "redmi", label: "Redmi 9 (2020)", image: og("redmi-9") },
      { id: "redmi-3s", seriesId: "redmi", label: "Redmi 3S (2016)", image: og("redmi-3s") },
      { id: "redmi-2", seriesId: "redmi", label: "Redmi 2 (2015)", image: og("redmi-2") },
      { id: "redmi-note-13-pro", seriesId: "redmi", label: "Redmi Note 13 Pro (2024)", image: og("redmi-note-13-pro") },
      { id: "redmi-note-7", seriesId: "redmi", label: "Redmi Note 7 (2019)", image: og("redmi-note-7") },
      // —— Realme ——
      { id: "realme-14-pro-plus", seriesId: "realme", label: "Realme 14 Pro+ (2025)", image: og("realme-14-pro-plus") },
      { id: "realme-gt7", seriesId: "realme", label: "Realme GT 7 (2025)", image: og("realme-gt7") },
      { id: "realme-p3", seriesId: "realme", label: "Realme P3 (2025)", image: og("realme-p3") },
      { id: "realme-13-pro-plus", seriesId: "realme", label: "Realme 13 Pro+ (2024)", image: og("realme-13-pro-plus") },
      { id: "realme-gt-6", seriesId: "realme", label: "Realme GT 6 (2024)", image: og("realme-gt-6") },
      { id: "realme-gt5", seriesId: "realme", label: "Realme GT 5 (2023)", image: og("realme-gt5") },
      { id: "realme-gt3", seriesId: "realme", label: "Realme GT 3 (2023)", image: og("realme-gt3") },
      { id: "realme-p1", seriesId: "realme", label: "Realme P1 (2024)", image: og("realme-p1") },
      { id: "realme-12-pro-plus", seriesId: "realme", label: "Realme 12 Pro+ (2024)", image: og("realme-12-pro-plus") },
      { id: "realme-11-pro-plus", seriesId: "realme", label: "Realme 11 Pro+ (2023)", image: og("realme-11-pro-plus") },
      { id: "realme-10-pro-plus", seriesId: "realme", label: "Realme 10 Pro+ (2022)", image: og("realme-10-pro-plus") },
      { id: "realme-9-pro-plus", seriesId: "realme", label: "Realme 9 Pro+ (2022)", image: og("realme-9-pro-plus") },
      { id: "realme-gt2-pro", seriesId: "realme", label: "Realme GT 2 Pro (2022)", image: og("realme-gt2-pro") },
      { id: "realme-8-pro", seriesId: "realme", label: "Realme 8 Pro (2021)", image: og("realme-8-pro") },
      { id: "realme-gt", seriesId: "realme", label: "Realme GT (2021)", image: og("realme-gt") },
      { id: "realme-7-pro", seriesId: "realme", label: "Realme 7 Pro (2020)", image: og("realme-7-pro") },
      { id: "realme-7", seriesId: "realme", label: "Realme 7 (2020)", image: og("realme-7") },
      { id: "realme-6-pro", seriesId: "realme", label: "Realme 6 Pro (2020)", image: og("realme-6-pro") },
      { id: "realme-2-pro", seriesId: "realme", label: "Realme 2 Pro (2018)", image: og("realme-2-pro") },
      { id: "realme-1", seriesId: "realme", label: "Realme 1 (2018)", image: og("realme-1") },
      { id: "realme-12-pro", seriesId: "realme", label: "Realme 12 Pro (2024)", image: og("realme-12-pro") },
      { id: "realme-narzo-70", seriesId: "realme", label: "Realme Narzo 70 (2024)", image: og("realme-narzo-70") },
      { id: "realme-c67", seriesId: "realme", label: "Realme C67 (2023)", image: og("realme-c67") },
      { id: "realme-8", seriesId: "realme", label: "Realme 8 (2021)", image: og("realme-8") },
      // —— Motorola ——
      { id: "moto-edge-70-fusion", seriesId: "motorola", label: "Motorola Edge 70 Fusion (2026)", image: og("moto-edge-70-fusion") },
      { id: "moto-razr-60", seriesId: "motorola", label: "Motorola Razr 60 (2025)", image: og("moto-razr-60") },
      { id: "moto-edge-60", seriesId: "motorola", label: "Motorola Edge 60 (2025)", image: og("moto-edge-60") },
      { id: "moto-g86", seriesId: "motorola", label: "Moto G86 (2025)", image: og("moto-g86") },
      { id: "moto-razr-50", seriesId: "motorola", label: "Motorola Razr 50 (2024)", image: og("moto-razr-50") },
      { id: "moto-g85", seriesId: "motorola", label: "Moto G85 (2024)", image: og("moto-g85") },
      { id: "moto-edge-50", seriesId: "motorola", label: "Motorola Edge 50 (2024)", image: og("moto-edge-50") },
      { id: "moto-razr-40", seriesId: "motorola", label: "Motorola Razr 40 (2023)", image: og("moto-razr-40") },
      { id: "moto-g84", seriesId: "motorola", label: "Moto G84 (2023)", image: og("moto-g84") },
      { id: "moto-g54", seriesId: "motorola", label: "Moto G54 (2023)", image: og("moto-g54") },
      { id: "moto-edge-40", seriesId: "motorola", label: "Motorola Edge 40 (2023)", image: og("moto-edge-40") },
      { id: "moto-g52", seriesId: "motorola", label: "Moto G52 (2022)", image: og("moto-g52") },
      { id: "moto-edge-30", seriesId: "motorola", label: "Motorola Edge 30 (2022)", image: og("moto-edge-30") },
      { id: "moto-g40-fusion", seriesId: "motorola", label: "Moto G40 Fusion (2021)", image: og("moto-g40-fusion") },
      { id: "moto-edge-20", seriesId: "motorola", label: "Motorola Edge 20 (2021)", image: og("moto-edge-20") },
      { id: "moto-g9", seriesId: "motorola", label: "Moto G9 (2020)", image: og("moto-g9") },
      { id: "moto-g8", seriesId: "motorola", label: "Moto G8 (2019)", image: og("moto-g8") },
      { id: "moto-g7", seriesId: "motorola", label: "Moto G7 (2019)", image: og("moto-g7") },
      { id: "moto-g6", seriesId: "motorola", label: "Moto G6 (2018)", image: og("moto-g6") },
      { id: "moto-g5-plus", seriesId: "motorola", label: "Moto G5 Plus (2017)", image: og("moto-g5-plus") },
      { id: "moto-g4", seriesId: "motorola", label: "Moto G4 (2016)", image: og("moto-g4") },
      { id: "moto-g3", seriesId: "motorola", label: "Moto G3 (2015)", image: og("moto-g3") },
      { id: "moto-g2", seriesId: "motorola", label: "Moto G2 (2014)", image: og("moto-g2") },
      { id: "moto-g", seriesId: "motorola", label: "Motorola Moto G (2013)", image: og("moto-g") },
      { id: "moto-razr-2019", seriesId: "motorola", label: "Motorola Razr 2019", image: og("moto-razr-2019") },
      { id: "moto-g82", seriesId: "motorola", label: "Moto G82 (2022)", image: og("moto-g82") },
      // —— iQOO ——
      { id: "iqoo-z9", seriesId: "iqoo", label: "iQOO Z9 (2024)", image: og("iqoo-z9") },
      { id: "iqoo-z7", seriesId: "iqoo", label: "iQOO Z7 (2023)", image: og("iqoo-z7") },
      { id: "iqoo-neo-9", seriesId: "iqoo", label: "iQOO Neo 9 (2023)", image: og("iqoo-neo-9") },
      // —— POCO ——
      { id: "poco-f7", seriesId: "poco", label: "POCO F7 (2025)", image: og("poco-f7") },
      { id: "poco-x7-pro", seriesId: "poco", label: "POCO X7 Pro (2025)", image: og("poco-x7-pro") },
      { id: "poco-f6", seriesId: "poco", label: "POCO F6 (2024)", image: og("poco-f6") },
      { id: "poco-x6-pro", seriesId: "poco", label: "POCO X6 Pro (2024)", image: og("poco-x6-pro") },
      { id: "poco-f5", seriesId: "poco", label: "POCO F5 (2023)", image: og("poco-f5") },
      { id: "poco-x5-pro", seriesId: "poco", label: "POCO X5 Pro (2023)", image: og("poco-x5-pro") },
      { id: "poco-f4", seriesId: "poco", label: "POCO F4 (2022)", image: og("poco-f4") },
      { id: "poco-x4-pro", seriesId: "poco", label: "POCO X4 Pro (2022)", image: og("poco-x4-pro") },
      { id: "poco-c55", seriesId: "poco", label: "POCO C55 (2023)", image: og("poco-c55") },
      { id: "poco-m5", seriesId: "poco", label: "POCO M5 (2022)", image: og("poco-m5") },
      { id: "poco-f3", seriesId: "poco", label: "POCO F3 (2021)", image: og("poco-f3") },
      { id: "poco-x3-pro", seriesId: "poco", label: "POCO X3 Pro (2021)", image: og("poco-x3-pro") },
      { id: "poco-m4-pro", seriesId: "poco", label: "POCO M4 Pro (2021)", image: og("poco-m4-pro") },
      { id: "poco-f2-pro", seriesId: "poco", label: "POCO F2 Pro (2020)", image: og("poco-f2-pro") },
      { id: "poco-x3", seriesId: "poco", label: "POCO X3 (2020)", image: og("poco-x3") },
      { id: "poco-x2", seriesId: "poco", label: "POCO X2 (2020)", image: og("poco-x2") },
      { id: "poco-c3", seriesId: "poco", label: "POCO C3 (2020)", image: og("poco-c3") },
      { id: "poco-f1", seriesId: "poco", label: "POCO F1 (2018)", image: og("poco-f1") },
      { id: "poco-x6", seriesId: "poco", label: "POCO X6 (2024)", image: og("poco-x6") },
      // —— Nokia ——
      { id: "nokia-g42", seriesId: "nokia", label: "Nokia G42", image: og("nokia-g42") },
      // —— Infinix ——
      { id: "infinix-gt-20-pro", seriesId: "infinix", label: "Infinix GT 20 Pro (2024)", image: og("infinix-gt-20-pro") },
      { id: "infinix-note-40", seriesId: "infinix", label: "Infinix Note 40 (2024)", image: og("infinix-note-40") },
      { id: "infinix-hot-40", seriesId: "infinix", label: "Infinix Hot 40 (2023)", image: og("infinix-hot-40") },
      { id: "infinix-gt-10-pro", seriesId: "infinix", label: "Infinix GT 10 Pro (2023)", image: og("infinix-gt-10-pro") },
      { id: "infinix-note-30", seriesId: "infinix", label: "Infinix Note 30 (2023)", image: og("infinix-note-30") },
      { id: "infinix-hot-30", seriesId: "infinix", label: "Infinix Hot 30 (2023)", image: og("infinix-hot-30") },
      { id: "infinix-hot-20", seriesId: "infinix", label: "Infinix Hot 20 (2022)", image: og("infinix-hot-20") },
      { id: "infinix-note-12", seriesId: "infinix", label: "Infinix Note 12 (2022)", image: og("infinix-note-12") },
      { id: "infinix-hot-12", seriesId: "infinix", label: "Infinix Hot 12 (2022)", image: og("infinix-hot-12") },
      { id: "infinix-note-10-pro", seriesId: "infinix", label: "Infinix Note 10 Pro (2021)", image: og("infinix-note-10-pro") },
      { id: "infinix-hot-10", seriesId: "infinix", label: "Infinix Hot 10 (2020)", image: og("infinix-hot-10") },
      { id: "infinix-hot-8", seriesId: "infinix", label: "Infinix Hot 8 (2019)", image: og("infinix-hot-8") },
      // —— Others: Huawei ——
      { id: "huawei-p40-pro", seriesId: "others", label: "Huawei P40 Pro (2020)", image: og("huawei-p40-pro") },
      { id: "huawei-mate-30-pro", seriesId: "others", label: "Huawei Mate 30 Pro (2019)", image: og("huawei-mate-30-pro") },
      { id: "huawei-p30-pro", seriesId: "others", label: "Huawei P30 Pro (2019)", image: og("huawei-p30-pro") },
      { id: "huawei-mate-20-pro", seriesId: "others", label: "Huawei Mate 20 Pro (2018)", image: og("huawei-mate-20-pro") },
      { id: "huawei-p20-pro", seriesId: "others", label: "Huawei P20 Pro (2018)", image: og("huawei-p20-pro") },
      { id: "huawei-p10", seriesId: "others", label: "Huawei P10 (2017)", image: og("huawei-p10") },
      { id: "huawei-p9", seriesId: "others", label: "Huawei P9 (2016)", image: og("huawei-p9") },
      { id: "huawei-p8", seriesId: "others", label: "Huawei P8 (2015)", image: og("huawei-p8") },
      { id: "huawei-p7", seriesId: "others", label: "Huawei Ascend P7 (2014)", image: og("huawei-p7") },
      // —— Others: Honor ——
      { id: "honor-400", seriesId: "others", label: "Honor 400 (2025)", image: og("honor-400") },
      { id: "honor-200", seriesId: "others", label: "Honor 200 (2024)", image: og("honor-200") },
      { id: "honor-90", seriesId: "others", label: "Honor 90 (2023)", image: og("honor-90") },
      { id: "honor-x9b", seriesId: "others", label: "Honor X9b (2023)", image: og("honor-x9b") },
      { id: "honor-50", seriesId: "others", label: "Honor 50 (2021)", image: og("honor-50") },
      { id: "honor-30", seriesId: "others", label: "Honor 30 (2020)", image: og("honor-30") },
      { id: "honor-20", seriesId: "others", label: "Honor 20 (2019)", image: og("honor-20") },
      { id: "honor-10", seriesId: "others", label: "Honor 10 (2018)", image: og("honor-10") },
      { id: "honor-9", seriesId: "others", label: "Honor 9 (2017)", image: og("honor-9") },
      { id: "honor-8", seriesId: "others", label: "Honor 8 (2016)", image: og("honor-8") },
      // —— Others: Sony ——
      { id: "xperia-1-vi", seriesId: "others", label: "Sony Xperia 1 VI (2024)", image: og("xperia-1-vi") },
      { id: "xperia-1-v", seriesId: "others", label: "Sony Xperia 1 V (2023)", image: og("xperia-1-v") },
      { id: "xperia-1-iii", seriesId: "others", label: "Sony Xperia 1 III (2021)", image: og("xperia-1-iii") },
      { id: "xperia-1-ii", seriesId: "others", label: "Sony Xperia 1 II (2020)", image: og("xperia-1-ii") },
      { id: "xperia-1", seriesId: "others", label: "Sony Xperia 1 (2019)", image: og("xperia-1") },
      { id: "xperia-xz-premium", seriesId: "others", label: "Sony Xperia XZ Premium (2017)", image: og("xperia-xz-premium") },
      { id: "xperia-xz", seriesId: "others", label: "Sony Xperia XZ (2016)", image: og("xperia-xz") },
      { id: "xperia-z3", seriesId: "others", label: "Sony Xperia Z3 (2014)", image: og("xperia-z3") },
      { id: "xperia-z1", seriesId: "others", label: "Sony Xperia Z1 (2013)", image: og("xperia-z1") },
      { id: "xperia-z", seriesId: "others", label: "Sony Xperia Z (2013)", image: og("xperia-z") },
      // —— Others: Asus ——
      { id: "rog-phone-9", seriesId: "others", label: "Asus ROG Phone 9 (2025)", image: og("rog-phone-9") },
      { id: "rog-phone-8", seriesId: "others", label: "Asus ROG Phone 8 (2024)", image: og("rog-phone-8") },
      { id: "rog-phone-7", seriesId: "others", label: "Asus ROG Phone 7 (2023)", image: og("rog-phone-7") },
      { id: "rog-phone-6", seriesId: "others", label: "Asus ROG Phone 6 (2022)", image: og("rog-phone-6") },
      { id: "rog-phone-5", seriesId: "others", label: "Asus ROG Phone 5 (2021)", image: og("rog-phone-5") },
      { id: "rog-phone-3", seriesId: "others", label: "Asus ROG Phone 3 (2020)", image: og("rog-phone-3") },
      { id: "rog-phone-2", seriesId: "others", label: "Asus ROG Phone II (2019)", image: og("rog-phone-2") },
      { id: "rog-phone", seriesId: "others", label: "Asus ROG Phone (2018)", image: og("rog-phone") },
      { id: "zenfone-5z", seriesId: "others", label: "Asus ZenFone 5Z (2018)", image: og("zenfone-5z") },
      { id: "zenfone-3", seriesId: "others", label: "Asus ZenFone 3 (2016)", image: og("zenfone-3") },
      { id: "zenfone-2", seriesId: "others", label: "Asus ZenFone 2 (2015)", image: og("zenfone-2") },
      // —— Others: HTC ——
      { id: "htc-u12-plus", seriesId: "others", label: "HTC U12+ (2018)", image: og("htc-u12-plus") },
      { id: "htc-u11", seriesId: "others", label: "HTC U11 (2017)", image: og("htc-u11") },
      { id: "htc-10", seriesId: "others", label: "HTC 10 (2016)", image: og("htc-10") },
      { id: "htc-one-m9", seriesId: "others", label: "HTC One M9 (2015)", image: og("htc-one-m9") },
      { id: "htc-one-m8", seriesId: "others", label: "HTC One M8 (2014)", image: og("htc-one-m8") },
      { id: "htc-one-m7", seriesId: "others", label: "HTC One M7 (2013)", image: og("htc-one-m7") },
      { id: "htc-one-x", seriesId: "others", label: "HTC One X (2012)", image: og("htc-one-x") },
      // —— Others: LG ——
      { id: "lg-wing", seriesId: "others", label: "LG Wing (2020)", image: og("lg-wing") },
      { id: "lg-v40", seriesId: "others", label: "LG V40 ThinQ (2018)", image: og("lg-v40") },
      { id: "lg-g7", seriesId: "others", label: "LG G7 ThinQ (2018)", image: og("lg-g7") },
      { id: "lg-v30", seriesId: "others", label: "LG V30 (2017)", image: og("lg-v30") },
      { id: "lg-g6", seriesId: "others", label: "LG G6 (2017)", image: og("lg-g6") },
      { id: "lg-v20", seriesId: "others", label: "LG V20 (2016)", image: og("lg-v20") },
      { id: "lg-g5", seriesId: "others", label: "LG G5 (2016)", image: og("lg-g5") },
      { id: "lg-g4", seriesId: "others", label: "LG G4 (2015)", image: og("lg-g4") },
      { id: "lg-g3", seriesId: "others", label: "LG G3 (2014)", image: og("lg-g3") },
      { id: "lg-g2", seriesId: "others", label: "LG G2 (2013)", image: og("lg-g2") },
      // —— Others: Tecno ——
      { id: "tecno-camon-40", seriesId: "others", label: "Tecno Camon 40 (2025)", image: og("tecno-camon-40") },
      { id: "tecno-camon-30", seriesId: "others", label: "Tecno Camon 30 (2024)", image: og("tecno-camon-30") },
      { id: "tecno-pova-6", seriesId: "others", label: "Tecno Pova 6 (2024)", image: og("tecno-pova-6") },
      { id: "tecno-camon-20", seriesId: "others", label: "Tecno Camon 20 (2023)", image: og("tecno-camon-20") },
      { id: "tecno-phantom-v-fold", seriesId: "others", label: "Tecno Phantom V Fold (2023)", image: og("tecno-phantom-v-fold") },
      { id: "tecno-pova-5", seriesId: "others", label: "Tecno Pova 5 (2023)", image: og("tecno-pova-5") },
      { id: "tecno-spark-20", seriesId: "others", label: "Tecno Spark 20", image: og("tecno-spark-20") },
      { id: "tecno-phantom-x2", seriesId: "others", label: "Tecno Phantom X2 (2022)", image: og("tecno-phantom-x2") },
      { id: "tecno-camon-18", seriesId: "others", label: "Tecno Camon 18 (2021)", image: og("tecno-camon-18") },
      { id: "tecno-phantom-x", seriesId: "others", label: "Tecno Phantom X (2021)", image: og("tecno-phantom-x") },
      { id: "tecno-camon-15", seriesId: "others", label: "Tecno Camon 15 (2020)", image: og("tecno-camon-15") },
      { id: "tecno-camon-12", seriesId: "others", label: "Tecno Camon 12 (2019)", image: og("tecno-camon-12") },
      // —— Others: Lava ——
      { id: "lava-agni-3", seriesId: "others", label: "Lava Agni 3 (2024)", image: og("lava-agni-3") },
      { id: "lava-agni-2", seriesId: "others", label: "Lava Agni 2 (2023)", image: og("lava-agni-2") },
      { id: "lava-blaze-2", seriesId: "others", label: "Lava Blaze 2 (2023)", image: og("lava-blaze-2") },
      { id: "lava-blaze", seriesId: "others", label: "Lava Blaze (2022)", image: og("lava-blaze") },
      { id: "lava-agni", seriesId: "others", label: "Lava Agni (2021)", image: og("lava-agni") },
      { id: "lava-z25", seriesId: "others", label: "Lava Z25", image: og("lava-z25") },
      { id: "lava-z10", seriesId: "others", label: "Lava Z10", image: og("lava-z10") },
      // —— Others: Microsoft ——
      { id: "lumia-950", seriesId: "others", label: "Microsoft Lumia 950 (2015)", image: og("lumia-950") },
      { id: "lumia-640", seriesId: "others", label: "Microsoft Lumia 640 (2015)", image: og("lumia-640") },
      { id: "lumia-535", seriesId: "others", label: "Microsoft Lumia 535 (2014)", image: og("lumia-535") },
      // —— Others: Nexus legacy ——
      { id: "nexus-6p", seriesId: "others", label: "Nexus 6P (2015)", image: og("nexus-6p") },
      { id: "nexus-5x", seriesId: "others", label: "Nexus 5X (2015)", image: og("nexus-5x") },
      { id: "nexus-6", seriesId: "others", label: "Nexus 6 (2014)", image: og("nexus-6") },
      { id: "nexus-5", seriesId: "others", label: "Nexus 5 (2013)", image: og("nexus-5") },
      { id: "nexus-4", seriesId: "others", label: "Nexus 4 (2012)", image: og("nexus-4") },
    ],
  },
  {
    id: "laptop",
    label: "Laptop",
    deviceType: "macbook",
    series: [
      { id: "apple", label: "Apple", brand: "Apple", image: og("mba-m3-15") },
      { id: "dell", label: "Dell", brand: "Dell", image: og("dell-xps-13") },
      { id: "lenovo", label: "Lenovo", brand: "Lenovo", image: og("lenovo-thinkpad-x1") },
      { id: "asus", label: "Asus", brand: "Asus", image: og("asus-zenbook-14") },
      { id: "lg", label: "LG", brand: "LG", image: og("lg-gram") },
    ],
    models: [
      { id: "mba-m3-15", seriesId: "apple", label: "MacBook Air 15\" M3 (2024)", image: og("mba-m3-15") },
      { id: "mba-m2", seriesId: "apple", label: "MacBook Air 13\" M2 (2022)", image: og("mba-m2") },
      { id: "mba-m1", seriesId: "apple", label: "MacBook Air 13\" M1 (2020)", image: og("mba-m1") },
      { id: "mba-2018", seriesId: "apple", label: "MacBook Air 13\" Retina (2018)", image: og("mba-2018") },
      { id: "mbp-14-2021", seriesId: "apple", label: "MacBook Pro 14\" (2021)", image: og("mbp-14-2021") },
      { id: "mbp-16-2019", seriesId: "apple", label: "MacBook Pro 16\" (2019)", image: og("mbp-16-2019") },
      { id: "mbp-2006", seriesId: "apple", label: "MacBook Pro 15\" (2006)", image: og("mbp-2006") },
      { id: "dell-xps-13", seriesId: "dell", label: "Dell XPS 13", image: og("dell-xps-13") },
      { id: "dell-xps-15", seriesId: "dell", label: "Dell XPS 15", image: og("dell-xps-15") },
      { id: "lenovo-thinkpad-x1", seriesId: "lenovo", label: "ThinkPad X1 Carbon", image: og("lenovo-thinkpad-x1") },
      { id: "asus-zenbook-14", seriesId: "asus", label: "Asus Zenbook", image: og("asus-zenbook-14") },
      { id: "lg-gram", seriesId: "lg", label: "LG gram (2014)", image: og("lg-gram") },
    ],
  },
  {
    id: "ipad",
    label: "iPad",
    deviceType: "tablet",
    series: [
      { id: "ipad", label: "iPad", brand: "Apple", image: og("ipad-10") },
      { id: "ipad-air", label: "iPad Air", brand: "Apple", image: og("ipad-air-m2") },
      { id: "ipad-pro", label: "iPad Pro", brand: "Apple", image: og("ipad-pro-m4") },
      { id: "ipad-mini", label: "iPad mini", brand: "Apple", image: og("ipad-mini-6") },
    ],
    models: [
      { id: "ipad-10", seriesId: "ipad", label: "iPad (10th gen, 2022)", image: og("ipad-10") },
      { id: "ipad-9", seriesId: "ipad", label: "iPad (9th gen, 2021)", image: og("ipad-9") },
      { id: "ipad-6", seriesId: "ipad", label: "iPad (6th gen, 2018)", image: og("ipad-6") },
      { id: "ipad-3", seriesId: "ipad", label: "iPad (3rd gen, 2012)", image: og("ipad-3") },
      { id: "ipad-2", seriesId: "ipad", label: "iPad 2 (2011)", image: og("ipad-2") },
      { id: "ipad-1", seriesId: "ipad", label: "iPad (1st gen, 2010)", image: og("ipad-1") },
      { id: "ipad-air-m2", seriesId: "ipad-air", label: "iPad Air M2 (2024)", image: og("ipad-air-m2") },
      { id: "ipad-air-5", seriesId: "ipad-air", label: "iPad Air (5th gen, 2022)", image: og("ipad-air-5") },
      { id: "ipad-air-4", seriesId: "ipad-air", label: "iPad Air (4th gen, 2020)", image: og("ipad-air-4") },
      { id: "ipad-air-2", seriesId: "ipad-air", label: "iPad Air 2 (2014)", image: og("ipad-air-2") },
      { id: "ipad-air-1", seriesId: "ipad-air", label: "iPad Air (1st gen, 2013)", image: og("ipad-air-1") },
      { id: "ipad-pro-m4", seriesId: "ipad-pro", label: "iPad Pro M4 (2024)", image: og("ipad-pro-m4") },
      { id: "ipad-pro-2022", seriesId: "ipad-pro", label: "iPad Pro M2 (2022)", image: og("ipad-pro-2022") },
      { id: "ipad-pro-2021", seriesId: "ipad-pro", label: "iPad Pro M1 (2021)", image: og("ipad-pro-2021") },
      { id: "ipad-pro-2018", seriesId: "ipad-pro", label: "iPad Pro 11\" (2018)", image: og("ipad-pro-2018") },
      { id: "ipad-pro-2017", seriesId: "ipad-pro", label: "iPad Pro 10.5\" (2017)", image: og("ipad-pro-2017") },
      { id: "ipad-pro-2015", seriesId: "ipad-pro", label: "iPad Pro 12.9\" (2015)", image: og("ipad-pro-2015") },
      { id: "ipad-mini-7", seriesId: "ipad-mini", label: "iPad mini (7th gen, 2024)", image: og("ipad-mini-7") },
      { id: "ipad-mini-6", seriesId: "ipad-mini", label: "iPad mini (6th gen, 2021)", image: og("ipad-mini-6") },
      { id: "ipad-mini-5", seriesId: "ipad-mini", label: "iPad mini (5th gen, 2019)", image: og("ipad-mini-5") },
      { id: "ipad-mini-4", seriesId: "ipad-mini", label: "iPad mini 4 (2015)", image: og("ipad-mini-4") },
      { id: "ipad-mini-3", seriesId: "ipad-mini", label: "iPad mini 3 (2014)", image: og("ipad-mini-3") },
      { id: "ipad-mini-2", seriesId: "ipad-mini", label: "iPad mini 2 (2013)", image: og("ipad-mini-2") },
      { id: "ipad-mini-1", seriesId: "ipad-mini", label: "iPad mini (1st gen, 2012)", image: og("ipad-mini-1") },
    ],
  },
  {
    id: "smartwatch",
    label: "Watch",
    deviceType: "smartwatch",
    series: [
      { id: "apple-watch", label: "Apple Watch", brand: "Apple", image: og("aw-ultra2") },
      { id: "galaxy-watch", label: "Galaxy Watch", brand: "Samsung", image: og("gw-7") },
      { id: "pixel-watch", label: "Pixel Watch", brand: "Google", image: og("pixel-watch") },
    ],
    models: [
      { id: "aw-ultra2", seriesId: "apple-watch", label: "Apple Watch Ultra 2 (2023)", image: og("aw-ultra2") },
      { id: "aw-ultra", seriesId: "apple-watch", label: "Apple Watch Ultra (2022)", image: og("aw-ultra") },
      { id: "aw-s8", seriesId: "apple-watch", label: "Apple Watch Series 8 (2022)", image: og("aw-s8") },
      { id: "aw-s7", seriesId: "apple-watch", label: "Apple Watch Series 7 (2021)", image: og("aw-s7") },
      { id: "aw-s6", seriesId: "apple-watch", label: "Apple Watch Series 6 (2020)", image: og("aw-s6") },
      { id: "aw-s5", seriesId: "apple-watch", label: "Apple Watch Series 5 (2019)", image: og("aw-s5") },
      { id: "aw-se", seriesId: "apple-watch", label: "Apple Watch SE (2020)", image: og("aw-se") },
      { id: "gw-7", seriesId: "galaxy-watch", label: "Galaxy Watch 7 (2024)", image: og("gw-7") },
      { id: "gw-6", seriesId: "galaxy-watch", label: "Galaxy Watch 6 (2023)", image: og("gw-6") },
      { id: "gw-5", seriesId: "galaxy-watch", label: "Galaxy Watch 5 (2022)", image: og("gw-5") },
      { id: "gw-4", seriesId: "galaxy-watch", label: "Galaxy Watch 4 (2021)", image: og("gw-4") },
      { id: "gw-4-classic", seriesId: "galaxy-watch", label: "Galaxy Watch 4 Classic (2021)", image: og("gw-4-classic") },
      { id: "gw-3", seriesId: "galaxy-watch", label: "Galaxy Watch 3 (2020)", image: og("gw-3") },
      { id: "gw-active2", seriesId: "galaxy-watch", label: "Galaxy Watch Active2 (2019)", image: og("gw-active2") },
      { id: "gw-active", seriesId: "galaxy-watch", label: "Galaxy Watch Active (2019)", image: og("gw-active") },
      { id: "pixel-watch-2", seriesId: "pixel-watch", label: "Pixel Watch 2 (2023)", image: og("pixel-watch-2") },
      { id: "pixel-watch", seriesId: "pixel-watch", label: "Pixel Watch (2022)", image: og("pixel-watch") },
    ],
  },
];

export function getFixCategory(
  id: string | null | undefined,
  categories: FixCategory[] = FIX_CATEGORIES
): FixCategory {
  const raw = (id || "").toLowerCase();
  const list = categories.length ? categories : FIX_CATEGORIES;
  if (raw === "macbook") {
    return list.find((c) => c.id === "laptop") || list[0];
  }
  const found = list.find((c) => c.id === raw || c.deviceType === raw);
  return found || list[0];
}

export function getSeries(
  category: FixCategory,
  seriesId: string | null | undefined
): FixSeries {
  const sid = (seriesId || "").toLowerCase();
  if (category.id === "laptop") {
    if (sid === "air" || sid === "pro") {
      return category.series.find((s) => s.id === "apple") || category.series[0];
    }
  }
  return (
    category.series.find((s) => s.id === seriesId) ||
    category.series[0] || {
      id: "",
      label: "",
      brand: "",
      image: "",
    }
  );
}

export function modelsForSeries(
  category: FixCategory,
  seriesId: string
): FixModel[] {
  return category.models.filter((m) => m.seriesId === seriesId);
}

export type FixSearchHit = {
  categoryId: FixCategoryId;
  categoryLabel: string;
  series: FixSeries;
  model: FixModel;
};

export function searchFixModels(
  query: string,
  categoryId: FixCategoryId,
  categories: FixCategory[] = FIX_CATEGORIES
): FixSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: FixSearchHit[] = [];
  const cats = (categories.length ? categories : FIX_CATEGORIES).filter(
    (c) => c.id === categoryId
  );
  for (const cat of cats) {
    for (const model of cat.models) {
      const series = cat.series.find((s) => s.id === model.seriesId);
      if (!series) continue;
      const hay = [model.label, model.id, series.label, series.brand, cat.label]
        .join(" ")
        .toLowerCase();
      if (hay.includes(q)) {
        hits.push({
          categoryId: cat.id,
          categoryLabel: cat.label,
          series,
          model,
        });
      }
    }
  }
  return hits;
}

const SELL_BRAND_SERIES: Record<string, string[]> = {
  Apple: ["iphone"],
  Samsung: ["samsung"],
  Google: ["pixel", "others"],
  OnePlus: ["oneplus"],
  Xiaomi: ["xiaomi", "redmi"],
  Vivo: ["vivo"],
  Oppo: ["oppo"],
  Realme: ["realme"],
  Motorola: ["motorola"],
  Nothing: ["nothing"],
  iQOO: ["iqoo"],
  Poco: ["poco"],
  Nokia: ["nokia"],
  Honor: ["others"],
  Huawei: ["others"],
  Asus: ["others"],
  Sony: ["others"],
  HTC: ["others"],
  LG: ["others"],
  Tecno: ["others"],
  Infinix: ["infinix"],
  Lava: ["others"],
  Microsoft: ["others"],
  Other: ["others"],
};

const SELL_BRAND_ID_PREFIX: Record<string, string[]> = {
  Honor: ["honor"],
  Huawei: ["huawei"],
  Asus: ["zenfone", "rog-phone"],
  Sony: ["xperia"],
  HTC: ["htc"],
  LG: ["lg-"],
  Tecno: ["tecno"],
  Lava: ["lava"],
  Microsoft: ["lumia"],
  Google: ["pixel", "nexus"],
};

export function sellPhoneModelsForBrand(
  brand: string,
  categories: FixCategory[] = FIX_CATEGORIES
): string[] {
  const phones = (categories.length ? categories : FIX_CATEGORIES).find(
    (c) => c.id === "phone"
  );
  if (!phones) return ["Other / not listed"];
  const brandLc = brand.toLowerCase();
  const seriesIds = SELL_BRAND_SERIES[brand] || [];
  let models = phones.models.filter((m) => {
    const series = phones.series.find((s) => s.id === m.seriesId);
    if (series && series.brand.toLowerCase() === brandLc) return true;
    return seriesIds.includes(m.seriesId);
  });
  const prefixes = SELL_BRAND_ID_PREFIX[brand];
  if (prefixes) {
    models = models.filter((m) =>
      prefixes.some((p) => m.id.startsWith(p))
    );
  }
  const labels = models.map((m) => m.label);
  return [...labels, "Other / not listed"];
}

export function brandsForDeviceType(
  deviceType: string,
  categories: FixCategory[] = FIX_CATEGORIES
): string[] {
  const category = getFixCategory(deviceType, categories);
  if (category.id === "phone") {
    const fromSeries = [...new Set(category.series.map((s) => s.brand))];
    const merged: string[] = [...PHONE_BRANDS];
    for (const b of fromSeries) {
      if (!merged.includes(b)) merged.push(b);
    }
    return merged.includes("Other") ? merged : [...merged, "Other"];
  }
  const brands = [...new Set(category.series.map((s) => s.brand))];
  return brands.length ? [...brands, "Other"] : ["Other"];
}

export function repairModelsForDevice(
  deviceType: string,
  brand: string,
  categories: FixCategory[] = FIX_CATEGORIES
): string[] {
  const category = getFixCategory(deviceType, categories);
  if (category.id === "phone") return sellPhoneModelsForBrand(brand, categories);
  const brandLc = (brand || "").toLowerCase();
  const labels = category.models
    .filter((m) => {
      const series = category.series.find((s) => s.id === m.seriesId);
      return !series || series.brand.toLowerCase() === brandLc;
    })
    .map((m) => m.label);
  return labels.length ? [...labels, "Other / not listed"] : ["Other / not listed"];
}

export function modelImage(_category: FixCategory, model: FixModel): string {
  return model.image;
}

export function resolveFromQuery(
  opts: {
    deviceType?: string | null;
    series?: string | null;
    brand?: string | null;
  },
  categories: FixCategory[] = FIX_CATEGORIES
): { categoryId: FixCategoryId; seriesId: string } {
  const raw = (opts.deviceType || "phone").toLowerCase();
  let categoryId: FixCategoryId = "phone";
  if (raw === "macbook" || raw.includes("laptop")) categoryId = "laptop";
  else if (raw === "tablet" || raw === "ipad") categoryId = "ipad";
  else if (raw.includes("watch")) categoryId = "smartwatch";

  const category = getFixCategory(categoryId, categories);
  const seriesParam = (opts.series || "").toLowerCase();
  const brandParam = (opts.brand || "").toLowerCase();

  if (seriesParam) {
    if (categoryId === "laptop" && (seriesParam === "air" || seriesParam === "pro")) {
      return { categoryId, seriesId: "apple" };
    }
    const byId = category.series.find((s) => s.id === seriesParam);
    if (byId) return { categoryId, seriesId: byId.id };
  }
  if (brandParam) {
    const byBrand = category.series.find(
      (s) => s.brand.toLowerCase() === brandParam || s.id === brandParam
    );
    if (byBrand) return { categoryId, seriesId: byBrand.id };
  }
  return { categoryId, seriesId: category.series[0].id };
}

export const PROMISE_CARTOONS = [
  "/images/promise/promise-diy.png",
  "/images/promise/promise-price.png",
  "/images/promise/promise-privacy.png",
  "/images/promise/promise-gallery.png",
] as const;
