import { exec } from "child_process";
import { ProgressLocation, window } from "vscode";

interface CommandWithProgressProps {
  command: string;
  message: string;
  successMessage?: string;
  failureMessage?: string;
}

export const commandWithProgress = async ({
  command,
  message,
  successMessage,
  failureMessage,
}: CommandWithProgressProps): Promise<string> => {
  return window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async (progress) =>
      new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          progress.report({
            message: message,
          });
        });

        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(stderr);
            window.showErrorMessage(
              failureMessage || `Failed to command: ${command}`
            );
            reject();
          }

          clearInterval(interval);

          progress.report({
            message: successMessage,
          });

          setTimeout(
            () => {
              resolve(stdout);
            },
            successMessage ? 1500 : 0
          );
        });
      })
  );
};

export const showAutocloseMessage = (message: string, s: number = 3) => {
  window.withProgress(
    {
      location: ProgressLocation.Notification,
    },
    async (progress) => {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          progress.report({
            message: message,
            increment: 100,
          });
        }, 500);

        setTimeout(() => {
          clearInterval(interval);
          resolve(undefined);
        }, s * 1000);
      });
    }
  );
};
