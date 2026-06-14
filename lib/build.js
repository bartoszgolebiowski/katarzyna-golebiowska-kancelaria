import { spawn } from "child_process";

const commands = [
  { cmd: "node", args: ["lib/build-pdf.js"] },
  { cmd: "node", args: ["lib/build-site.js", "--no-serve"] },
];

commands.forEach(({ cmd, args }) => {
  const proc = spawn(cmd, args, { stdio: "inherit" });
  proc.on("error", (err) => console.error(`Error starting process: ${err}`));
});
