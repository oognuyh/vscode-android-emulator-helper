import { ProgressLocation, window } from "vscode";

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
