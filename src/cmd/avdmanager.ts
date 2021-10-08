import { window, workspace } from "vscode";
import { Avd } from "../model/avd";
import { Package } from "../model/package";
import { commandWithProgress, showAutocloseMessage } from "../utils";
import { getInstalledPackages } from "./sdkmanager";

export async function createAvd() {
  // get installed pacakges
  const installedPackages = await getInstalledPackages("system-images;");
  if (!installedPackages || installedPackages.length < 1) {
    showAutocloseMessage(
      "No package available. You have to install the package first."
    );
    return;
  }

  // get package
  const selectedPackage: Package | undefined = await window.showQuickPick(
    installedPackages,
    {
      placeHolder: "Select a system image",
      canPickMany: false,
    }
  );
  if (!selectedPackage) {
    showAutocloseMessage("Can not create avd without package.");
    return;
  }

  const availableAvds = (await getAvailableAvds()) || [];

  // get new AVD name
  const newAvdName = await window.showInputBox({
    placeHolder: "Enter a new AVD name. (Must be unique)",
    validateInput: (name) => {
      if (name.match(/[^a-zA-Z0-9_]/)) {
        return `${name} is invalid! Must be [a-zA-Z0-9_]`;
      } else if (name.trim() === "") {
        return "Can't be blank!";
      } else if (
        availableAvds.filter((availableAvd) => availableAvd.name === name)
          .length > 0
      ) {
        return `${name} already exits!`;
      } else {
        return null;
      }
    },
  });
  if (!newAvdName) {
    showAutocloseMessage("Can not create AVD without name.");
    return;
  }

  const additionalAvdCreationOpts: string =
    workspace
      .getConfiguration("android-emulator-helper")
      .get("avd-creation-opts") || "";

  const command: string = `echo no | avdmanager create avd -n ${newAvdName} -k "${selectedPackage.path}" -f ${additionalAvdCreationOpts}`;
  await commandWithProgress({
    command: command,
    message: `${newAvdName} is being created...`,
    successMessage: `${newAvdName} created successfully.`,
    failureMessage: `Failed to create ${newAvdName} with the command: ${command}.`,
  });
}

export async function deleteAvd() {
  // get available AVDs
  const availableAvds: Avd[] | undefined = await getAvailableAvds();
  if (!availableAvds || availableAvds.length < 1) {
    showAutocloseMessage("You have no available AVD. Please create AVD first.");
    return;
  }

  // get AVD
  const selectedAvd: Avd | undefined = await window.showQuickPick(
    availableAvds,
    {
      placeHolder: "Select AVD name",
      canPickMany: false,
    }
  );
  if (!selectedAvd) {
    showAutocloseMessage("No AVD selected.");
    return;
  }

  const command = `avdmanager delete avd -n ${selectedAvd.name}`;
  await commandWithProgress({
    command: command,
    message: `${selectedAvd.name} is being deleted...`,
    successMessage: `${selectedAvd.name} deleted successfully.`,
    failureMessage: `Failed to delete ${selectedAvd.name} with the command: ${command}.`,
  });
}

export async function getAvailableAvds(): Promise<Avd[] | undefined> {
  const stdout: string = await commandWithProgress({
    command: "avdmanager list avd",
    message: "Loading available AVDs...",
  });

  const availableAvds: Avd[] | undefined = stdout
    .replace("Available Android Virtual Devices:\n", "")
    .split("---------\n")
    .map((rawAvailableAvd) => Avd.from(rawAvailableAvd));

  return availableAvds;
}
