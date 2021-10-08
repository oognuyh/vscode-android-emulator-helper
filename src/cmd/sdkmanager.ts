import { exec, execSync } from "child_process";
import { ProgressLocation, window } from "vscode";
import { Package } from "../model/package";
import { commandWithProgress, showAutocloseMessage } from "../utils";

export async function getAvailablePackages(): Promise<Package[] | undefined> {
  const stdout: string = await commandWithProgress({
    command: `sdkmanager --list`,
    message: `Loading available packages...`,
  });

  // parse
  const [rawInstalledPackages, rawPackages] = stdout.split(
    "Available Packages:\n"
  );

  return [...rawPackages.matchAll(/.*\|.*\|.*/g)]
    .slice(2)
    .map((rawPackage) => rawPackage[0])
    .map((rawPackage) => Package.from(rawPackage, rawInstalledPackages));
}

export async function installPackages() {
  const availablePackages: Package[] | undefined = await getAvailablePackages();
  if (!availablePackages || availablePackages.length < 1) {
    showAutocloseMessage(
      "No package available. You have to install the package first."
    );
    return;
  }

  const selectedPackages: Package[] | undefined = await window.showQuickPick(
    availablePackages,
    {
      placeHolder: "Select packages you want to install",
      canPickMany: true,
    }
  );
  if (!selectedPackages || selectedPackages.length < 1) {
    showAutocloseMessage("No pacakge selected.");
    return;
  }

  await window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async (progress) => {
      let numOfSelectedPackages: number = selectedPackages.length;
      let numOfInstalledPackages: number = selectedPackages.length;
      let isProcessing: boolean = false;

      await new Promise((resolve, reject) => {
        let interval = setInterval(() => {
          if (!isProcessing) {
            if (selectedPackages.length > 0) {
              const selectedPackage: Package = selectedPackages.shift()!;

              isProcessing = true;
              progress.report({
                message: `${selectedPackage.path} is being installed.`,
              });

              // sdkmanager "something" "something" "something"
              exec(
                `sdkmanager "${selectedPackage.path}"`,
                (error, stdout, stderr) => {
                  if (error) {
                    console.error(stderr);

                    if (stderr.includes("license")) {
                      // if user need to accept the licenses
                      clearInterval(interval);
                      reject();

                      window
                        .showErrorMessage(
                          "You need to accept the licenses before building. You want to accept now?",
                          ...["OK", "Later"]
                        )
                        .then((selection) => {
                          if (selection === "OK") {
                            const result = execSync(
                              "echo yes | sdkmanager --licenses"
                            ).toString();

                            if (result.includes("accepted")) {
                              window.showInformationMessage(
                                "All SDK package licenses accepted. Please try to install again."
                              );
                            } else {
                              window.showErrorMessage(
                                "Can't accept the licenses. Please try manually."
                              );
                            }
                          }
                        });
                    } else {
                      window.showErrorMessage(
                        `Failed to install ${selectedPackage.path}`
                      );

                      numOfInstalledPackages--;
                      isProcessing = false;
                      return;
                    }
                  }

                  // installed successfully
                  progress.report({
                    increment: (1 / numOfSelectedPackages) * 100,
                  });

                  isProcessing = false;
                }
              );
            } else {
              // done
              clearInterval(interval);
              progress.report({
                message: `${numOfInstalledPackages} packages installed successfully.`,
              });

              setTimeout(() => {
                resolve(undefined);
              }, 1500);
            }
          }
        }, 500);
      });
    }
  );
}

export async function getInstalledPackages(
  filter: string | undefined = undefined
): Promise<Package[] | undefined> {
  // load installed packages
  const stdout: string = await commandWithProgress({
    command: `sdkmanager --list_installed`,
    message: `Loading installed packages...`,
  });

  // parse
  let installedPackages: Package[] | undefined = [
    ...stdout.matchAll(/.*\|.*\|.*\|.*\n/g),
  ]
    .map((rawInstalledPackage) => rawInstalledPackage[0])
    .slice(2)
    .map((rawInstalledPackage) => Package.from(rawInstalledPackage, stdout));

  if (filter) {
    installedPackages = installedPackages.filter((installPackage) =>
      installPackage.path.includes(filter)
    );
  }

  return installedPackages;
}

export async function uninstallPackages() {
  const installedPackages: Package[] | undefined = await getInstalledPackages();
  if (!installedPackages || installedPackages.length < 1) {
    showAutocloseMessage("You have no package.");
    return;
  }

  const selectedPackages: Package[] | undefined = await window.showQuickPick(
    installedPackages,
    {
      placeHolder: "Select packages to uninstall",
      canPickMany: true,
    }
  );
  if (!selectedPackages || selectedPackages.length < 1) {
    showAutocloseMessage("No package selected.");
    return;
  }

  await window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async (progress) => {
      let numOfSelectedPackages: number = selectedPackages.length;
      let numOfUninstalledPackages: number = selectedPackages.length;
      let isProcessing: boolean = false;

      await new Promise((resolve) => {
        let interval = setInterval(() => {
          if (!isProcessing) {
            if (selectedPackages.length > 0) {
              const selectedPackage: Package = selectedPackages.shift()!;

              isProcessing = true;
              progress.report({
                message: `${selectedPackage.path} is being uninstalled.`,
              });

              // sdkmanager --uninstall "something" "something" "something"
              exec(
                `sdkmanager --uninstall "${selectedPackage.path}"`,
                (error, stdout, stderr) => {
                  if (error) {
                    window.showErrorMessage(
                      `Failed to uninstall ${selectedPackage.path}`
                    );

                    console.error(stdout);

                    numOfUninstalledPackages--;
                    isProcessing = false;
                    return;
                  }

                  // installed successfully
                  progress.report({
                    increment: (1 / numOfSelectedPackages) * 100,
                  });
                  isProcessing = false;
                }
              );
            } else {
              // done
              progress.report({
                message: `${numOfUninstalledPackages} packages uninstalled successfully.`,
              });

              setTimeout(() => {
                clearInterval(interval);
                resolve(undefined);
              }, 1500);
            }
          }
        }, 500);
      });
    }
  );
}

export async function updateAllInstalledPackages() {
  await window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async (progress) => {
      await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          progress.report({
            message: "All installed packages are being updated.",
          });
        }, 500);

        exec(
          "echo yes | sdkmanager --update --channel=0",
          (error, stdout, stderr) => {
            if (error) {
              console.error(stderr);

              if (stderr.includes("license")) {
                // if user need to accept the licenses
                clearInterval(interval);
                reject();

                window
                  .showErrorMessage(
                    "You need to accept the licenses before building. You want to accept now?",
                    ...["OK", "Later"]
                  )
                  .then((selection) => {
                    if (selection === "OK") {
                      const result = execSync(
                        "echo yes | sdkmanager --licenses"
                      ).toString();

                      if (result.includes("accepted")) {
                        window.showInformationMessage(
                          "All SDK package licenses accepted. Please try to update again."
                        );
                      } else {
                        window.showErrorMessage(
                          "Can't accept the licenses. Please try manually."
                        );
                      }
                    }
                  });
              } else {
                window.showErrorMessage(`Failed to update the packages.`);
              }
            }

            clearInterval(interval);
            progress.report({
              message: stdout.includes("No updates available")
                ? "No updates available."
                : "All pacakges updated successfully.",
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
