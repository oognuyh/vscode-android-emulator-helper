import { exec, execSync } from "child_process";
import { ProgressLocation, window, workspace } from "vscode";
import { Avd } from "../model/avd";
import { Package } from "../model/package";
import { showAutocloseMessage } from "../utils";
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
    showAutocloseMessage("Can't create AVD without name.");
    return;
  }

  const additionalAvdCreationOpts: string =
    workspace
      .getConfiguration("android-emulator-helper")
      .get("avd-creation-opts") || "";

  window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async (progress) => {
      // create the AVD
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          progress.report({ message: `${newAvdName} is being created.` });
        }, 1000);

        const command: string = `echo no | avdmanager create avd -n ${newAvdName} -k "${selectedPackage.path}" -f ${additionalAvdCreationOpts}`;

        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(stderr);
            window.showErrorMessage(`Failed to execute ${command}.`);
          }

          clearInterval(interval);
          progress.report({
            message: error
              ? `Failed to create ${newAvdName}.`
              : `${newAvdName} created successfully.`,
          });

          setTimeout(() => {
            resolve(undefined);
          }, 2000);
        });
      });
    }
  );
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

  window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async (progress) => {
      // delete the AVD
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          progress.report({ message: `${selectedAvd.name} is being deleted.` });
        }, 1000);

        exec(
          `avdmanager delete avd -n ${selectedAvd.name}`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(stderr);
              window.showErrorMessage(`Failed to delete ${selectedAvd.name}.`);
            }

            clearInterval(interval);
            progress.report({
              message: error
                ? `Failed to delete ${selectedAvd.name}.`
                : `${selectedAvd.name} deleted successfully.`,
            });

            setTimeout(() => {
              resolve(undefined);
            }, 2000);
          }
        );
      });
    }
  );
}

export async function getAvailableAvds(): Promise<Avd[] | undefined> {
  try {
    const stdout = Buffer.from(execSync("avdmanager list avd"))
      .toString()
      .replace("Available Android Virtual Devices:\n", "");

    const availableAvds: Avd[] | undefined = stdout
      .split("---------\n")
      .map((rawAvailableAvd) => Avd.from(rawAvailableAvd));

    return availableAvds;
  } catch (error) {
    console.error(error);

    window.showErrorMessage("command not found: avdmanager");
  }
}
