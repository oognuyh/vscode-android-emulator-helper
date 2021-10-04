import { QuickPickItem } from "vscode";

export class Package implements QuickPickItem {
  label: string;
  description: string;
  detail: string | undefined;

  isInstalled: boolean;
  path: string;
  version: string;

  constructor(
    path: string,
    version: string,
    description: string,
    isInstalled: boolean
  ) {
    this.path = this.label = path;
    this.version = version;
    this.description = description;
    this.isInstalled = isInstalled;

    if (this.isInstalled) {
      this.detail = "installed";
    }
  }

  static from(rawPackage: string, rawInstalledPackages: string): Package {
    const [path, version, description, ...etc]: string[] = rawPackage
      .split("|")
      .map((col) => col.trim());

    return new Package(
      path,
      version,
      description,
      rawInstalledPackages.includes(path)
    );
  }
}
