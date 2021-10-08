import { window, workspace } from "vscode";
import { Avd } from "../model/avd";
import { commandWithProgress, showAutocloseMessage } from "../utils";
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

  const command: string = `emulator @${selectedAvd.name} ${additonalEmulatorRunOpts} > /dev/null 2>&1 &`;
  await commandWithProgress({
    command: command,
    message: `${selectedAvd.name} is being loaded...`,
    successMessage: `${selectedAvd.name} is successfully loaded.`,
    failureMessage: `Failed to load ${selectedAvd.name} with the command: ${command}.`,
  });
}
