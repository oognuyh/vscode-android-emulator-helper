# <img src="https://raw.githubusercontent.com/oognuyh/vscode-android-emulator-helper/master/images/logo.png" width="48" height="48" /> Android Emulator Helper [![Version](https://vsmarketplacebadge.apphb.com/version/oognuyh.android-emulator-helper.svg)](https://marketplace.visualstudio.com/items?itemName=oognuyh.android-emulator-helper) [![Installs](https://vsmarketplacebadge.apphb.com/installs-short/oognuyh.android-emulator-helper.svg)](https://marketplace.visualstudio.com/items?itemName=oognuyh.android-emulator-helper)

A Visual Studio Code extension that makes it easy to manage Android emulators.

## Features

| Create AVD | Delete AVD | Run Emulator |
|:---:|:---:|:---:|
| ![](https://raw.githubusercontent.com/oognuyh/vscode-android-emulator-helper/master/images/create-avd.gif) | ![](https://raw.githubusercontent.com/oognuyh/vscode-android-emulator-helper/master/images/delete-avd.gif) | ![](https://raw.githubusercontent.com/oognuyh/vscode-android-emulator-helper/master/images/run-emulator.gif) |

| Install Packages | Uninstall Packages | Update Installed Packages |
|:---:|:---:|:---:|
|![](https://raw.githubusercontent.com/oognuyh/vscode-android-emulator-helper/master/images/install-packages.gif) |![](https://raw.githubusercontent.com/oognuyh/vscode-android-emulator-helper/master/images/uninstall-packages.gif) | ![](https://raw.githubusercontent.com/oognuyh/vscode-android-emulator-helper/master/images/update-installed-packages.gif) |


> Note: If you encounter problems with SDK licenses, you can accept by clicking the ok button in the message. Please try again after this.

## Quick Start

- Install [Android Emulator Helper](https://marketplace.visualstudio.com/items?itemName=oognuyh.android-emulator-helper) extension.
- Open Cammand Palette (`Ctrl + Shift + p`).
- type Android Emulator Helper and choose a command.
    - Android Emulator Helper: Run Emulator
    - Android Emulator Helper: Create New AVD
    - Android Emulator Helper: Delete AVD
    - Android Emulator Helper: Install Packages
    - Android Emulator Helper: Uninstall Packages
    - Android Emulator Helper: Update All Installed Packages

## Settings Options

- android-emulator-helper.emulator-run-opts

    You can run your emulator with additional options. such as removing boot animation or resolution.
    Please refer to following page: [emulator options](https://android-doc.github.io/tools/help/emulator.html)


- android-emulator-helper.avd-creation-opts

    You can create your AVD with additional options. such as setting up a specific device.
    Please refer to following page: [avdmanager options](https://android-doc.github.io/tools/devices/managing-avds-cmdline.html)

- Example
    ```
    "android-emulator-helper": {
        "emulator-run-opts": "-no-boot-anim -wipe-data",
        "avd-creation-opts": "-d 30"
    }
    ```

## Requirements

- Android SDK
- Enviroment PATH variable
    - cmdline-tools/latest/bin or tools/bin
    - emulator
    - platform-tools
