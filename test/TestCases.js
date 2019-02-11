const should = require("should");
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");

const execPath = path.resolve("npshell");
const workspaceDir = path.resolve("test/_workspace");

describe("TestCases", () => {
  shell.cd("test");

  shell
    .ls("-l", "cases")
    .filter(c => c && c.name.charAt(0) != "_")
    .forEach(item => {
      describe(item.name, () => {
        let testItemDir = path.resolve("cases", item.name);
        shell.mkdir("-p", path.join(testItemDir, "_template"));
        shell.exec("make", {
          silent: true,
          cwd: path.join(testItemDir, "_prepare")
        });
        const itemWorkSpace = path.resolve(workspaceDir, item.name);

        shell
          .ls("-l", testItemDir)
          .filter((c, i) => c && c.name.charAt(0) != "_")
          .forEach(c => {
            const caseWorkSpace = path.join(itemWorkSpace, c.name);
            shell.mkdir("-p", caseWorkSpace);
            shell.cp(
              "-R",
              path.join(testItemDir, "_template/*"),
              caseWorkSpace
            );

            let testCaseDir = path.join(testItemDir, c.name);
            it(c.name, () => {
              shell
                .exec(
                  `${execPath} < ${path.join(testCaseDir, "in.txt")} 2>&1`,
                  {
                    silent: true,
                    cwd: caseWorkSpace
                  }
                )
                .stdout.should.be.eql(
                  fs.readFileSync(path.join(testCaseDir, "out.txt")).toString()
                );
            }).timeout(10000);
          });

        after(function() {
          shell.rm("-Rf", itemWorkSpace);
        });
      });
    });
});
