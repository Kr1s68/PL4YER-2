class MetaHandler {
  constructor(fsModule, pathModule, printerModule) {
    this.printer = printerModule;
    this.fs = fsModule;
    this.path = pathModule;
  }

  handleClear() {
    // Clear will be handled by the UI directly
    // Return a special flag
    return { action: "clear" };
  }

  handleDate() {
    this.printer.print(new Date().toString(), "success");
  }

  handleVersion() {
    this.printer.print(`Node.js: ${process.versions.node}`, "success");
    this.printer.print(`Chrome: ${process.versions.chrome}`, "success");
    this.printer.print(`Electron: ${process.versions.electron}`, "success");
  }

  handleDebug() {
    this.printer.print("Debug Information:", "info");
    this.printer.print("", "output");

    // Check Node.js modules
    this.printer.print(
      `fs module: ${
        typeof this.fs !== "undefined" ? "Available" : "Not available"
      }`,
      typeof this.fs !== "undefined" ? "success" : "error"
    );
    this.printer.print(
      `path module: ${
        typeof this.path !== "undefined" ? "Available" : "Not available"
      }`,
      typeof this.path !== "undefined" ? "success" : "error"
    );

    // Try to get current directory
    try {
      const cwd = process.cwd();
      this.printer.print(`Current directory: ${cwd}`, "info");
    } catch (error) {
      this.printer.print(`Error getting directory: ${error.message}`, "error");
    }
  }

  handleEcho(command) {
    const message = command.substring(5);
    this.printer.print(message, "success");
  }

  handleCalculator(command) {
    try {
      const expression = command.substring(5);
      const result = eval(expression);
      this.printer.print(`Result: ${result}`, "success");
    } catch (error) {
      this.printer.print(`Error: ${error.message}`, "error");
    }
  }

  handleUnknown(command) {
    this.printer.print(`Unknown command: ${command}`, "error");
    this.printer.print(`Type 'help' for available commands`, "info");
  }
}

if (typeof window !== "undefined") {
  window.MetaHandler = MetaHandler;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = MetaHandler;
}
