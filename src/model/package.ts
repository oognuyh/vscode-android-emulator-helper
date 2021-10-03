import { QuickPickItem } from "vscode";

export class Package implements QuickPickItem {
  label: string;
  description: string;
  detail: string | undefined;

  isInstalled: boolean;
  path: string;
  version: string;

  constructor(rawPackage: string, rawInstalledPackages: string) {
    const cols = rawPackage.split("|").map((col) => col.trim());

    this.path = this.label = cols[0];
    this.version = cols[1];
    this.description = cols[2];
    this.isInstalled = rawInstalledPackages.includes(this.label);

    if (this.isInstalled) {
      this.detail = "installed";
    }
  }

  static from(rawPackage: string, rawInstalledPackages: string): Package {
    return new Package(rawPackage, rawInstalledPackages);
  }
}
