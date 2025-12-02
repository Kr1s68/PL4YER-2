class PrinterModule {
  constructor(outputCallback) {
    this.outputCallback = outputCallback;
  }

  print(message, type = "output") {
    if (this.outputCallback) {
      this.outputCallback(message, type);
    }
  }
}

if (typeof window !== "undefined") {
  window.PrinterModule = PrinterModule;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PrinterModule;
}
