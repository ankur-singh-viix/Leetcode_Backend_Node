import { PYTHON_IMAGE } from "../constants";
import { createNewDockerContainer } from "./createContainer.util";

export async function runPythonCode(code: string){
    const runCommand = `echo '${code}' > code.py && python3 code.py`;
    
        const container =  await createNewDockerContainer({
            imageName: PYTHON_IMAGE,
            cmdExecutable: ['/bin/bash', '-c', runCommand],
            memoryLimit: 1024 * 1024 * 1024, // 1 GB
        });
    
        console.log("Docker container created successfully");
        await container?.start();
    
        const status = await container?.wait();
        console.log("Container exited with status:", status);
    
        const logs = await container?.logs({
            stdout: true,
            stderr: true,
        });
    
        console.log("Container Logs:", logs?.toString());
        // await container?.stop();
        await container?.remove();
}