import { QuickPickItem } from "vscode";
import { Package } from "./package";

export class Avd implements QuickPickItem {
  label: string;
  description: string;
  detail: string;

  name: string;
  device: string;
  basedOn: string;
  package: Package | undefined;

  constructor(name: string, device: string, basedOn: string) {
    this.label = this.name = name;
    this.description = this.device = device;
    this.basedOn = this.detail = basedOn;
  }

  static from(rawAvd: string): Avd {
    const name: string =
      rawAvd
        .match(/name: (.)+/i)
        ?.shift()
        ?.replace(/name: /i, "") || "";
    const device: string =
      rawAvd
        .match(/device: (.)+/gi)
        ?.shift()
        ?.replace(/device: /i, "") || "";
    const basedOn: string =
      rawAvd
        .match(/based on: (.)+Tag\/ABI/i)
        ?.shift()
        ?.replace(/based on: |tag\/abi/gi, "") || "";

    return new Avd(name, device, basedOn);
  }
}
