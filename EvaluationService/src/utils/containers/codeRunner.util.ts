import { InternalServerError } from "../errors/app.error";
import { commands } from "./commands.utils";
import { createNewDockerContainer } from "./createContainer.util";

const allowListedLanguage = ["python", "cpp"];

export interface RunCodeOptions {
    code: string,
    language: "python"| "cpp",
    timeout: number,
    imageName: string,
    input: string
}

export async function runCode(options: RunCodeOptions) {

const { code, language, timeout, imageName, input } = options;

    if(!allowListedLanguage.includes(language)) {
    throw new InternalServerError(`Invalid language: ${language}`);
}

const container = await createNewDockerContainer({
    imageName: imageName,
    cmdExecutable: commands[language](code, input),
    memoryLimit: 1024 * 1024 * 1024, // 1GB
});

    let isTimeLimitExceeded = false;
    const timeLimitExceededTimeout = setTimeout(() => {
    console.log("Time limit exceeded");
        isTimeLimitExceeded = true;
    container?.kill();
}, timeout);

    // console.log("Container created successfully", container?.id);

await container?.start();

const status = await container?.wait();

    // console.log("Container status", status);
    if(isTimeLimitExceeded) {
        await container?.remove();
        return {
            status: "time_limit_exceeded",
            output: "Time limit exceeded"
        }
    }

const logs = await container?.logs({
            stdout: true,
            stderr: true
});


const containerLogs = processLogs(logs);

    console.log("Container logs", containerLogs);

    await container?.remove();

clearTimeout(timeLimitExceededTimeout);

if(status.StatusCode == 0) {
// success  
        // console.log("Container exited successfully");
        return {
            status: "success",
            output: containerLogs
        }
} else {
        // console.log("Container exited with error");
        return {
            status: "failed",
            output: containerLogs
        }
    }   
}
function processLogs(logs: Buffer | null | undefined): string {
    if (!logs) return "";

    let i = 0;
    let output = "";

    while (i < logs.length) {
        const streamType = logs[i]; // 1 = stdout, 2 = stderr
        const length = logs.readUInt32BE(i + 4);

        const payload = logs.slice(i + 8, i + 8 + length).toString("utf-8");

        if (streamType === 1) {
            output += payload;
        }

        i += 8 + length;
    }

    return output.trim();
}
