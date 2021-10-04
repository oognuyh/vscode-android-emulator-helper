import * as vscode from "vscode";
import {
  installPackages,
  uninstallPackages,
  updateAllInstalledPackages,
} from "./cmd/sdkmanager";
import { createAvd, deleteAvd } from "./cmd/avdmanager";
import { runEmulator } from "./cmd/emulator";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "android-emulator-helper.install-packages",
      () => {
        installPackages();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "android-emulator-helper.uninstall-packages",
      () => {
        uninstallPackages();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "android-emulator-helper.create-avd",
      () => {
        createAvd();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "android-emulator-helper.delete-avd",
      () => {
        deleteAvd();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "android-emulator-helper.run-emulator",
      () => {
        runEmulator();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "android-emulator-helper.update-all-installed-packages",
      () => {
        updateAllInstalledPackages();
      }
    )
  );
}

export function deactivate() {}
