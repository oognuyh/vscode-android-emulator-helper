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

  static from(raw: string): Avd {
    /*
     *      Name: PIXEL_XL_28
     *    Device: pixel (Google)
     *      Path: /home/$USER/.android/avd/PIXEL_XL_28.avd
     *    Target: Google APIs (Google Inc.)
     *  Based on: Android 9.0 (Pie) Tag/ABI: google_apis/x86
     *    Sdcard: 512 MB
     */
    const [name, device, path, target, basedOn, sdCard]: string[] = raw
      .trim()
      .split("\n")
      .map((row) => row.split(":")[1].trim());

    return new Avd(name, device, basedOn.replace("Tag/ABI", "").trim());
  }
}
