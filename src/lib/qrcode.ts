import QRCode from "qrcode";

export async function genererQrDataUrl(valeur: string): Promise<string> {
  return QRCode.toDataURL(valeur, {
    margin: 1,
    width: 240,
    color: { dark: "#22303F", light: "#FBF7EF" },
  });
}
