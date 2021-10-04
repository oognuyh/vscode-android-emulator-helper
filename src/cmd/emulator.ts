import { exec } from "child_process";
import { ProgressLocation, window, workspace } from "vscode";
import { Avd } from "../model/avd";
import { showAutocloseMessage } from "../utils";
import { getAvailableAvds } from "./avdmanager";

export async function runEmulator() {
  const availableAvds: Avd[] | undefined = await getAvailableAvds();
  if (!availableAvds || availableAvds.length < 1) {
    showAutocloseMessage("You have no available AVD. Please create AVD first.");
    return;
  }

  const selectedAvd: Avd | undefined = await window.showQuickPick(
    availableAvds,
    {
      placeHolder: "Select AVD to run",
      canPickMany: false,
    }
  );
  if (!selectedAvd) {
    showAutocloseMessage("No AVD selected.");
    return;
  }

  const additonalEmulatorRunOpts: string =
    workspace
      .getConfiguration("android-emulator-helper")
      .get("emulator-run-opts") || "";

  window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async (progress) => {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          progress.report({
            message: `${selectedAvd.name} is being loaded.`,
          });
        });

        const command: string = `emulator @${selectedAvd.name} ${additonalEmulatorRunOpts} > /dev/null 2>&1 &`;

        exec(command, async (error, stdout, stderr) => {
          if (error) {
            console.error(stderr);
            window.showErrorMessage(`Failed to run ${command}.`);
          }

          clearInterval(interval);
          progress.report({
            message: `${selectedAvd.name} is successfully loaded.`,
          });

          setTimeout(() => {
            resolve(undefined);
          }, 1000);
        });
      });
    }
  );
}
