import { clear } from "console";
import { PYTHON_IMAGE } from "../constants";
import { createNewDockerContainer } from "./createContainer.util";
import { commands } from "./commands.utils";



const allowListedLanguages = ['python', 'javascript', 'java', 'cpp'];


export interface RunCodeOptions{
    code: string,
    language: 'python' | 'javascript' | 'java' | 'cpp',
    timeLimit?: number, // in milliseconds
    memoryLimit?: number, // in bytes
    imageName?: string,
    input?: string,
    
}
export async function runCode(options : RunCodeOptions){
    const { code, language, timeLimit = 5000, memoryLimit = 1024 * 1024 * 1024 , imageName , input } = options;
    
    if(!allowListedLanguages.includes(language)){
        throw new Error(`Language ${language} is not supported.`);
    }
    
    const container =  await createNewDockerContainer({
            imageName: imageName || PYTHON_IMAGE,
            cmdExecutable: commands[language](code , input || ''),
            memoryLimit: 1024 * 1024 * 1024, // 1 GB
        });
    
        const timeLimitExceededTimeout = setTimeout(async () => {
            console.log("Time limit exceeded. Stopping the container.");
            // container?.remove();
            // container?.kill();
           
        }, options.timeLimit || 5000);


        console.log("Docker container created successfully" , container?.id);
        await container?.start();
    
        const status = await container?.wait();

        console.log("Container exited with status:", status);
    
        const logs = await container?.logs({
            stdout: true,
            stderr: true,
        });
    
        console.log("Container Logs:", logs?.toString());
        // await container?.stop();
        // await container?.remove();

        const sampleOutput = "36"
        const logsString = logs?.toString() ;

        // console.log("Sample Output:", logsString===sampleOutput);

        // await container?.remove();

        clearTimeout(timeLimitExceededTimeout);

        if(status.StatusCode == 0){
            console.log("Code executed successfully");
        }
        else{
            console.log("container exited with error status");
        }
}