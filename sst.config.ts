/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "remix-tutorial-pruebas",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          profile: "sandbox",
        }
      }
    };
  },
  async run() {
    new sst.aws.Remix("MyWeb");
  },
});
